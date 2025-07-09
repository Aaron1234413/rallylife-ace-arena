-- Phase 1: Enhanced Session Status Management and Completion Flow

-- First, let's enhance the sessions table with better status tracking
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS session_result JSONB DEFAULT '{}'::jsonb;

-- Update the session status constraint to include more states
ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS sessions_status_check;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_status_check 
CHECK (status IN ('waiting', 'active', 'completed', 'cancelled', 'full'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_status_created ON public.sessions(status, created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_creator_status ON public.sessions(creator_id, status);

-- Enhanced join_session function with proper status management
CREATE OR REPLACE FUNCTION public.join_session(
  session_id_param UUID,
  user_id_param UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_count INTEGER;
  required_tokens INTEGER;
  user_tokens INTEGER;
  result JSON;
  is_creator BOOLEAN := false;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;
  
  -- Check if session is in waiting status
  IF session_record.status NOT IN ('waiting', 'active') THEN
    RETURN json_build_object('success', false, 'error', 'Session is not accepting participants');
  END IF;
  
  -- Check if user is the creator
  is_creator := (session_record.creator_id = user_id_param);
  
  -- Count current participants (including creator)
  SELECT COUNT(*) INTO participant_count
  FROM public.session_participants
  WHERE session_id = session_id_param;
  
  -- If no participants exist and user is creator, add creator as first participant
  IF participant_count = 0 AND is_creator THEN
    INSERT INTO public.session_participants (
      session_id, user_id, role, payment_status, tokens_paid
    ) VALUES (
      session_id_param, user_id_param, 'organizer', 'waived', 0
    );
    participant_count := 1;
  END IF;
  
  -- Check if session is full (but allow creator to always join)
  IF participant_count >= session_record.max_players AND NOT is_creator THEN
    -- Update session status to full
    UPDATE public.sessions
    SET status = 'full', current_participants = participant_count, updated_at = now()
    WHERE id = session_id_param;
    
    RETURN json_build_object('success', false, 'error', 'Session is full');
  END IF;
  
  -- Check if user already joined
  IF EXISTS (
    SELECT 1 FROM public.session_participants 
    WHERE session_id = session_id_param AND user_id = user_id_param
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Already joined this session');
  END IF;
  
  -- Handle token requirements for non-creators
  required_tokens := COALESCE(session_record.stakes_amount, 0);
  
  IF required_tokens > 0 AND NOT is_creator THEN
    SELECT regular_tokens INTO user_tokens
    FROM public.token_balances
    WHERE player_id = user_id_param;
    
    IF COALESCE(user_tokens, 0) < required_tokens THEN
      RETURN json_build_object('success', false, 'error', 'Insufficient tokens');
    END IF;
    
    -- Deduct tokens if required
    UPDATE public.token_balances
    SET regular_tokens = regular_tokens - required_tokens,
        updated_at = now()
    WHERE player_id = user_id_param;
    
    -- Log transaction
    INSERT INTO public.token_transactions (
      player_id, transaction_type, token_type, amount, source, description
    ) VALUES (
      user_id_param, 'spend', 'regular', required_tokens, 'session_join',
      'Joined session: ' || COALESCE(session_record.session_type, 'session')
    );
  END IF;
  
  -- Add participant (if not creator, since creator was already added)
  IF NOT is_creator THEN
    INSERT INTO public.session_participants (
      session_id, user_id, role, 
      payment_status, tokens_paid
    ) VALUES (
      session_id_param, user_id_param, 'participant',
      CASE WHEN required_tokens > 0 THEN 'paid' ELSE 'waived' END,
      required_tokens
    );
    participant_count := participant_count + 1;
  END IF;
  
  -- Update session participant count and status
  UPDATE public.sessions
  SET 
    current_participants = participant_count,
    status = CASE 
      WHEN participant_count >= max_players THEN 'full'
      ELSE status
    END,
    updated_at = now()
  WHERE id = session_id_param;
  
  result := json_build_object(
    'success', true,
    'tokens_paid', CASE WHEN is_creator THEN 0 ELSE required_tokens END,
    'participant_count', participant_count,
    'session_full', participant_count >= session_record.max_players,
    'role', CASE WHEN is_creator THEN 'organizer' ELSE 'participant' END
  );
  
  RETURN result;
END;
$$;

-- Create session completion function
CREATE OR REPLACE FUNCTION public.complete_session(
  session_id_param UUID,
  winner_id_param UUID DEFAULT NULL,
  session_result_param JSONB DEFAULT '{}'::jsonb
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_record RECORD;
  total_stakes INTEGER := 0;
  winner_reward INTEGER := 0;
  result JSON;
BEGIN
  -- Get session details and verify user can complete it
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;
  
  -- Only creator can complete the session
  IF session_record.creator_id != auth.uid() THEN
    RETURN json_build_object('success', false, 'error', 'Only session creator can complete the session');
  END IF;
  
  -- Check if session is in appropriate status
  IF session_record.status NOT IN ('active', 'full', 'waiting') THEN
    RETURN json_build_object('success', false, 'error', 'Session cannot be completed in current status');
  END IF;
  
  -- Calculate total stakes collected
  SELECT COALESCE(SUM(tokens_paid), 0) INTO total_stakes
  FROM public.session_participants
  WHERE session_id = session_id_param;
  
  -- If there's a winner and stakes, award the winner
  IF winner_id_param IS NOT NULL AND total_stakes > 0 THEN
    -- Verify winner is a participant
    IF EXISTS (
      SELECT 1 FROM public.session_participants 
      WHERE session_id = session_id_param AND user_id = winner_id_param
    ) THEN
      winner_reward := total_stakes;
      
      -- Award tokens to winner
      INSERT INTO public.token_balances (player_id, regular_tokens)
      VALUES (winner_id_param, winner_reward)
      ON CONFLICT (player_id) 
      DO UPDATE SET 
        regular_tokens = token_balances.regular_tokens + winner_reward,
        updated_at = now();
      
      -- Log the reward transaction
      INSERT INTO public.token_transactions (
        player_id, transaction_type, token_type, amount, source, description
      ) VALUES (
        winner_id_param, 'earn', 'regular', winner_reward, 'session_win',
        'Won session: ' || COALESCE(session_record.session_type, 'session')
      );
    END IF;
  END IF;
  
  -- Update session as completed
  UPDATE public.sessions
  SET 
    status = 'completed',
    completed_at = now(),
    winner_id = winner_id_param,
    session_result = session_result_param,
    updated_at = now()
  WHERE id = session_id_param;
  
  -- Update all participants' attendance status
  UPDATE public.session_participants
  SET 
    attendance_status = 'attended',
    updated_at = now()
  WHERE session_id = session_id_param;
  
  result := json_build_object(
    'success', true,
    'session_id', session_id_param,
    'winner_id', winner_id_param,
    'total_stakes', total_stakes,
    'winner_reward', winner_reward,
    'participants_count', session_record.current_participants
  );
  
  RETURN result;
END;
$$;

-- Create function to start a session (for when it's ready)
CREATE OR REPLACE FUNCTION public.start_session(
  session_id_param UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  result JSON;
BEGIN
  -- Get session details and verify user can start it
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;
  
  -- Only creator can start the session
  IF session_record.creator_id != auth.uid() THEN
    RETURN json_build_object('success', false, 'error', 'Only session creator can start the session');
  END IF;
  
  -- Check if session has enough participants
  IF session_record.current_participants < 2 THEN
    RETURN json_build_object('success', false, 'error', 'Need at least 2 participants to start');
  END IF;
  
  -- Update session to active
  UPDATE public.sessions
  SET 
    status = 'active',
    started_at = now(),
    updated_at = now()
  WHERE id = session_id_param;
  
  result := json_build_object(
    'success', true,
    'session_id', session_id_param,
    'status', 'active',
    'participants_count', session_record.current_participants
  );
  
  RETURN result;
END;
$$;

-- Enable realtime for sessions and session_participants
ALTER TABLE public.sessions REPLICA IDENTITY FULL;
ALTER TABLE public.session_participants REPLICA IDENTITY FULL;

-- Add tables to realtime publication if not already added
DO $$
BEGIN
  -- Check if tables are already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'session_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.session_participants;
  END IF;
END $$;