-- Complete sessions system migration

-- Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('match', 'social_play', 'training', 'recovery')),
  format TEXT CHECK (format IN ('singles', 'doubles')),
  max_players INTEGER NOT NULL DEFAULT 2,
  stakes_amount INTEGER NOT NULL DEFAULT 0,
  location TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
  is_private BOOLEAN NOT NULL DEFAULT false,
  invitation_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session_participants table
CREATE TABLE IF NOT EXISTS public.session_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'joined' CHECK (status IN ('joined', 'left', 'kicked')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

-- Sessions RLS policies
CREATE POLICY "Users can view public sessions" ON public.sessions
  FOR SELECT USING (is_private = false OR creator_id = auth.uid());

CREATE POLICY "Users can view private sessions they're invited to" ON public.sessions
  FOR SELECT USING (
    is_private = true AND (
      creator_id = auth.uid() OR
      id IN (
        SELECT session_id FROM public.session_participants 
        WHERE user_id = auth.uid() AND status = 'joined'
      )
    )
  );

CREATE POLICY "Users can create sessions" ON public.sessions
  FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update their sessions" ON public.sessions
  FOR UPDATE USING (creator_id = auth.uid());

-- Session participants RLS policies
CREATE POLICY "Users can view participants in sessions they can see" ON public.session_participants
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM public.sessions 
      WHERE is_private = false OR creator_id = auth.uid() OR
      id IN (
        SELECT session_id FROM public.session_participants sp2
        WHERE sp2.user_id = auth.uid() AND sp2.status = 'joined'
      )
    )
  );

CREATE POLICY "Users can join sessions" ON public.session_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation" ON public.session_participants
  FOR UPDATE USING (user_id = auth.uid());

-- Create join_session function
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

-- Create kick_participant function
CREATE OR REPLACE FUNCTION public.kick_participant(
  session_id_param UUID,
  participant_id_param UUID,
  kicker_id_param UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_record RECORD;
  result JSON;
BEGIN
  -- Get session details and verify kicker is creator
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param AND creator_id = kicker_id_param AND status = 'waiting';
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found or you are not the creator');
  END IF;
  
  -- Get participant details
  SELECT * INTO participant_record
  FROM public.session_participants
  WHERE id = participant_id_param AND session_id = session_id_param AND status = 'joined';
  
  IF participant_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Participant not found');
  END IF;
  
  -- Can't kick the creator
  IF participant_record.user_id = session_record.creator_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot kick the session creator');
  END IF;
  
  -- Update participant status
  UPDATE public.session_participants
  SET status = 'kicked', left_at = now(), updated_at = now()
  WHERE id = participant_id_param;
  
  -- Refund stakes if any
  IF session_record.stakes_amount > 0 THEN
    PERFORM public.add_tokens(
      participant_record.user_id,
      session_record.stakes_amount,
      'regular',
      'session_kick_refund',
      'Stakes refund for being kicked from session'
    );
  END IF;
  
  result := json_build_object('success', true, 'message', 'Participant kicked and refunded');
  
  RETURN result;
END;
$$;

-- Create start_session function
CREATE OR REPLACE FUNCTION public.start_session(
  session_id_param UUID,
  starter_id_param UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_count INTEGER;
  result JSON;
BEGIN
  -- Get session details and verify starter is creator
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param AND creator_id = starter_id_param AND status = 'waiting';
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found or you are not the creator');
  END IF;
  
  -- Count current participants
  SELECT COUNT(*) INTO participant_count
  FROM public.session_participants
  WHERE session_id = session_id_param AND status = 'joined';
  
  -- Check if session has enough players
  IF participant_count < session_record.max_players THEN
    RETURN json_build_object('success', false, 'error', 'Not enough players to start session');
  END IF;
  
  -- Start the session
  UPDATE public.sessions
  SET status = 'active', updated_at = now()
  WHERE id = session_id_param;
  
  result := json_build_object('success', true, 'message', 'Session started successfully');
  
  RETURN result;
END;
$$;

-- Enable realtime
ALTER TABLE public.sessions REPLICA IDENTITY FULL;
ALTER TABLE public.session_participants REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_participants;