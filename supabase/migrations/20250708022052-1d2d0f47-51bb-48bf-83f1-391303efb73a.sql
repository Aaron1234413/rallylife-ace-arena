-- Complete Phase 4: Open Sessions System migration
-- (session_participants table already exists, creating remaining components)

-- Create open_sessions table for member/coach created sessions
CREATE TABLE public.open_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  creator_type TEXT NOT NULL CHECK (creator_type IN ('member', 'coach')),
  session_type TEXT NOT NULL CHECK (session_type IN ('practice', 'lesson', 'tournament', 'casual', 'clinic')),
  title TEXT NOT NULL,
  description TEXT,
  court_id UUID,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  skill_level_min NUMERIC,
  skill_level_max NUMERIC,
  max_participants INTEGER NOT NULL DEFAULT 4,
  current_participants INTEGER NOT NULL DEFAULT 1,
  cost_per_person_tokens INTEGER NOT NULL DEFAULT 0,
  cost_per_person_money NUMERIC NOT NULL DEFAULT 0.00,
  payment_method TEXT NOT NULL DEFAULT 'tokens' CHECK (payment_method IN ('tokens', 'money', 'hybrid')),
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,
  session_notes TEXT,
  equipment_provided JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'in_progress', 'completed', 'cancelled')),
  cancelled_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_open_sessions_club_date ON public.open_sessions(club_id, scheduled_date);
CREATE INDEX idx_open_sessions_creator ON public.open_sessions(creator_id, status);
CREATE INDEX idx_open_sessions_status_date ON public.open_sessions(status, scheduled_date, start_time);
CREATE INDEX idx_open_sessions_skill_level ON public.open_sessions(skill_level_min, skill_level_max);

-- Enable Row Level Security on open_sessions
ALTER TABLE public.open_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for open_sessions
CREATE POLICY "Club members can view open sessions in their clubs"
ON public.open_sessions
FOR SELECT
USING (
  club_id IN (
    SELECT club_id FROM public.club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Club members can create sessions"
ON public.open_sessions
FOR INSERT
WITH CHECK (
  creator_id = auth.uid() AND
  club_id IN (
    SELECT club_id FROM public.club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Session creators can update their sessions"
ON public.open_sessions
FOR UPDATE
USING (creator_id = auth.uid())
WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Session creators can delete their sessions"
ON public.open_sessions
FOR DELETE
USING (creator_id = auth.uid());

-- Function to join an open session
CREATE OR REPLACE FUNCTION public.join_open_session(
  session_id_param UUID,
  role_param TEXT DEFAULT 'participant'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_count INTEGER;
  cost_tokens INTEGER;
  cost_money NUMERIC;
  user_balance RECORD;
  result JSON;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.open_sessions
  WHERE id = session_id_param;
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;
  
  -- Check if user is a member of the club
  IF NOT EXISTS (
    SELECT 1 FROM public.club_memberships 
    WHERE club_id = session_record.club_id AND user_id = auth.uid() AND status = 'active'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Not a member of this club');
  END IF;
  
  -- Check if already joined
  IF EXISTS (
    SELECT 1 FROM public.session_participants 
    WHERE session_id = session_id_param AND user_id = auth.uid()
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Already joined this session');
  END IF;
  
  -- Check if session is full
  SELECT COUNT(*) INTO participant_count
  FROM public.session_participants
  WHERE session_id = session_id_param;
  
  IF participant_count >= session_record.max_participants THEN
    RETURN json_build_object('success', false, 'error', 'Session is full');
  END IF;
  
  -- Check if session is still open
  IF session_record.status != 'open' THEN
    RETURN json_build_object('success', false, 'error', 'Session is not open for registration');
  END IF;
  
  -- Calculate costs
  cost_tokens := session_record.cost_per_person_tokens;
  cost_money := session_record.cost_per_person_money;
  
  -- Check if user has sufficient balance (for tokens)
  IF cost_tokens > 0 THEN
    SELECT * INTO user_balance
    FROM public.token_balances
    WHERE player_id = auth.uid();
    
    IF user_balance IS NULL OR 
       (COALESCE(user_balance.regular_tokens, 0) + COALESCE(user_balance.premium_tokens, 0)) < cost_tokens THEN
      RETURN json_build_object('success', false, 'error', 'Insufficient token balance');
    END IF;
  END IF;
  
  -- Add participant
  INSERT INTO public.session_participants (
    session_id, user_id, role, tokens_paid, money_paid,
    payment_status
  )
  VALUES (
    session_id_param, auth.uid(), role_param, cost_tokens, cost_money,
    CASE WHEN cost_tokens = 0 AND cost_money = 0 THEN 'paid' ELSE 'pending' END
  );
  
  -- Update session participant count
  UPDATE public.open_sessions
  SET 
    current_participants = current_participants + 1,
    status = CASE WHEN current_participants + 1 >= max_participants THEN 'full' ELSE status END,
    updated_at = now()
  WHERE id = session_id_param;
  
  -- Deduct tokens if applicable
  IF cost_tokens > 0 THEN
    UPDATE public.token_balances
    SET 
      regular_tokens = CASE 
        WHEN regular_tokens >= cost_tokens THEN regular_tokens - cost_tokens
        ELSE 0
      END,
      premium_tokens = CASE 
        WHEN regular_tokens < cost_tokens THEN premium_tokens - (cost_tokens - regular_tokens)
        ELSE premium_tokens
      END,
      updated_at = now()
    WHERE player_id = auth.uid();
    
    -- Log token transaction
    INSERT INTO public.token_transactions (
      player_id, transaction_type, token_type, amount, source, description
    ) VALUES (
      auth.uid(), 'spend', 'regular', cost_tokens, 'session_join',
      'Joined open session: ' || session_record.title
    );
  END IF;
  
  result := json_build_object(
    'success', true,
    'session_id', session_id_param,
    'tokens_paid', cost_tokens,
    'money_paid', cost_money,
    'new_participant_count', session_record.current_participants + 1
  );
  
  RETURN result;
END;
$$;