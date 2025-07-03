-- Step 2: Add Activity Logging to Session Completion
-- Update complete_session function to log activities to the feed

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
  activity_result JSON;
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
      
      -- Log wellbeing activity to feed
      BEGIN
        SELECT public.log_comprehensive_activity(
          user_id => participant_record.user_id,
          activity_type => 'recovery',
          activity_category => 'wellbeing',
          title => CASE 
            WHEN session_record.notes LIKE '%meditation%' THEN 'Meditation Session'
            WHEN session_record.notes LIKE '%stretching%' THEN 'Stretching Session'
            ELSE 'Wellbeing Session'
          END,
          description => session_record.notes,
          duration_minutes => COALESCE(session_duration_minutes, 30),
          intensity_level => 'light',
          location => session_record.location,
          notes => 'Session completed - HP restored',
          logged_at => now(),
          metadata => jsonb_build_object(
            'session_id', session_id_param,
            'session_type', 'wellbeing',
            'hp_restored', 20
          )
        ) INTO activity_result;
      EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail session completion
        NULL;
      END;
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
      
      -- Log session activity to feed
      BEGIN
        SELECT public.log_comprehensive_activity(
          user_id => participant_record.user_id,
          activity_type => session_record.session_type,
          activity_category => CASE 
            WHEN session_record.session_type = 'match' THEN 'competitive'
            WHEN session_record.session_type = 'social_play' THEN 'social'  
            WHEN session_record.session_type = 'training' THEN 'training'
            ELSE 'general'
          END,
          title => CASE 
            WHEN session_record.session_type = 'match' THEN 'Match Completed'
            WHEN session_record.session_type = 'social_play' THEN 'Social Play Session'
            WHEN session_record.session_type = 'training' THEN 'Training Session'
            ELSE session_record.session_type || ' Session'
          END,
          description => session_record.notes,
          duration_minutes => COALESCE(session_duration_minutes, 60),
          intensity_level => CASE 
            WHEN session_record.session_type = 'match' THEN 'high'
            WHEN session_record.session_type = 'training' THEN 'medium'
            ELSE 'medium'
          END,
          location => session_record.location,
          score => CASE 
            WHEN session_record.session_type = 'match' AND winner_id_param IS NOT NULL THEN 
              CASE WHEN participant_record.user_id = winner_id_param THEN 'Won' ELSE 'Lost' END
            ELSE NULL
          END,
          result => CASE 
            WHEN session_record.session_type = 'match' AND winner_id_param IS NOT NULL THEN 
              CASE WHEN participant_record.user_id = winner_id_param THEN 'victory' ELSE 'defeat' END
            ELSE 'completed'
          END,
          notes => 'Session completed',
          is_competitive => session_record.session_type = 'match',
          logged_at => now(),
          metadata => jsonb_build_object(
            'session_id', session_id_param,
            'session_type', session_record.session_type,
            'participant_count', participant_count,
            'stakes_amount', session_record.stakes_amount,
            'total_stakes', total_stakes,
            'winner_id', winner_id_param,
            'is_winner', participant_record.user_id = winner_id_param,
            'format', session_record.format
          )
        ) INTO activity_result;
      EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail session completion
        NULL;
      END;
    END LOOP;
    
    -- Handle stakes distribution
    IF total_stakes > 0 THEN
      IF session_record.session_type = 'match' AND winner_id_param IS NOT NULL THEN
        -- Winner takes 70% of total stakes for matches
        organizer_share := FLOOR(total_stakes * 0.7);
        PERFORM public.add_tokens(
          winner_id_param,
          organizer_share,
          'regular',
          'match_winnings',
          'Match winnings from stakes pool'
        );
        
        -- Creator gets 30% organizer fee
        participant_share := total_stakes - organizer_share;
        PERFORM public.add_tokens(
          session_record.creator_id,
          participant_share,
          'regular',
          'match_organize_fee',
          'Organizer fee from match stakes'
        );
      ELSE
        -- For non-match sessions or no winner, split equally among participants
        participant_share := total_stakes / participant_count;
        FOR participant_record IN 
          SELECT user_id FROM public.session_participants 
          WHERE session_id = session_id_param AND status = 'joined'
        LOOP
          PERFORM public.add_tokens(
            participant_record.user_id,
            participant_share,
            'regular',
            'session_participation',
            'Participation reward from session'
          );
        END LOOP;
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
        WHEN session_record.session_type = 'match' AND winner_id_param IS NOT NULL THEN 'winner_takes_all'
        ELSE 'equal_split'
      END,
      'organizer_share', organizer_share,
      'participant_share', participant_share,
      'participant_count', participant_count
    );
  END IF;
  
  RETURN result;
END;
$$;