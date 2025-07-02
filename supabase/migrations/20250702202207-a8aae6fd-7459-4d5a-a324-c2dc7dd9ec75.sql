-- Fix stakes distribution in complete_session function
-- Part 1: Correct Stakes Distribution Logic
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
  participant_record RECORD;
  total_stakes INTEGER := 0;
  participant_count INTEGER := 0;
  organizer_share INTEGER := 0;
  participant_share INTEGER := 0;
  result JSON;
  base_xp INTEGER := 30;
  duration_bonus INTEGER := 0;
  total_xp INTEGER;
  hp_cost INTEGER := 0;
  hp_cap_applied BOOLEAN := false;
  new_hp INTEGER;
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
  
  -- Calculate XP and HP for regular sessions (not wellbeing)
  IF session_record.session_type != 'wellbeing' THEN
    -- Calculate XP based on duration
    IF session_duration_minutes IS NOT NULL THEN
      duration_bonus := session_duration_minutes / 10;
    ELSE
      duration_bonus := 6; -- Default 60 minutes = 6 bonus
    END IF;
    total_xp := base_xp + duration_bonus;
    
    -- Calculate HP cost based on duration (1 HP per 10 minutes, minimum 3, maximum 15)
    IF session_duration_minutes IS NOT NULL THEN
      hp_cost := GREATEST(3, LEAST(15, session_duration_minutes / 10));
    ELSE
      hp_cost := 6; -- Default for 60 minutes
    END IF;
  END IF;
  
  -- Update session status
  UPDATE public.sessions
  SET 
    status = 'completed',
    updated_at = now()
  WHERE id = session_id_param;
  
  -- Handle different session types
  IF session_record.session_type = 'wellbeing' THEN
    -- Wellbeing sessions restore HP instead of consuming it
    FOR participant_record IN 
      SELECT user_id FROM public.session_participants 
      WHERE session_id = session_id_param AND status = 'joined'
    LOOP
      -- Restore HP for wellbeing activities
      SELECT public.restore_hp(
        participant_record.user_id,
        20, -- Fixed 20 HP restoration
        'wellbeing_session',
        'Wellbeing session completed'
      ) INTO new_hp;
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
          'session_stakes_refund',
          'Stakes refunded from wellbeing session'
        );
      END LOOP;
    END IF;
    
    result := json_build_object(
      'success', true,
      'session_type', 'wellbeing',
      'hp_granted', 20,
      'participant_count', participant_count,
      'total_stakes_refunded', total_stakes
    );
    
  ELSE
    -- Regular sessions (match, social_play, training)
    -- Award XP and consume HP for all participants
    FOR participant_record IN 
      SELECT user_id FROM public.session_participants 
      WHERE session_id = session_id_param AND status = 'joined'
    LOOP
      -- Award XP using 'match' activity type for matches, 'training' for others
      PERFORM public.add_xp(
        participant_record.user_id,
        total_xp,
        CASE WHEN session_record.session_type = 'match' THEN 'match' ELSE 'training' END,
        'Completed ' || session_record.session_type || ' session'
      );
      
      -- Consume HP
      UPDATE public.player_hp
      SET current_hp = GREATEST(20, current_hp - hp_cost),
          last_activity = now(),
          updated_at = now()
      WHERE player_id = participant_record.user_id;
      
      -- Log HP consumption
      INSERT INTO public.hp_activities (player_id, activity_type, hp_change, description)
      VALUES (participant_record.user_id, 'session_completion', -hp_cost, 
              'HP consumed from ' || session_record.session_type || ' session');
    END LOOP;
    
    -- CORRECTED STAKES DISTRIBUTION LOGIC
    IF total_stakes > 0 THEN
      IF session_record.session_type = 'match' AND winner_id_param IS NOT NULL THEN
        -- MATCH: Winner gets 100% of total stakes
        PERFORM public.add_tokens(
          winner_id_param,
          total_stakes,
          'regular',
          'match_winnings',
          'Match winnings - 100% of stakes pool'
        );
        
        organizer_share := total_stakes;
        participant_share := 0;
        
      ELSIF session_record.session_type = 'social_play' THEN
        -- SOCIAL PLAY: Organizer gets 60%, participants split remaining 40%
        organizer_share := FLOOR(total_stakes * 0.6);
        participant_share := FLOOR((total_stakes - organizer_share) / participant_count);
        
        -- Give organizer 60% of stakes
        PERFORM public.add_tokens(
          session_record.creator_id,
          organizer_share,
          'regular',
          'social_play_organizer_fee',
          'Organizer fee - 60% of stakes from social play'
        );
        
        -- Give each participant their share of the remaining 40%
        FOR participant_record IN 
          SELECT user_id FROM public.session_participants 
          WHERE session_id = session_id_param AND status = 'joined'
        LOOP
          PERFORM public.add_tokens(
            participant_record.user_id,
            participant_share,
            'regular',
            'social_play_participation',
            'Participation reward - share of 40% stakes from social play'
          );
        END LOOP;
        
      ELSE
        -- TRAINING/OTHER: Refund stakes equally to all participants
        participant_share := total_stakes / participant_count;
        FOR participant_record IN 
          SELECT user_id FROM public.session_participants 
          WHERE session_id = session_id_param AND status = 'joined'
        LOOP
          PERFORM public.add_tokens(
            participant_record.user_id,
            participant_share,
            'regular',
            'session_stakes_refund',
            'Stakes refunded from completed session'
          );
        END LOOP;
        
        organizer_share := 0;
      END IF;
    END IF;
    
    result := json_build_object(
      'success', true,
      'session_type', session_record.session_type,
      'session_duration_minutes', session_duration_minutes,
      'xp_granted', total_xp,
      'hp_cost', hp_cost,
      'hp_cap_applied', hp_cap_applied,
      'total_stakes', total_stakes,
      'distribution_type', CASE 
        WHEN session_record.session_type = 'match' AND winner_id_param IS NOT NULL THEN 'winner_takes_all_100%'
        WHEN session_record.session_type = 'social_play' THEN 'organizer_60%_participants_40%'
        ELSE 'equal_refund'
      END,
      'organizer_share', organizer_share,
      'participant_share', participant_share,
      'participant_count', participant_count
    );
  END IF;
  
  RETURN result;
END;
$$;