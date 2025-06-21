
CREATE OR REPLACE FUNCTION public.complete_social_play_session(
  session_id uuid,
  final_score text DEFAULT NULL,
  notes text DEFAULT NULL,
  mood text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  session_record RECORD;
  participant_count INTEGER;
  session_duration INTEGER;
  hp_reward INTEGER;
  xp_reward INTEGER;
  token_reward INTEGER;
  user_id UUID;
  result JSON;
BEGIN
  user_id := auth.uid();
  
  -- Get session details and verify user has access
  SELECT s.*, 
         CASE 
           WHEN s.created_by = user_id THEN true
           WHEN EXISTS (
             SELECT 1 FROM public.social_play_participants 
             WHERE session_id = s.id AND user_id = complete_social_play_session.user_id
           ) THEN true
           ELSE false
         END as has_access
  INTO session_record
  FROM public.social_play_sessions s
  WHERE s.id = complete_social_play_session.session_id;
  
  IF session_record IS NULL OR NOT session_record.has_access THEN
    RETURN json_build_object('success', false, 'error', 'Session not found or access denied');
  END IF;
  
  IF session_record.status = 'completed' THEN
    RETURN json_build_object('success', false, 'error', 'Session already completed');
  END IF;
  
  -- Calculate session duration in minutes
  session_duration := CASE 
    WHEN session_record.start_time IS NOT NULL THEN
      EXTRACT(EPOCH FROM (now() - session_record.start_time::timestamp)) / 60
    ELSE 0
  END;
  
  -- Count active participants
  SELECT COUNT(*) INTO participant_count
  FROM public.social_play_participants
  WHERE session_id = complete_social_play_session.session_id 
    AND status IN ('joined', 'accepted');
  
  -- Calculate rewards based on session details
  hp_reward := GREATEST(10, FLOOR(session_duration / 5)); -- 2 HP per 5 min, min 10
  xp_reward := GREATEST(15, FLOOR(session_duration / 3)); -- ~5 XP per 5 min, min 15
  token_reward := GREATEST(5, FLOOR(session_duration / 10)); -- 1 token per 10 min, min 5
  
  -- Apply social bonus (playing with friends)
  IF participant_count > 0 THEN
    hp_reward := FLOOR(hp_reward * 1.5);
    xp_reward := FLOOR(xp_reward * 1.5);
    token_reward := FLOOR(token_reward * 1.5);
  END IF;
  
  -- Apply competitive level multiplier
  CASE session_record.competitive_level
    WHEN 'medium' THEN
      xp_reward := FLOOR(xp_reward * 1.2);
      token_reward := FLOOR(token_reward * 1.2);
    WHEN 'high' THEN
      xp_reward := FLOOR(xp_reward * 1.5);
      token_reward := FLOOR(token_reward * 1.5);
  END CASE;
  
  -- Apply mood bonus
  IF mood IN ('great', 'strong', 'energized') THEN
    hp_reward := FLOOR(hp_reward * 1.1);
    xp_reward := FLOOR(xp_reward * 1.1);
  END IF;
  
  -- Update session status
  UPDATE public.social_play_sessions
  SET 
    status = 'completed',
    end_time = now(),
    final_score = complete_social_play_session.final_score,
    notes = complete_social_play_session.notes,
    mood = complete_social_play_session.mood,
    updated_at = now()
  WHERE id = complete_social_play_session.session_id;
  
  -- Award rewards to the user
  PERFORM public.restore_hp(
    user_id, 
    hp_reward, 
    'social_play', 
    'Social play session - ' || session_duration::text || 'min with friends'
  );
  
  PERFORM public.add_xp(
    user_id, 
    xp_reward, 
    'social_play', 
    'Social play session - ' || session_record.competitive_level || ' level'
  );
  
  PERFORM public.add_tokens(
    user_id, 
    token_reward, 
    'regular', 
    'social_play', 
    'Social play session completion'
  );
  
  -- Return result with rewards
  result := json_build_object(
    'success', true,
    'session_id', complete_social_play_session.session_id,
    'duration_minutes', session_duration,
    'participant_count', participant_count + 1, -- +1 for session owner
    'rewards', json_build_object(
      'hp', hp_reward,
      'xp', xp_reward,
      'tokens', token_reward
    ),
    'final_score', complete_social_play_session.final_score,
    'notes', complete_social_play_session.notes,
    'mood', complete_social_play_session.mood
  );
  
  RETURN result;
END;
$function$
