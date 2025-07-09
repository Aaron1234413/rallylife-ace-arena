-- Update complete_session function to handle additional completion data
CREATE OR REPLACE FUNCTION public.complete_session(
  session_id_param UUID,
  winner_id_param UUID DEFAULT NULL,
  session_duration_minutes INTEGER DEFAULT NULL,
  completion_notes TEXT DEFAULT NULL,
  session_rating INTEGER DEFAULT NULL,
  match_score TEXT DEFAULT NULL
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
  partner_id UUID := NULL;
  winner_share INTEGER := 0;
  partner_share INTEGER := 0;
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
  
  -- Update session status with completion data
  UPDATE public.sessions
  SET 
    status = 'completed',
    notes = COALESCE(completion_notes, notes),
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
          description => COALESCE(completion_notes, session_record.notes),
          duration_minutes => COALESCE(session_duration_minutes, 30),
          intensity_level => 'light',
          location => session_record.location,
          notes => 'Session completed - HP restored',
          logged_at => now(),
          metadata => jsonb_build_object(
            'session_id', session_id_param,
            'session_type', 'wellbeing',
            'hp_restored', 20,
            'session_rating', session_rating
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
          description => COALESCE(completion_notes, session_record.notes),
          duration_minutes => COALESCE(session_duration_minutes, 60),
          intensity_level => CASE 
            WHEN session_record.session_type = 'match' THEN 'high'
            WHEN session_record.session_type = 'training' THEN 'medium'
            ELSE 'medium'
          END,
          location => session_record.location,
          score => COALESCE(match_score, CASE 
            WHEN session_record.session_type = 'match' AND winner_id_param IS NOT NULL THEN 
              CASE WHEN participant_record.user_id = winner_id_param THEN 'Won' ELSE 'Lost' END
            ELSE NULL
          END),
          result => CASE 
            WHEN session_record.session_type = 'match' AND winner_id_param IS NOT NULL THEN 
              CASE WHEN participant_record.user_id = winner_id_param THEN 'victory' ELSE 'defeat' END
            ELSE 'completed'
          END,
          notes => COALESCE(completion_notes, 'Session completed'),
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
            'format', session_record.format,
            'session_rating', session_rating,
            'match_score', match_score
          )
        ) INTO activity_result;
      EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail session completion
        NULL;
      END;
    END LOOP;
    
    -- CORRECTED STAKES DISTRIBUTION LOGIC
    IF total_stakes > 0 THEN
      IF session_record.session_type = 'match' AND winner_id_param IS NOT NULL THEN
        -- COMPETITIVE MATCH: Winner(s) take 100% of stakes
        IF session_record.format = 'doubles' THEN
          -- Find winner's partner for doubles
          SELECT user_id INTO partner_id
          FROM public.session_participants 
          WHERE session_id = session_id_param 
            AND status = 'joined' 
            AND user_id != winner_id_param
            AND user_id != session_record.creator_id
          LIMIT 1;
          
          -- Split 50/50 between winning team members
          winner_share := total_stakes / 2;
          partner_share := total_stakes - winner_share;
          
          -- Give winner their share
          PERFORM public.add_tokens(
            winner_id_param,
            winner_share,
            'regular',
            'match_winnings',
            'Doubles match winnings - 50% of stakes pool'
          );
          
          -- Give partner their share (if found)
          IF partner_id IS NOT NULL THEN
            PERFORM public.add_tokens(
              partner_id,
              partner_share,
              'regular',
              'match_winnings', 
              'Doubles match winnings - 50% of stakes pool'
            );
          END IF;
          
          organizer_share := 0;
          participant_share := winner_share; -- For reporting
          
        ELSE
          -- SINGLES: Winner takes 100%
          PERFORM public.add_tokens(
            winner_id_param,
            total_stakes,
            'regular',
            'match_winnings',
            'Singles match winnings - 100% of stakes pool'
          );
          
          organizer_share := total_stakes;
          participant_share := 0;
        END IF;
        
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
        -- TRAINING: Organizer gets 60%, participants split remaining 40%
        organizer_share := FLOOR(total_stakes * 0.6);
        participant_share := FLOOR((total_stakes - organizer_share) / participant_count);
        
        -- Give organizer 60% of stakes
        PERFORM public.add_tokens(
          session_record.creator_id,
          organizer_share,
          'regular',
          'training_organizer_fee',
          'Organizer fee - 60% of stakes from training session'
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
            'training_participation',
            'Participation reward - share of 40% stakes from training'
          );
        END LOOP;
      END IF;
    END IF;
    
    result := json_build_object(
      'success', true,
      'session_type', session_record.session_type,
      'session_format', session_record.format,
      'session_duration_minutes', session_duration_minutes,
      'xp_granted', total_xp,
      'hp_cost', hp_cost,
      'total_stakes', total_stakes,
      'distribution_type', CASE 
        WHEN session_record.session_type = 'match' AND winner_id_param IS NOT NULL THEN 
          CASE 
            WHEN session_record.format = 'doubles' THEN 'doubles_50_50_split'
            ELSE 'singles_winner_100%'
          END
        WHEN session_record.session_type IN ('social_play', 'training') THEN 'organizer_60%_participants_40%'
        ELSE 'equal_refund'
      END,
      'organizer_share', organizer_share,
      'participant_share', participant_share,
      'winner_share', winner_share,
      'partner_share', partner_share,
      'participant_count', participant_count,
      'session_rating', session_rating,
      'completion_notes', completion_notes,
      'match_score', match_score
    );
  END IF;
  
  RETURN result;
END;
$$;