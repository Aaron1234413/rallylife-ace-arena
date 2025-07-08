-- Phase 3: Session Participants and Unified Data Flow

-- Create session_participants table for unified session participation tracking
CREATE TABLE IF NOT EXISTS public.session_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'organizer', 'coach', 'assistant')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'waived')),
  attendance_status TEXT NOT NULL DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'no_show', 'cancelled')),
  tokens_paid INTEGER NOT NULL DEFAULT 0,
  money_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique participation per session
  UNIQUE(session_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_participants_session_id ON public.session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_user_id ON public.session_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_joined_at ON public.session_participants(joined_at);

-- Enable RLS
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for session_participants
CREATE POLICY "Users can join sessions they have access to"
ON public.session_participants
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  -- Can join sessions that are either:
  -- 1. Non-club sessions (open to all)
  -- 2. Club sessions where user is a member
  session_id IN (
    SELECT id FROM public.sessions s
    WHERE s.id = session_id AND (
      s.club_id IS NULL OR
      s.club_id IN (
        SELECT club_id FROM public.club_memberships 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  )
);

CREATE POLICY "Users can view session participants for accessible sessions"
ON public.session_participants
FOR SELECT
USING (
  session_id IN (
    SELECT id FROM public.sessions s
    WHERE s.id = session_id AND (
      s.club_id IS NULL OR
      s.club_id IN (
        SELECT club_id FROM public.club_memberships 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  )
);

CREATE POLICY "Users can update their own participation"
ON public.session_participants
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave sessions"
ON public.session_participants
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Session creators can manage participants"
ON public.session_participants
FOR ALL
USING (
  session_id IN (
    SELECT id FROM public.sessions 
    WHERE creator_id = auth.uid()
  )
)
WITH CHECK (
  session_id IN (
    SELECT id FROM public.sessions 
    WHERE creator_id = auth.uid()
  )
);

-- Create join_session function
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
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;
  
  -- Check if session is full
  SELECT COUNT(*) INTO participant_count
  FROM public.session_participants
  WHERE session_id = session_id_param;
  
  IF participant_count >= session_record.max_players THEN
    RETURN json_build_object('success', false, 'error', 'Session is full');
  END IF;
  
  -- Check if user already joined
  IF EXISTS (
    SELECT 1 FROM public.session_participants 
    WHERE session_id = session_id_param AND user_id = user_id_param
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Already joined this session');
  END IF;
  
  -- Check token requirements
  required_tokens := session_record.stakes_amount;
  
  IF required_tokens > 0 THEN
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
  
  -- Add participant
  INSERT INTO public.session_participants (
    session_id, user_id, role, 
    payment_status, tokens_paid
  ) VALUES (
    session_id_param, user_id_param, 'participant',
    CASE WHEN required_tokens > 0 THEN 'paid' ELSE 'waived' END,
    required_tokens
  );
  
  result := json_build_object(
    'success', true,
    'tokens_paid', required_tokens,
    'participant_count', participant_count + 1
  );
  
  RETURN result;
END;
$$;

-- Create updated_at trigger for session_participants
CREATE OR REPLACE FUNCTION public.update_session_participants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_participants_updated_at
  BEFORE UPDATE ON public.session_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_session_participants_updated_at();

-- Update sessions table to fix the session_source constraint issue
ALTER TABLE public.sessions ALTER COLUMN session_source DROP NOT NULL;
ALTER TABLE public.sessions ALTER COLUMN session_source SET DEFAULT NULL;

-- Add a check to ensure session_source is set for club sessions
ALTER TABLE public.sessions ADD CONSTRAINT sessions_club_source_check 
CHECK (
  (club_id IS NULL) OR 
  (club_id IS NOT NULL AND session_source IS NOT NULL)
);