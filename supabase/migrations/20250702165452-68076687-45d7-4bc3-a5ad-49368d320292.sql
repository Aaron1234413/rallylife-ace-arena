-- Phase 1: Smart HP/XP System with Diminishing Returns
-- Update complete_session function with realistic HP costs and XP rewards

CREATE OR REPLACE FUNCTION public.complete_session(
  session_id_param UUID,
  winner_id_param UUID DEFAULT NULL,
  completion_type TEXT DEFAULT 'normal',
  session_duration_minutes INTEGER DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_record RECORD;
  total_stakes INTEGER := 0;
  participant_count INTEGER := 0;
  organizer_share INTEGER := 0;
  participant_share INTEGER := 0;
  hp_per_participant INTEGER := 0;
  xp_per_participant INTEGER := 0;
  hp_cost INTEGER := 0;
  base_hp_cost INTEGER := 0;
  max_hp_cost INTEGER := 0;
  minutes_tier1 INTEGER := 0; -- 0-30 min (1.0x multiplier)
  minutes_tier2 INTEGER := 0; -- 31-60 min (0.7x multiplier)  
  minutes_tier3 INTEGER := 0; -- 61-120 min (0.4x multiplier)
  minutes_tier4 INTEGER := 0; -- 120+ min (0.2x multiplier)
  tier1_cost INTEGER := 0;
  tier2_cost INTEGER := 0;
  tier3_cost INTEGER := 0;
  tier4_cost INTEGER := 0;
  result JSON;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param AND status = 'active';
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found or not active');
  END IF;
  
  -- Count participants and calculate total stakes
  SELECT COUNT(*) INTO participant_count
  FROM public.session_participants
  WHERE session_id = session_id_param AND status = 'joined';
  
  total_stakes := session_record.stakes_amount * participant_count;
  
  -- Update session status
  UPDATE public.sessions
  SET 
    status = 'completed',
    updated_at = now()
  WHERE id = session_id_param;
  
  -- Calculate XP and HP based on session type and duration
  IF session_duration_minutes IS NOT NULL AND session_duration_minutes > 0 THEN
    
    -- XP Calculation (linear, no diminishing returns)
    CASE session_record.session_type
      WHEN 'training' THEN
        xp_per_participant := session_duration_minutes * 12; -- 12 XP per minute
      WHEN 'match' THEN
        xp_per_participant := session_duration_minutes * 8;  -- 8 XP per minute
      WHEN 'social_play' THEN
        xp_per_participant := session_duration_minutes * 8;  -- 8 XP per minute
      WHEN 'wellbeing' THEN
        xp_per_participant := session_duration_minutes * 5;  -- 5 XP per minute
      ELSE
        xp_per_participant := session_duration_minutes * 5;  -- Default
    END CASE;
    
    -- HP Calculation with diminishing returns (except wellbeing)
    IF session_record.session_type = 'wellbeing' THEN
      -- Wellbeing sessions restore HP (existing logic)
      hp_per_participant := GREATEST(5, LEAST(25, CEIL(session_duration_minutes::NUMERIC / 5)));
      
      -- Grant HP to all participants
      FOR participant_record IN 
        SELECT user_id FROM public.session_participants 
        WHERE session_id = session_id_param AND status = 'joined'
      LOOP
        PERFORM public.restore_hp(
          participant_record.user_id,
          hp_per_participant,
          'wellbeing_session',
          'HP restored from wellbeing session (' || session_duration_minutes || ' minutes)'
        );
        
        -- Grant XP for wellbeing
        PERFORM public.add_xp(
          participant_record.user_id,
          xp_per_participant,
          'wellbeing_session',
          'XP earned from wellbeing session (' || session_duration_minutes || ' minutes)'
        );
      END LOOP;
      
      -- Refund stakes for wellbeing sessions
      IF total_stakes > 0 THEN
        FOR participant_record IN 
          SELECT user_id FROM public.session_participants 
          WHERE session_id = session_id_param AND status = 'joined'
        LOOP
          PERFORM public.add_tokens(
            participant_record.user_id,
            session_record.stakes_amount,
            'regular',
            'session_refund',
            'Stakes refund from wellbeing session'
          );
        END LOOP;
      END IF;
      
      result := json_build_object(
        'success', true,
        'session_type', session_record.session_type,
        'hp_granted', hp_per_participant,
        'xp_granted', xp_per_participant,
        'participant_count', participant_count,
        'session_duration_minutes', session_duration_minutes,
        'total_stakes_refunded', total_stakes
      );
      
      RETURN result;
    ELSE
      -- Calculate HP cost with diminishing returns for other session types
      
      -- Set base costs and caps per session type
      CASE session_record.session_type
        WHEN 'match' THEN
          base_hp_cost := 10;
          max_hp_cost := 60;
        WHEN 'social_play' THEN
          base_hp_cost := 5;
          max_hp_cost := 40;
        WHEN 'training' THEN
          base_hp_cost := 8;
          max_hp_cost := 35;
        ELSE
          base_hp_cost := 5;
          max_hp_cost := 30;
      END CASE;
      
      -- Calculate minutes in each tier with diminishing returns
      minutes_tier1 := LEAST(session_duration_minutes, 30);  -- First 30 minutes at full intensity
      
      IF session_duration_minutes > 30 THEN
        minutes_tier2 := LEAST(session_duration_minutes - 30, 30);  -- Minutes 31-60 at 0.7x
      END IF;
      
      IF session_duration_minutes > 60 THEN
        minutes_tier3 := LEAST(session_duration_minutes - 60, 60);  -- Minutes 61-120 at 0.4x
      END IF;
      
      IF session_duration_minutes > 120 THEN
        minutes_tier4 := session_duration_minutes - 120;  -- Minutes 120+ at 0.2x
      END IF;
      
      -- Calculate HP cost for each tier
      CASE session_record.session_type
        WHEN 'match' THEN
          tier1_cost := ROUND(minutes_tier1 * 1.5 * 1.0);  -- 1.5 HP per minute at full intensity
          tier2_cost := ROUND(minutes_tier2 * 1.5 * 0.7);  -- 1.05 HP per minute
          tier3_cost := ROUND(minutes_tier3 * 1.5 * 0.4);  -- 0.6 HP per minute
          tier4_cost := ROUND(minutes_tier4 * 1.5 * 0.2);  -- 0.3 HP per minute
        WHEN 'social_play' THEN
          tier1_cost := ROUND(minutes_tier1 * 1.0 * 1.0);  -- 1.0 HP per minute
          tier2_cost := ROUND(minutes_tier2 * 1.0 * 0.7);  -- 0.7 HP per minute
          tier3_cost := ROUND(minutes_tier3 * 1.0 * 0.4);  -- 0.4 HP per minute
          tier4_cost := ROUND(minutes_tier4 * 1.0 * 0.2);  -- 0.2 HP per minute
        WHEN 'training' THEN
          tier1_cost := ROUND(minutes_tier1 * 1.2 * 1.0);  -- 1.2 HP per minute
          tier2_cost := ROUND(minutes_tier2 * 1.2 * 0.7);  -- 0.84 HP per minute
          tier3_cost := ROUND(minutes_tier3 * 1.2 * 0.4);  -- 0.48 HP per minute
          tier4_cost := ROUND(minutes_tier4 * 1.2 * 0.2);  -- 0.24 HP per minute
      END CASE;
      
      -- Total HP cost with base cost and cap
      hp_cost := base_hp_cost + tier1_cost + tier2_cost + tier3_cost + tier4_cost;
      hp_cost := LEAST(hp_cost, max_hp_cost);  -- Apply cap
      
      -- Apply HP cost and grant XP to all participants
      FOR participant_record IN 
        SELECT user_id FROM public.session_participants 
        WHERE session_id = session_id_param AND status = 'joined'
      LOOP
        -- Reduce HP (negative HP change)
        INSERT INTO public.hp_activities (player_id, activity_type, hp_change, hp_before, hp_after, description)
        SELECT 
          participant_record.user_id,
          session_record.session_type || '_session',
          -hp_cost,
          current_hp,
          GREATEST(0, current_hp - hp_cost),
          'HP cost from ' || session_record.session_type || ' session (' || session_duration_minutes || ' minutes)'
        FROM public.player_hp 
        WHERE player_id = participant_record.user_id;
        
        -- Update HP (can't go below 0)
        UPDATE public.player_hp
        SET 
          current_hp = GREATEST(0, current_hp - hp_cost),
          last_activity = now(),
          updated_at = now()
        WHERE player_id = participant_record.user_id;
        
        -- Grant XP
        PERFORM public.add_xp(
          participant_record.user_id,
          xp_per_participant,
          session_record.session_type || '_session',
          'XP earned from ' || session_record.session_type || ' session (' || session_duration_minutes || ' minutes)'
        );
      END LOOP;
    END IF;
  ELSE
    -- Default values for sessions without duration
    xp_per_participant := 50;
    hp_cost := 10;
  END IF;
  
  -- Handle stakes distribution for competitive sessions
  IF total_stakes > 0 AND session_record.session_type != 'wellbeing' THEN
    IF session_record.session_type = 'match' THEN
      -- Winner-takes-all for competitive matches
      IF winner_id_param IS NOT NULL THEN
        PERFORM public.add_tokens(
          winner_id_param,
          total_stakes,
          'regular',
          'session_winnings',
          'Match winnings from stakes pool'
        );
      ELSE
        -- If no winner specified, split equally among participants
        participant_share := total_stakes / participant_count;
        FOR participant_record IN 
          SELECT user_id FROM public.session_participants 
          WHERE session_id = session_id_param AND status = 'joined'
        LOOP
          PERFORM public.add_tokens(
            participant_record.user_id,
            participant_share,
            'regular',
            'session_refund',
            'Stakes refund - no winner declared'
          );
        END LOOP;
      END IF;
    ELSE
      -- 60/40 split for social sessions (organizer gets 60%, participants split 40%)
      organizer_share := ROUND(total_stakes * 0.6);
      participant_share := (total_stakes - organizer_share) / participant_count;
      
      -- Give organizer their share
      PERFORM public.add_tokens(
        session_record.creator_id,
        organizer_share,
        'regular',
        'session_organizer_bonus',
        'Organizer bonus from social session'
      );
      
      -- Give each participant their share
      FOR participant_record IN 
        SELECT user_id FROM public.session_participants 
        WHERE session_id = session_id_param AND status = 'joined'
      LOOP
        PERFORM public.add_tokens(
          participant_record.user_id,
          participant_share,
          'regular',
          'session_participation_reward',
          'Participation reward from social session'
        );
      END LOOP;
    END IF;
  END IF;
  
  result := json_build_object(
    'success', true,
    'session_type', session_record.session_type,
    'session_duration_minutes', COALESCE(session_duration_minutes, 0),
    'xp_granted', xp_per_participant,
    'hp_cost', hp_cost,
    'hp_cap_applied', CASE WHEN (base_hp_cost + tier1_cost + tier2_cost + tier3_cost + tier4_cost) > max_hp_cost THEN true ELSE false END,
    'participant_count', participant_count,
    'total_stakes', total_stakes,
    'distribution_type', CASE 
      WHEN session_record.session_type = 'match' THEN 'winner_takes_all'
      WHEN session_record.session_type = 'wellbeing' THEN 'stakes_refunded'
      ELSE '60_40_split'
    END,
    'organizer_share', CASE 
      WHEN session_record.session_type = 'match' THEN 0
      WHEN session_record.session_type = 'wellbeing' THEN 0
      ELSE organizer_share
    END,
    'participant_share', participant_share,
    'winner_id', winner_id_param
  );
  
  RETURN result;
END;
$$;