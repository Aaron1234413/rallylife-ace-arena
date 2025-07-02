CREATE OR REPLACE FUNCTION public.complete_session(
  session_id_param UUID,
  winner_id_param UUID DEFAULT NULL,
  session_duration_minutes INTEGER DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participants RECORD;
  total_stakes INTEGER := 0;
  participant_count INTEGER := 0;
  result JSON;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;
  
  IF session_record.status != 'active' THEN
    RETURN json_build_object('success', false, 'error', 'Session is not active');
  END IF;
  
  -- Get participant information
  SELECT COUNT(*), SUM(stakes_contributed) INTO participant_count, total_stakes
  FROM public.session_participants
  WHERE session_id = session_id_param AND status = 'joined';
  
  -- Complete the session
  UPDATE public.sessions
  SET status = 'completed', updated_at = now()
  WHERE id = session_id_param;
  
  -- Award XP and handle rewards based on session type
  DECLARE
    base_xp INTEGER := 30;
    duration_bonus INTEGER := COALESCE(session_duration_minutes, 60) / 10;
    total_xp INTEGER := base_xp + duration_bonus;
  BEGIN
    -- Award XP to all participants
    FOR participants IN 
      SELECT user_id FROM public.session_participants 
      WHERE session_id = session_id_param AND status = 'joined'
    LOOP
      PERFORM public.add_xp(
        participants.user_id,
        total_xp,
        'session_completion',
        'Completed ' || session_record.session_type || ' session'
      );
    END LOOP;
    
    -- Handle stakes distribution for match sessions
    IF session_record.session_type = 'match' AND total_stakes > 0 AND winner_id_param IS NOT NULL THEN
      -- Winner takes 70% of total stakes
      DECLARE
        winner_share INTEGER := FLOOR(total_stakes * 0.7);
        organizer_share INTEGER := total_stakes - winner_share;
      BEGIN
        PERFORM public.add_tokens(
          winner_id_param,
          winner_share,
          'regular',
          'match_win_stakes',
          'Stakes won from match victory'
        );
        
        PERFORM public.add_tokens(
          session_record.creator_id,
          organizer_share,
          'regular',
          'match_organize_fee',
          'Organizer fee from match stakes'
        );
      END;
    ELSIF total_stakes > 0 THEN
      -- For non-match sessions, refund stakes to participants
      FOR participants IN 
        SELECT user_id, stakes_contributed FROM public.session_participants 
        WHERE session_id = session_id_param AND status = 'joined' AND stakes_contributed > 0
      LOOP
        PERFORM public.add_tokens(
          participants.user_id,
          participants.stakes_contributed,
          'regular',
          'session_stakes_refund',
          'Stakes refunded from completed session'
        );
      END LOOP;
    END IF;
  END;
  
  result := json_build_object(
    'success', true,
    'session_type', session_record.session_type,
    'session_duration_minutes', session_duration_minutes,
    'xp_granted', total_xp,
    'participant_count', participant_count,
    'total_stakes', total_stakes
  );
  
  RETURN result;
END;
$$;