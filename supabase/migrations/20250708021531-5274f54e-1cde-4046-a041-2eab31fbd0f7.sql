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

-- Create session_participants table for tracking participants
CREATE TABLE public.session_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.open_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'waived')),
  attendance_status TEXT NOT NULL DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'no_show', 'cancelled')),
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'assistant_coach', 'observer')),
  notes TEXT,
  tokens_paid INTEGER DEFAULT 0,
  money_paid NUMERIC DEFAULT 0.00,
  UNIQUE(session_id, user_id)
);

-- Create indexes for session_participants
CREATE INDEX idx_session_participants_session ON public.session_participants(session_id);
CREATE INDEX idx_session_participants_user ON public.session_participants(user_id, payment_status);

-- Enable Row Level Security
ALTER TABLE public.open_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies for session_participants
CREATE POLICY "Club members can view session participants"
ON public.session_participants
FOR SELECT
USING (
  session_id IN (
    SELECT id FROM public.open_sessions 
    WHERE club_id IN (
      SELECT club_id FROM public.club_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);

CREATE POLICY "Users can manage their own participation"
ON public.session_participants
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Session creators can manage participants"
ON public.session_participants
FOR ALL
USING (
  session_id IN (
    SELECT id FROM public.open_sessions 
    WHERE creator_id = auth.uid()
  )
)
WITH CHECK (
  session_id IN (
    SELECT id FROM public.open_sessions 
    WHERE creator_id = auth.uid()
  )
);

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

-- Function to leave an open session
CREATE OR REPLACE FUNCTION public.leave_open_session(
  session_id_param UUID,
  refund_policy TEXT DEFAULT 'full'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_record RECORD;
  refund_tokens INTEGER := 0;
  refund_money NUMERIC := 0.00;
  hours_until_session NUMERIC;
  result JSON;
BEGIN
  -- Get session and participant details
  SELECT s.*, sp.tokens_paid, sp.money_paid
  INTO session_record
  FROM public.open_sessions s
  JOIN public.session_participants sp ON s.id = sp.session_id
  WHERE s.id = session_id_param AND sp.user_id = auth.uid();
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found or not joined');
  END IF;
  
  -- Calculate time until session
  hours_until_session := EXTRACT(EPOCH FROM (
    (session_record.scheduled_date + session_record.start_time)::timestamp - now()
  )) / 3600;
  
  -- Calculate refund based on policy and time
  IF hours_until_session >= 24 THEN
    refund_tokens := session_record.tokens_paid;
    refund_money := session_record.money_paid;
  ELSIF hours_until_session >= 4 THEN
    refund_tokens := FLOOR(session_record.tokens_paid * 0.5);
    refund_money := session_record.money_paid * 0.5;
  ELSE
    -- No refund for last-minute cancellations
    refund_tokens := 0;
    refund_money := 0.00;
  END IF;
  
  -- Remove participant
  DELETE FROM public.session_participants
  WHERE session_id = session_id_param AND user_id = auth.uid();
  
  -- Update session participant count
  UPDATE public.open_sessions
  SET 
    current_participants = current_participants - 1,
    status = CASE WHEN status = 'full' THEN 'open' ELSE status END,
    updated_at = now()
  WHERE id = session_id_param;
  
  -- Process refunds
  IF refund_tokens > 0 THEN
    UPDATE public.token_balances
    SET 
      regular_tokens = regular_tokens + refund_tokens,
      updated_at = now()
    WHERE player_id = auth.uid();
    
    -- Log refund transaction
    INSERT INTO public.token_transactions (
      player_id, transaction_type, token_type, amount, source, description
    ) VALUES (
      auth.uid(), 'refund', 'regular', refund_tokens, 'session_leave',
      'Refund for leaving session: ' || session_record.title
    );
  END IF;
  
  result := json_build_object(
    'success', true,
    'refund_tokens', refund_tokens,
    'refund_money', refund_money,
    'hours_until_session', hours_until_session
  );
  
  RETURN result;
END;
$$;

-- Function to calculate session costs split among participants
CREATE OR REPLACE FUNCTION public.calculate_session_costs(
  court_hourly_rate_tokens INTEGER,
  court_hourly_rate_money NUMERIC,
  duration_minutes INTEGER,
  participant_count INTEGER,
  coach_fee_tokens INTEGER DEFAULT 0,
  coach_fee_money NUMERIC DEFAULT 0.00
)
RETURNS JSON
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  total_court_cost_tokens INTEGER;
  total_court_cost_money NUMERIC;
  total_cost_tokens INTEGER;
  total_cost_money NUMERIC;
  cost_per_person_tokens INTEGER;
  cost_per_person_money NUMERIC;
  result JSON;
BEGIN
  -- Calculate court costs based on duration
  total_court_cost_tokens := FLOOR((court_hourly_rate_tokens * duration_minutes) / 60.0);
  total_court_cost_money := ROUND((court_hourly_rate_money * duration_minutes) / 60.0, 2);
  
  -- Add coach fees
  total_cost_tokens := total_court_cost_tokens + coach_fee_tokens;
  total_cost_money := total_court_cost_money + coach_fee_money;
  
  -- Split among participants
  cost_per_person_tokens := CASE 
    WHEN participant_count > 0 THEN FLOOR(total_cost_tokens / participant_count)
    ELSE total_cost_tokens
  END;
  
  cost_per_person_money := CASE 
    WHEN participant_count > 0 THEN ROUND(total_cost_money / participant_count, 2)
    ELSE total_cost_money
  END;
  
  result := json_build_object(
    'total_court_cost_tokens', total_court_cost_tokens,
    'total_court_cost_money', total_court_cost_money,
    'coach_fee_tokens', coach_fee_tokens,
    'coach_fee_money', coach_fee_money,
    'total_cost_tokens', total_cost_tokens,
    'total_cost_money', total_cost_money,
    'cost_per_person_tokens', cost_per_person_tokens,
    'cost_per_person_money', cost_per_person_money,
    'participant_count', participant_count
  );
  
  RETURN result;
END;
$$;

-- Function to auto-update session status based on time
CREATE OR REPLACE FUNCTION public.update_session_statuses()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Mark sessions as in_progress if start time has passed
  UPDATE public.open_sessions
  SET status = 'in_progress', updated_at = now()
  WHERE status = 'open' OR status = 'full'
    AND (scheduled_date + start_time)::timestamp <= now()
    AND (scheduled_date + end_time)::timestamp > now();
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- Mark sessions as completed if end time has passed
  UPDATE public.open_sessions
  SET status = 'completed', updated_at = now()
  WHERE status IN ('open', 'full', 'in_progress')
    AND (scheduled_date + end_time)::timestamp <= now();
  
  GET DIAGNOSTICS updated_count = updated_count + ROW_COUNT;
  
  RETURN updated_count;
END;
$$;