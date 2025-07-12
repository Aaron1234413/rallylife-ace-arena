-- First, let's check what RPC functions we need vs what exists
-- Complete Session Lifecycle Management - Phase 4.1 Implementation

-- 1. CREATE STANDARDIZED SESSION LIFECYCLE RPC FUNCTIONS

-- Standardized start_session function
CREATE OR REPLACE FUNCTION public.start_session(
  session_id_param UUID,
  starter_id_param UUID DEFAULT auth.uid()
)
RETURNS JSON AS $$
DECLARE
  session_record RECORD;
  participant_count INTEGER;
  result JSON;
BEGIN
  -- Get session details with validation
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Session not found'
    );
  END IF;
  
  -- Permission check: only creator or participants can start
  IF session_record.creator_id != starter_id_param AND
     NOT EXISTS (
       SELECT 1 FROM public.session_participants 
       WHERE session_id = session_id_param 
         AND user_id = starter_id_param 
         AND status = 'joined'
     ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Only the creator or participants can start the session'
    );
  END IF;
  
  -- State validation
  IF session_record.status NOT IN ('open', 'waiting') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Session cannot be started from current status: ' || session_record.status
    );
  END IF;
  
  -- Count current participants
  SELECT COUNT(*) INTO participant_count
  FROM public.session_participants
  WHERE session_id = session_id_param AND status = 'joined';
  
  -- Minimum participant check
  IF participant_count < 2 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Need at least 2 participants to start the session'
    );
  END IF;
  
  -- Update session status to active
  UPDATE public.sessions
  SET 
    status = 'active',
    session_started_at = now(),
    updated_at = now()
  WHERE id = session_id_param;
  
  result := json_build_object(
    'success', true,
    'message', 'Session started successfully',
    'session_id', session_id_param,
    'participant_count', participant_count,
    'started_at', now()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Standardized pause_session function  
CREATE OR REPLACE FUNCTION public.pause_session(
  session_id_param UUID,
  user_id_param UUID DEFAULT auth.uid()
)
RETURNS JSON AS $$
DECLARE
  session_record RECORD;
  result JSON;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Session not found'
    );
  END IF;
  
  -- Permission check: only creator can pause/resume
  IF session_record.creator_id != user_id_param THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Only the session creator can pause/resume the session'
    );
  END IF;
  
  -- Toggle between active and paused
  IF session_record.status = 'active' THEN
    UPDATE public.sessions
    SET 
      status = 'paused',
      updated_at = now()
    WHERE id = session_id_param;
    
    result := json_build_object(
      'success', true,
      'message', 'Session paused successfully',
      'new_status', 'paused'
    );
  ELSIF session_record.status = 'paused' THEN
    UPDATE public.sessions
    SET 
      status = 'active',
      updated_at = now()
    WHERE id = session_id_param;
    
    result := json_build_object(
      'success', true,
      'message', 'Session resumed successfully',
      'new_status', 'active'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Session must be active or paused to toggle pause state. Current status: ' || session_record.status
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Standardized end_session function
CREATE OR REPLACE FUNCTION public.end_session(
  session_id_param UUID,
  winner_id_param UUID DEFAULT NULL,
  completion_data JSONB DEFAULT NULL,
  user_id_param UUID DEFAULT auth.uid()
)
RETURNS JSON AS $$
DECLARE
  session_record RECORD;
  is_participant BOOLEAN := false;
  result JSON;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Session not found'
    );
  END IF;
  
  -- State validation
  IF session_record.status NOT IN ('active', 'paused') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Session must be active or paused to end. Current status: ' || session_record.status
    );
  END IF;
  
  -- Permission check: creator or participant can end
  IF session_record.creator_id = user_id_param THEN
    is_participant := true;
  ELSE
    SELECT EXISTS(
      SELECT 1 FROM public.session_participants 
      WHERE session_id = session_id_param 
        AND user_id = user_id_param 
        AND status = 'joined'
    ) INTO is_participant;
  END IF;
  
  IF NOT is_participant THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Only participants can end the session'
    );
  END IF;
  
  -- Complete the session using existing complete_session function
  SELECT public.complete_session(
    session_id_param,
    winner_id_param,
    NULL, -- session_duration_minutes (calculated automatically)
    completion_data->>'rating',
    completion_data->>'notes',
    completion_data->>'score'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CREATE SESSION PERMISSION CHECKING FUNCTIONS

CREATE OR REPLACE FUNCTION public.can_start_session(
  session_id_param UUID,
  user_id_param UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
  session_record RECORD;
  participant_count INTEGER;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if user has permission (creator or participant)
  IF session_record.creator_id != user_id_param AND
     NOT EXISTS (
       SELECT 1 FROM public.session_participants 
       WHERE session_id = session_id_param 
         AND user_id = user_id_param 
         AND status = 'joined'
     ) THEN
    RETURN false;
  END IF;
  
  -- Check status
  IF session_record.status NOT IN ('open', 'waiting') THEN
    RETURN false;
  END IF;
  
  -- Check participant count
  SELECT COUNT(*) INTO participant_count
  FROM public.session_participants
  WHERE session_id = session_id_param AND status = 'joined';
  
  RETURN participant_count >= 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_pause_session(
  session_id_param UUID,
  user_id_param UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
  session_record RECORD;
BEGIN
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Only creator can pause
  IF session_record.creator_id != user_id_param THEN
    RETURN false;
  END IF;
  
  -- Must be active or paused
  RETURN session_record.status IN ('active', 'paused');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_end_session(
  session_id_param UUID,
  user_id_param UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
  session_record RECORD;
  is_participant BOOLEAN := false;
BEGIN
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check status
  IF session_record.status NOT IN ('active', 'paused') THEN
    RETURN false;
  END IF;
  
  -- Check if user is creator or participant
  IF session_record.creator_id = user_id_param THEN
    RETURN true;
  END IF;
  
  SELECT EXISTS(
    SELECT 1 FROM public.session_participants 
    WHERE session_id = session_id_param 
      AND user_id = user_id_param 
      AND status = 'joined'
  ) INTO is_participant;
  
  RETURN is_participant;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;