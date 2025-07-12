-- First, let's check if the start_session function exists and create it if needed
CREATE OR REPLACE FUNCTION public.start_session(
  session_id_param UUID,
  starter_id_param UUID DEFAULT NULL
)
RETURNS JSON
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
  WHERE id = session_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Session not found'
    );
  END IF;
  
  -- Check if user is creator or participant
  IF starter_id_param IS NOT NULL THEN
    IF session_record.creator_id != starter_id_param AND
       NOT EXISTS (
         SELECT 1 FROM public.session_participants 
         WHERE session_id = session_id_param AND user_id = starter_id_param
       ) THEN
      RETURN json_build_object(
        'success', false,
        'message', 'Only the creator or participants can start the session'
      );
    END IF;
  END IF;
  
  -- Check if session is in waiting status
  IF session_record.status != 'waiting' THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Session is not in waiting status'
    );
  END IF;
  
  -- Count current participants
  SELECT COUNT(*) INTO participant_count
  FROM public.session_participants
  WHERE session_id = session_id_param AND status = 'joined';
  
  -- Check if we have minimum participants (at least 2 for most session types)
  IF participant_count < 2 THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Need at least 2 participants to start the session'
    );
  END IF;
  
  -- Update session status to active
  UPDATE public.sessions
  SET 
    status = 'active',
    session_started_at = now(),
    updated_at = now()
  WHERE id = session_id_param;
  
  -- Log activity
  INSERT INTO public.activity_logs (
    player_id, activity_type, activity_category, title, description, logged_at
  )
  VALUES (
    COALESCE(starter_id_param, session_record.creator_id),
    'session_start',
    'session',
    'Session Started',
    'Started ' || session_record.session_type || ' session at ' || session_record.location,
    now()
  );
  
  result := json_build_object(
    'success', true,
    'message', 'Session started successfully',
    'session_id', session_id_param,
    'participant_count', participant_count
  );
  
  RETURN result;
END;
$$;

-- Create function to pause/resume sessions
CREATE OR REPLACE FUNCTION public.pause_session(
  session_id_param UUID,
  user_id_param UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
      'message', 'Session not found'
    );
  END IF;
  
  -- Check if user is creator
  IF session_record.creator_id != user_id_param THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Only the session creator can pause the session'
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
      'message', 'Session must be active or paused to toggle pause state'
    );
  END IF;
  
  RETURN result;
END;
$$;

-- Update the current_participants counter to be consistent
UPDATE public.sessions 
SET current_participants = (
  SELECT COUNT(*) 
  FROM public.session_participants 
  WHERE session_id = sessions.id AND status = 'joined'
)
WHERE status IN ('waiting', 'active', 'paused');