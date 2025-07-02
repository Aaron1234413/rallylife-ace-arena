-- Create essential database functions for session management

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
  stakes_amount INTEGER;
  result JSON;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;
  
  IF session_record.status != 'waiting' THEN
    RETURN json_build_object('success', false, 'error', 'Session is not available for joining');
  END IF;
  
  -- Check if user is already a participant
  IF EXISTS (SELECT 1 FROM public.session_participants 
             WHERE session_id = session_id_param 
             AND user_id = user_id_param 
             AND status = 'joined') THEN
    RETURN json_build_object('success', false, 'error', 'You are already in this session');
  END IF;
  
  -- Count current participants
  SELECT COUNT(*) INTO participant_count
  FROM public.session_participants
  WHERE session_id = session_id_param AND status = 'joined';
  
  IF participant_count >= session_record.max_players THEN
    RETURN json_build_object('success', false, 'error', 'Session is full');
  END IF;
  
  stakes_amount := session_record.stakes_amount;
  
  -- Check if user has enough tokens for stakes
  IF stakes_amount > 0 THEN
    DECLARE
      user_balance INTEGER;
    BEGIN
      SELECT regular_tokens INTO user_balance
      FROM public.token_balances
      WHERE player_id = user_id_param;
      
      IF user_balance < stakes_amount THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient tokens for stakes');
      END IF;
      
      -- Deduct stakes
      PERFORM public.spend_tokens(
        user_id_param,
        stakes_amount,
        'regular',
        'session_stakes',
        'Stakes for joining session'
      );
    END;
  END IF;
  
  -- Add participant
  INSERT INTO public.session_participants (session_id, user_id, stakes_contributed)
  VALUES (session_id_param, user_id_param, stakes_amount);
  
  participant_count := participant_count + 1;
  
  result := json_build_object(
    'success', true,
    'participant_count', participant_count,
    'session_ready', participant_count >= session_record.max_players
  );
  
  RETURN result;
END;
$$;

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
  -- Get session details and check if kicker is the creator
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param AND creator_id = kicker_id_param;
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found or you are not the creator');
  END IF;
  
  -- Get participant details
  SELECT * INTO participant_record
  FROM public.session_participants
  WHERE id = participant_id_param AND session_id = session_id_param;
  
  IF participant_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Participant not found');
  END IF;
  
  -- Can't kick the creator
  IF participant_record.user_id = session_record.creator_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot kick the session creator');
  END IF;
  
  -- Update participant status to kicked
  UPDATE public.session_participants
  SET status = 'kicked', left_at = now()
  WHERE id = participant_id_param;
  
  -- Refund stakes if any
  IF participant_record.stakes_contributed > 0 THEN
    PERFORM public.add_tokens(
      participant_record.user_id,
      participant_record.stakes_contributed,
      'regular',
      'session_kick_refund',
      'Stakes refund for being removed from session'
    );
  END IF;
  
  result := json_build_object('success', true);
  RETURN result;
END;
$$;

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
  -- Check if user is session creator
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param AND creator_id = starter_id_param;
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found or you are not the creator');
  END IF;
  
  IF session_record.status != 'waiting' THEN
    RETURN json_build_object('success', false, 'error', 'Session cannot be started');
  END IF;
  
  -- Count active participants
  SELECT COUNT(*) INTO participant_count
  FROM public.session_participants
  WHERE session_id = session_id_param AND status = 'joined';
  
  IF participant_count < session_record.max_players THEN
    RETURN json_build_object('success', false, 'error', 'Session is not full yet');
  END IF;
  
  -- Start the session
  UPDATE public.sessions
  SET status = 'active', updated_at = now()
  WHERE id = session_id_param;
  
  result := json_build_object('success', true);
  RETURN result;
END;
$$;