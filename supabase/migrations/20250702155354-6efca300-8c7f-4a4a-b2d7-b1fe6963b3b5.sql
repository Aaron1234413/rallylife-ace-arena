-- Stakes Distribution System for Session Completion

-- Create complete_session function with stakes distribution
CREATE OR REPLACE FUNCTION public.complete_session(
  session_id_param UUID,
  winner_id_param UUID DEFAULT NULL,
  completion_type TEXT DEFAULT 'normal'
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_record RECORD;
  total_stakes INTEGER := 0;
  participant_count INTEGER := 0;
  organizer_share INTEGER := 0;
  participant_share INTEGER := 0;
  result JSON;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param AND status = 'active';
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found or not active');
  END IF;
  
  -- Count participants and calculate total stakes
  SELECT COUNT(*) INTO participant_count
  FROM public.session_participants
  WHERE session_id = session_id_param AND status = 'joined';
  
  total_stakes := session_record.stakes_amount * participant_count;
  
  -- Update session status
  UPDATE public.sessions
  SET 
    status = 'completed',
    updated_at = now()
  WHERE id = session_id_param;
  
  -- Distribute stakes if any
  IF total_stakes > 0 THEN
    IF session_record.session_type = 'match' THEN
      -- Winner-takes-all for competitive matches
      IF winner_id_param IS NOT NULL THEN
        PERFORM public.add_tokens(
          winner_id_param,
          total_stakes,
          'regular',
          'session_winnings',
          'Match winnings from stakes pool'
        );
      ELSE
        -- If no winner specified, split equally among participants
        participant_share := total_stakes / participant_count;
        FOR participant_record IN 
          SELECT user_id FROM public.session_participants 
          WHERE session_id = session_id_param AND status = 'joined'
        LOOP
          PERFORM public.add_tokens(
            participant_record.user_id,
            participant_share,
            'regular',
            'session_refund',
            'Stakes refund - no winner declared'
          );
        END LOOP;
      END IF;
    ELSE
      -- 60/40 split for social sessions (organizer gets 60%, participants split 40%)
      organizer_share := ROUND(total_stakes * 0.6);
      participant_share := (total_stakes - organizer_share) / participant_count;
      
      -- Give organizer their share
      PERFORM public.add_tokens(
        session_record.creator_id,
        organizer_share,
        'regular',
        'session_organizer_bonus',
        'Organizer bonus from social session'
      );
      
      -- Give each participant their share
      FOR participant_record IN 
        SELECT user_id FROM public.session_participants 
        WHERE session_id = session_id_param AND status = 'joined'
      LOOP
        PERFORM public.add_tokens(
          participant_record.user_id,
          participant_share,
          'regular',
          'session_participation_reward',
          'Participation reward from social session'
        );
      END LOOP;
    END IF;
  END IF;
  
  result := json_build_object(
    'success', true,
    'session_type', session_record.session_type,
    'total_stakes', total_stakes,
    'participant_count', participant_count,
    'distribution_type', CASE 
      WHEN session_record.session_type = 'match' THEN 'winner_takes_all'
      ELSE '60_40_split'
    END,
    'organizer_share', CASE 
      WHEN session_record.session_type = 'match' THEN 0
      ELSE organizer_share
    END,
    'participant_share', participant_share,
    'winner_id', winner_id_param
  );
  
  RETURN result;
END;
$$;

-- Create session_stakes_transactions table to track stakes distribution
CREATE TABLE IF NOT EXISTS public.session_stakes_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('stake_in', 'stake_out', 'winnings', 'refund')),
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on stakes transactions
ALTER TABLE public.session_stakes_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for stakes transactions
CREATE POLICY "Users can view their own stakes transactions" ON public.session_stakes_transactions
  FOR SELECT USING (user_id = auth.uid());

-- Create function to log stakes transactions
CREATE OR REPLACE FUNCTION public.log_stakes_transaction(
  session_id_param UUID,
  user_id_param UUID,
  transaction_type_param TEXT,
  amount_param INTEGER,
  description_param TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.session_stakes_transactions (
    session_id, user_id, transaction_type, amount, description
  ) VALUES (
    session_id_param, user_id_param, transaction_type_param, amount_param, description_param
  );
END;
$$;

-- Update existing functions to log stakes transactions
CREATE OR REPLACE FUNCTION public.join_session(
  session_id_param UUID,
  user_id_param UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_count INTEGER;
  result JSON;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param AND status = 'waiting';
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found or not accepting players');
  END IF;
  
  -- Count current participants
  SELECT COUNT(*) INTO participant_count
  FROM public.session_participants
  WHERE session_id = session_id_param AND status = 'joined';
  
  -- Check if session is full
  IF participant_count >= session_record.max_players THEN
    RETURN json_build_object('success', false, 'error', 'Session is full');
  END IF;
  
  -- Check if user already joined
  IF EXISTS (
    SELECT 1 FROM public.session_participants
    WHERE session_id = session_id_param AND user_id = user_id_param AND status = 'joined'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Already joined this session');
  END IF;
  
  -- Charge stakes if any
  IF session_record.stakes_amount > 0 THEN
    PERFORM public.spend_tokens(
      user_id_param,
      session_record.stakes_amount,
      'regular',
      'session_stakes',
      'Stakes for joining session'
    );
    
    -- Log stakes transaction
    PERFORM public.log_stakes_transaction(
      session_id_param,
      user_id_param,
      'stake_in',
      session_record.stakes_amount,
      'Staked tokens for session entry'
    );
  END IF;
  
  -- Add participant
  INSERT INTO public.session_participants (session_id, user_id)
  VALUES (session_id_param, user_id_param)
  ON CONFLICT (session_id, user_id) DO UPDATE SET
    status = 'joined',
    left_at = NULL,
    updated_at = now();
  
  -- Update participant count
  participant_count := participant_count + 1;
  
  result := json_build_object(
    'success', true,
    'participant_count', participant_count,
    'session_ready', participant_count >= session_record.max_players
  );
  
  RETURN result;
END;
$$;