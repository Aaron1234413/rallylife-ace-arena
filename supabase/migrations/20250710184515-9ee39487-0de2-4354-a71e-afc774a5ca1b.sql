-- Create HP check function for joining sessions
CREATE OR REPLACE FUNCTION public.join_session_with_hp_check(
  session_id_param uuid,
  user_id_param uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  session_record RECORD;
  hp_record RECORD;
  hp_cost INTEGER;
  participant_count INTEGER;
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
  
  -- Check if user is already a participant
  IF EXISTS (
    SELECT 1 FROM public.session_participants 
    WHERE session_id = session_id_param AND user_id = user_id_param
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Already joined this session');
  END IF;
  
  -- Calculate HP cost based on session type and stakes
  IF session_record.session_type = 'social_play' THEN
    -- Social play sessions cost HP based on stakes and format
    IF session_record.stakes_amount > 0 THEN
      -- Challenge sessions cost more HP
      hp_cost := CASE 
        WHEN session_record.stakes_amount >= 100 THEN 25  -- High stakes
        WHEN session_record.stakes_amount >= 50 THEN 15   -- Medium stakes
        WHEN session_record.stakes_amount >= 20 THEN 10   -- Low stakes
        ELSE 5                                            -- Minimal stakes
      END;
    ELSE
      -- Free social play costs minimal HP
      hp_cost := 3;
    END IF;
  ELSIF session_record.session_type = 'training' THEN
    -- Training sessions don't cost HP to join (only during completion)
    hp_cost := 0;
  ELSE
    -- Default HP cost for other session types
    hp_cost := 5;
  END IF;
  
  -- Get user's current HP
  SELECT * INTO hp_record
  FROM public.player_hp
  WHERE player_id = user_id_param;
  
  -- Initialize HP if not exists
  IF hp_record IS NULL THEN
    PERFORM public.initialize_player_hp(user_id_param);
    SELECT * INTO hp_record
    FROM public.player_hp
    WHERE player_id = user_id_param;
  END IF;
  
  -- Check if user has enough HP
  IF hp_record.current_hp < hp_cost THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Insufficient HP to join this session',
      'hp_needed', hp_cost,
      'current_hp', hp_record.current_hp
    );
  END IF;
  
  -- Add user to session
  INSERT INTO public.session_participants (
    session_id, user_id, role, joined_at, payment_status, attendance_status, tokens_paid
  )
  VALUES (
    session_id_param, user_id_param, 'participant', now(), 'paid', 'registered', session_record.stakes_amount
  );
  
  -- Deduct HP if there's a cost
  IF hp_cost > 0 THEN
    UPDATE public.player_hp
    SET current_hp = current_hp - hp_cost,
        last_activity = now(),
        updated_at = now()
    WHERE player_id = user_id_param;
    
    -- Log HP activity
    INSERT INTO public.hp_activities (
      player_id, activity_type, hp_change, hp_before, hp_after, description
    )
    VALUES (
      user_id_param, 'session_join', -hp_cost, hp_record.current_hp, 
      hp_record.current_hp - hp_cost, 'Joined ' || session_record.session_type || ' session'
    );
  END IF;
  
  result := json_build_object(
    'success', true,
    'tokens_paid', session_record.stakes_amount,
    'hp_cost', hp_cost,
    'hp_after', hp_record.current_hp - hp_cost
  );
  
  RETURN result;
END;
$function$;

-- Create training completion with rewards function
CREATE OR REPLACE FUNCTION public.complete_training_with_rewards(
  session_id_param uuid,
  user_id_param uuid,
  duration_minutes integer,
  hp_change integer,
  xp_gain integer,
  session_type text DEFAULT 'general',
  intensity text DEFAULT 'medium',
  is_lesson boolean DEFAULT false,
  coach_id uuid DEFAULT NULL,
  coach_level integer DEFAULT 1,
  session_notes text DEFAULT NULL,
  mood text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  hp_result INTEGER;
  xp_result JSON;
  result JSON;
BEGIN
  -- Apply HP change (positive for restoration, negative for consumption)
  IF hp_change != 0 THEN
    SELECT public.restore_hp(
      user_id_param, 
      hp_change, 
      CASE WHEN is_lesson THEN 'lesson_completion' ELSE 'training_completion' END,
      CASE 
        WHEN is_lesson THEN 'Completed lesson with coach (Level ' || coach_level || ')'
        ELSE 'Completed ' || intensity || ' intensity training (' || duration_minutes || ' min)'
      END
    ) INTO hp_result;
  END IF;
  
  -- Apply XP gain
  IF xp_gain > 0 THEN
    SELECT public.add_xp(
      user_id_param,
      xp_gain,
      CASE WHEN is_lesson THEN 'lesson_completion' ELSE 'training_completion' END,
      CASE 
        WHEN is_lesson THEN 'Completed lesson: ' || session_type
        ELSE 'Completed training: ' || session_type || ' (' || intensity || ' intensity)'
      END
    ) INTO xp_result;
  END IF;
  
  -- Log the activity
  INSERT INTO public.activity_logs (
    player_id, activity_category, activity_type, title, description,
    duration_minutes, intensity_level, xp_earned, hp_impact,
    coach_name, notes, logged_at
  )
  VALUES (
    user_id_param, 'training', session_type, 
    CASE WHEN is_lesson THEN 'Tennis Lesson' ELSE 'Training Session' END,
    CASE 
      WHEN is_lesson THEN 'Private lesson with coach (Level ' || coach_level || ')'
      ELSE intensity || ' intensity training session'
    END,
    duration_minutes, intensity, xp_gain, hp_change,
    CASE WHEN coach_id IS NOT NULL THEN 'Coach (Level ' || coach_level || ')' ELSE NULL END,
    session_notes, now()
  );
  
  result := json_build_object(
    'success', true,
    'hp_restored', CASE WHEN hp_change > 0 THEN hp_change ELSE NULL END,
    'hp_consumed', CASE WHEN hp_change < 0 THEN ABS(hp_change) ELSE NULL END,
    'xp_gained', xp_gain,
    'activity_logged', true
  );
  
  RETURN result;
END;
$function$;