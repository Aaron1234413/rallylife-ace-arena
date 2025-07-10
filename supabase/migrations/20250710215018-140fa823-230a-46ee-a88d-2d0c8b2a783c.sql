-- Phase 2: Enhanced Session Management Backend Functions

-- Ensure HP reduction calculation function exists with proper logic
CREATE OR REPLACE FUNCTION public.calculate_hp_reduction(
  user_level INTEGER,
  duration_minutes INTEGER,
  session_type TEXT
) RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- No HP reduction for social and training sessions
  IF session_type IN ('social', 'training') THEN
    RETURN 0;
  END IF;
  
  -- For challenge sessions: base reduction modified by level
  DECLARE
    base_reduction INTEGER := duration_minutes / 10;
    level_modifier NUMERIC := (100 - LEAST(user_level, 99)) / 100.0;
    final_reduction INTEGER;
  BEGIN
    final_reduction := FLOOR(base_reduction * level_modifier);
    -- Minimum 1 HP reduction for challenge sessions, maximum based on duration
    RETURN GREATEST(1, LEAST(final_reduction, duration_minutes / 5));
  END;
END;
$$;

-- Create enhanced session start function
CREATE OR REPLACE FUNCTION public.start_session_with_tracking(
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
  
  IF session_record.session_started_at IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session already started');
  END IF;
  
  -- Count active participants
  SELECT COUNT(*) INTO participant_count
  FROM public.session_participants
  WHERE session_id = session_id_param AND status = 'joined';
  
  -- For training sessions, allow any number of participants
  IF session_record.session_type != 'training' AND participant_count < session_record.max_players THEN
    RETURN json_build_object('success', false, 'error', 'Session is not full yet');
  END IF;
  
  -- Start the session with timestamp
  UPDATE public.sessions
  SET session_started_at = now(), updated_at = now()
  WHERE id = session_id_param;
  
  result := json_build_object('success', true, 'started_at', now());
  RETURN result;
END;
$$;

-- Create enhanced session completion function with HP calculation
CREATE OR REPLACE FUNCTION public.complete_session_with_hp(
  session_id_param UUID,
  winner_id_param UUID DEFAULT NULL,
  winning_team_param JSONB DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participants RECORD;
  total_stakes INTEGER := 0;
  participant_count INTEGER := 0;
  session_duration_minutes INTEGER;
  platform_fee INTEGER;
  remaining_pool INTEGER;
  result JSON;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;
  
  IF session_record.session_started_at IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session was never started');
  END IF;
  
  IF session_record.session_ended_at IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session already completed');
  END IF;
  
  -- Calculate session duration
  session_duration_minutes := EXTRACT(EPOCH FROM (now() - session_record.session_started_at)) / 60;
  
  -- Get participant information
  SELECT COUNT(*), COALESCE(SUM(stakes_contributed), 0) INTO participant_count, total_stakes
  FROM public.session_participants
  WHERE session_id = session_id_param AND status = 'joined';
  
  -- Complete the session
  UPDATE public.sessions
  SET session_ended_at = now(), 
      updated_at = now(),
      winning_team = winning_team_param
  WHERE id = session_id_param;
  
  -- Handle HP reductions for challenge sessions
  IF session_record.session_type = 'challenge' THEN
    FOR participants IN 
      SELECT sp.user_id, COALESCE(p.level, 1) as level
      FROM public.session_participants sp
      LEFT JOIN public.player_xp p ON sp.user_id = p.player_id
      WHERE sp.session_id = session_id_param AND sp.status = 'joined'
    LOOP
      DECLARE
        hp_reduction INTEGER;
      BEGIN
        hp_reduction := public.calculate_hp_reduction(participants.level, session_duration_minutes::INTEGER, 'challenge');
        
        -- Record HP reduction
        INSERT INTO public.session_hp_reductions (session_id, user_id, hp_reduced, user_level, session_duration_minutes)
        VALUES (session_id_param, participants.user_id, hp_reduction, participants.level, session_duration_minutes::INTEGER);
        
        -- Apply HP reduction (if HP system functions exist)
        BEGIN
          PERFORM public.restore_hp(participants.user_id, -hp_reduction, 'session_challenge', 'HP lost from challenge session');
        EXCEPTION
          WHEN undefined_function THEN
            -- HP system not implemented yet, skip
            NULL;
        END;
      END;
    END LOOP;
  END IF;
  
  -- Handle token distribution with 10% platform fee
  IF total_stakes > 0 THEN
    platform_fee := FLOOR(total_stakes * 0.1); -- 10% platform fee
    remaining_pool := total_stakes - platform_fee;
    
    IF session_record.session_type = 'challenge' AND winner_id_param IS NOT NULL THEN
      -- Check if it's doubles (more than 2 participants)
      IF participant_count > 2 THEN
        -- Doubles: split between winning team members
        DECLARE
          winning_team_members JSONB := winning_team_param;
          member_count INTEGER;
          share_per_member INTEGER;
        BEGIN
          IF winning_team_members IS NOT NULL THEN
            member_count := jsonb_array_length(winning_team_members);
            share_per_member := remaining_pool / member_count;
            
            -- Award to each winning team member
            FOR i IN 0..(member_count-1) LOOP
              PERFORM public.add_tokens(
                (winning_team_members->i->>'user_id')::UUID,
                share_per_member,
                'regular',
                'match_win_stakes',
                'Stakes won from doubles match victory'
              );
            END LOOP;
          END IF;
        END;
      ELSE
        -- Singles: winner takes all remaining pool
        PERFORM public.add_tokens(
          winner_id_param,
          remaining_pool,
          'regular',
          'match_win_stakes',
          'Stakes won from singles match victory'
        );
      END IF;
    ELSE
      -- For training sessions or no winner, refund stakes to participants (minus platform fee)
      FOR participants IN 
        SELECT user_id, stakes_contributed FROM public.session_participants 
        WHERE session_id = session_id_param AND status = 'joined' AND stakes_contributed > 0
      LOOP
        DECLARE
          refund_amount INTEGER := participants.stakes_contributed - FLOOR(participants.stakes_contributed * 0.1);
        BEGIN
          PERFORM public.add_tokens(
            participants.user_id,
            refund_amount,
            'regular',
            'session_stakes_refund',
            'Stakes refunded from completed session (minus platform fee)'
          );
        END;
      END LOOP;
    END IF;
  END IF;
  
  -- Award XP based on duration
  DECLARE
    base_xp INTEGER := 20;
    duration_bonus INTEGER := session_duration_minutes / 5;
    total_xp INTEGER := base_xp + duration_bonus;
  BEGIN
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
  END;
  
  result := json_build_object(
    'success', true,
    'session_type', session_record.session_type,
    'session_duration_minutes', session_duration_minutes,
    'xp_granted', base_xp + (session_duration_minutes / 5),
    'participant_count', participant_count,
    'total_stakes', total_stakes,
    'platform_fee', platform_fee,
    'remaining_pool', remaining_pool
  );
  
  RETURN result;
END;
$$;

-- Create doubles winner selection function
CREATE OR REPLACE FUNCTION public.select_doubles_winners(
  session_id_param UUID,
  winning_team_members JSONB
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  result JSON;
BEGIN
  -- Validate session exists and is completed
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;
  
  IF session_record.session_ended_at IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not yet completed');
  END IF;
  
  -- Validate winning team structure
  IF winning_team_members IS NULL OR jsonb_array_length(winning_team_members) = 0 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid winning team data');
  END IF;
  
  -- Update session with winning team
  UPDATE public.sessions
  SET winning_team = winning_team_members,
      updated_at = now()
  WHERE id = session_id_param;
  
  result := json_build_object(
    'success', true,
    'session_id', session_id_param,
    'winning_team', winning_team_members,
    'message', 'Doubles winners selected successfully'
  );
  
  RETURN result;
END;
$$;

-- Create alias function for end_session_with_hp_calculation
CREATE OR REPLACE FUNCTION public.end_session_with_hp_calculation(
  session_id_param UUID,
  winner_id_param UUID DEFAULT NULL,
  winning_team_param JSONB DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.complete_session_with_hp(session_id_param, winner_id_param, winning_team_param);
END;
$$;