-- Fix the join_session function to remove participant_count update
CREATE OR REPLACE FUNCTION public.join_session(session_id_param uuid, user_id_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  session_record RECORD;
  result JSON;
  current_participants INTEGER;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;
  
  -- Check if session is still open
  IF session_record.status != 'waiting' THEN
    RETURN json_build_object('success', false, 'error', 'Session is not accepting participants');
  END IF;
  
  -- Check if user is already a participant
  IF EXISTS (
    SELECT 1 FROM public.session_participants 
    WHERE session_id = session_id_param AND user_id = user_id_param
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Already joined this session');
  END IF;
  
  -- Count current participants
  SELECT COUNT(*) INTO current_participants
  FROM public.session_participants
  WHERE session_id = session_id_param;
  
  -- Check if session is full
  IF current_participants >= session_record.max_players THEN
    RETURN json_build_object('success', false, 'error', 'Session is full');
  END IF;
  
  -- Check if user has enough tokens for stakes
  IF session_record.stakes_amount > 0 THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.token_balances 
      WHERE player_id = user_id_param 
      AND regular_tokens >= session_record.stakes_amount
    ) THEN
      RETURN json_build_object('success', false, 'error', 'Insufficient tokens');
    END IF;
    
    -- Deduct stakes tokens
    UPDATE public.token_balances
    SET regular_tokens = regular_tokens - session_record.stakes_amount
    WHERE player_id = user_id_param;
    
    -- Log token transaction
    INSERT INTO public.token_transactions (
      player_id, transaction_type, token_type, amount, source, description
    ) VALUES (
      user_id_param, 'spend', 'regular', session_record.stakes_amount, 'session_stakes',
      'Stakes for session: ' || session_record.session_type
    );
  END IF;
  
  -- Add user to session
  INSERT INTO public.session_participants (session_id, user_id, joined_at)
  VALUES (session_id_param, user_id_param, now());
  
  -- Update session updated_at timestamp (removed participant_count update)
  UPDATE public.sessions
  SET updated_at = now()
  WHERE id = session_id_param;
  
  result := json_build_object(
    'success', true,
    'message', 'Successfully joined session'
  );
  
  RETURN result;
END;
$function$;