-- Drop the existing function to replace it completely
DROP FUNCTION IF EXISTS public.complete_session_unified(UUID, UUID, TEXT[], JSONB);

-- Create the updated function that uses proper reward calculations
CREATE OR REPLACE FUNCTION public.complete_session_unified(
  session_id_param UUID,
  winner_id_param UUID DEFAULT NULL,
  winning_team_param TEXT[] DEFAULT NULL,
  completion_data JSONB DEFAULT '{}'::jsonb
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_record RECORD;
  total_stakes INTEGER := 0;
  platform_fee INTEGER := 0;
  net_payout INTEGER := 0;
  session_duration INTEGER := 60; -- Default duration
  participant_count INTEGER := 0;
  result JSON;
  stakes_per_participant INTEGER := 0;
BEGIN
  -- Get session details with participant count and stakes
  SELECT s.*, COUNT(sp.user_id) as participants, COALESCE(SUM(sp.stakes_contributed), 0) as session_stakes
  INTO session_record
  FROM public.sessions s
  LEFT JOIN public.session_participants sp ON s.id = sp.session_id AND sp.status = 'joined'
  WHERE s.id = session_id_param
  GROUP BY s.id, s.session_type, s.status, s.creator_id, s.created_at, s.updated_at, s.start_time, s.end_time, s.location, s.description;

  -- Check if session exists and is not already completed
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;

  IF session_record.status = 'completed' THEN
    RETURN json_build_object('success', false, 'error', 'Session already completed');
  END IF;

  -- Calculate session duration in minutes
  IF session_record.end_time IS NOT NULL AND session_record.start_time IS NOT NULL THEN
    session_duration := EXTRACT(EPOCH FROM (session_record.end_time - session_record.start_time)) / 60;
  ELSE
    -- Use completion_data if available
    session_duration := COALESCE((completion_data->>'duration_minutes')::INTEGER, 60);
  END IF;

  -- Get totals
  total_stakes := session_record.session_stakes;
  participant_count := session_record.participants;

  -- Calculate platform fee (10% of total stakes)
  platform_fee := FLOOR(total_stakes * 0.1);
  net_payout := total_stakes - platform_fee;
  stakes_per_participant := CASE WHEN participant_count > 0 THEN total_stakes / participant_count ELSE 0 END;

  -- Update session status to completed
  UPDATE public.sessions
  SET status = 'completed', updated_at = now()
  WHERE id = session_id_param;

  -- Award tokens to winner if there are stakes
  IF total_stakes > 0 AND winner_id_param IS NOT NULL THEN
    -- Winner gets 90% of total stakes (net payout)
    PERFORM public.add_tokens(
      winner_id_param,
      net_payout,
      'regular',
      'session_win_stakes',
      'Stakes won from ' || session_record.session_type || ' session victory'
    );
  END IF;

  -- Process each participant for XP and HP
  FOR participant_record IN 
    SELECT sp.user_id, p.full_name, 
           COALESCE(px.current_level, 1) as player_level,
           sp.stakes_contributed
    FROM public.session_participants sp
    JOIN public.profiles p ON sp.user_id = p.id
    LEFT JOIN public.player_xp px ON sp.user_id = px.player_id
    WHERE sp.session_id = session_id_param AND sp.status = 'joined'
  LOOP
    DECLARE
      is_winner BOOLEAN := (participant_record.user_id = winner_id_param);
      opponent_level INTEGER := 1; -- Default opponent level
      calculated_xp INTEGER;
      calculated_hp INTEGER;
      base_tokens INTEGER;
    BEGIN
      -- Calculate opponent level (average of other participants for simplicity)
      SELECT COALESCE(AVG(COALESCE(px.current_level, 1)), 1)::INTEGER
      INTO opponent_level
      FROM public.session_participants sp2
      LEFT JOIN public.player_xp px ON sp2.user_id = px.player_id
      WHERE sp2.session_id = session_id_param 
        AND sp2.status = 'joined' 
        AND sp2.user_id != participant_record.user_id;

      -- Calculate XP based on session type and level difference
      CASE session_record.session_type
        WHEN 'competitive' THEN
          -- Lower level gets more XP
          calculated_xp := 20 + GREATEST(0, (opponent_level - participant_record.player_level) * 5) + (session_duration / 10);
        WHEN 'social' THEN
          -- Everyone gets same amount
          calculated_xp := 15 + (session_duration / 15);
        WHEN 'training' THEN
          -- XP increases with time
          calculated_xp := 10 + (session_duration / 5);
        WHEN 'wellbeing' THEN
          calculated_xp := 5 + (session_duration / 20);
        ELSE
          calculated_xp := 15;
      END CASE;

      -- Calculate HP loss based on session type and level (higher level loses less)
      IF session_record.session_type = 'wellbeing' THEN
        -- Wellbeing restores HP
        calculated_hp := LEAST(10, session_duration / 10);
        PERFORM public.restore_hp(
          participant_record.user_id,
          calculated_hp,
          'wellbeing_session',
          'HP restored from wellbeing session'
        );
      ELSE
        -- Calculate HP loss (1 HP per 15 minutes, max 10, higher level loses less)
        calculated_hp := LEAST(
          10,
          GREATEST(1, (session_duration / 15) - (participant_record.player_level / 10))
        );
        
        -- Apply HP loss (stored as negative for consumption)
        PERFORM public.restore_hp(
          participant_record.user_id,
          -calculated_hp,
          session_record.session_type || '_session',
          'HP consumed from ' || session_record.session_type || ' session'
        );
      END IF;

      -- Award XP
      PERFORM public.add_xp(
        participant_record.user_id,
        calculated_xp,
        session_record.session_type || '_session',
        'XP earned from ' || session_record.session_type || ' session'
      );

      -- Award base participation tokens if no stakes involved
      IF total_stakes = 0 THEN
        CASE session_record.session_type
          WHEN 'competitive' THEN base_tokens := 30;
          WHEN 'social' THEN base_tokens := 15;
          WHEN 'training' THEN base_tokens := 20;
          WHEN 'wellbeing' THEN base_tokens := 10;
          ELSE base_tokens := 15;
        END CASE;

        -- Winner gets 90%, others get 10%
        IF is_winner THEN
          base_tokens := FLOOR(base_tokens * 0.9);
        ELSE
          base_tokens := FLOOR(base_tokens * 0.1);
        END IF;

        PERFORM public.add_tokens(
          participant_record.user_id,
          base_tokens,
          'regular',
          session_record.session_type || '_participation',
          'Participation reward from ' || session_record.session_type || ' session'
        );
      END IF;

      -- Log activity with proper HP impact
      INSERT INTO public.activity_logs (
        player_id, activity_type, activity_category, title, description,
        duration_minutes, hp_impact, xp_earned, result, location,
        metadata, logged_at
      )
      VALUES (
        participant_record.user_id,
        session_record.session_type || '_session',
        'session',
        session_record.session_type || ' Session',
        'Participated in ' || session_record.session_type || ' session',
        session_duration,
        CASE WHEN session_record.session_type = 'wellbeing' THEN calculated_hp ELSE -calculated_hp END,
        calculated_xp,
        CASE WHEN is_winner THEN 'won' ELSE 'participated' END,
        session_record.location,
        json_build_object(
          'session_id', session_id_param,
          'participant_count', participant_count,
          'stakes_contributed', participant_record.stakes_contributed,
          'winner_id', winner_id_param
        ),
        now()
      );
    END;
  END LOOP;

  -- Build success response
  result := json_build_object(
    'success', true,
    'session_id', session_id_param,
    'session_type', session_record.session_type,
    'session_duration_minutes', session_duration,
    'participant_count', participant_count,
    'total_stakes', total_stakes,
    'platform_fee', platform_fee,
    'net_payout', net_payout,
    'winner_id', winner_id_param
  );

  RETURN result;

EXCEPTION WHEN OTHERS THEN
  -- Log error and return failure response
  INSERT INTO public.activity_logs (
    player_id, activity_type, activity_category, title, description, metadata, logged_at
  )
  VALUES (
    COALESCE(winner_id_param, session_record.creator_id),
    'session_completion_error',
    'system',
    'Session Completion Failed',
    'Error completing session: ' || SQLERRM,
    json_build_object(
      'session_id', session_id_param,
      'error_message', SQLERRM,
      'error_state', SQLSTATE
    ),
    now()
  );

  RETURN json_build_object(
    'success', false,
    'error', 'Session completion failed: ' || SQLERRM,
    'session_id', session_id_param
  );
END;
$$;