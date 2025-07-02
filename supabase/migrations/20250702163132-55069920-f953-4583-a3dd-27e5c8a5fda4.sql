-- Phase 2: Core Business Logic Updates for Wellbeing Sessions
-- Update complete_session function to auto-grant HP for wellbeing sessions

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
  
  -- Handle wellbeing sessions differently - auto-grant HP based on duration
  IF session_record.session_type = 'wellbeing' THEN
    -- Calculate HP based on duration (1 HP per 5 minutes, minimum 5 HP, maximum 25 HP)
    IF session_duration_minutes IS NOT NULL THEN
      hp_per_participant := GREATEST(5, LEAST(25, CEIL(session_duration_minutes::NUMERIC / 5)));
    ELSE
      hp_per_participant := 10; -- Default HP if duration not provided
    END IF;
    
    -- Grant HP to all participants (including creator)
    FOR participant_record IN 
      SELECT user_id FROM public.session_participants 
      WHERE session_id = session_id_param AND status = 'joined'
    LOOP
      PERFORM public.restore_hp(
        participant_record.user_id,
        hp_per_participant,
        'wellbeing_session',
        'HP restored from wellbeing session (' || COALESCE(session_duration_minutes, 0) || ' minutes)'
      );
    END LOOP;
    
    -- Also grant HP to session creator if they're not already in participants
    IF NOT EXISTS (
      SELECT 1 FROM public.session_participants 
      WHERE session_id = session_id_param AND user_id = session_record.creator_id AND status = 'joined'
    ) THEN
      PERFORM public.restore_hp(
        session_record.creator_id,
        hp_per_participant,
        'wellbeing_session',
        'HP restored from wellbeing session (' || COALESCE(session_duration_minutes, 0) || ' minutes)'
      );
    END IF;
    
    -- Refund stakes for wellbeing sessions since they're not competitive
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
      'participant_count', participant_count,
      'session_duration_minutes', COALESCE(session_duration_minutes, 0),
      'total_stakes_refunded', total_stakes
    );
    
    RETURN result;
  END IF;
  
  -- Handle other session types (existing logic for match, social_play, training)
  IF total_stakes > 0 THEN
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
    'total_stakes', total_stakes,
    'participant_count', participant_count,
    'distribution_type', CASE 
      WHEN session_record.session_type = 'match' THEN 'winner_takes_all'
      ELSE '60_40_split'
    END,
    'organizer_share', CASE 
      WHEN session_record.session_type = 'match' THEN 0
      ELSE organizer_share
    END,
    'participant_share', participant_share,
    'winner_id', winner_id_param
  );
  
  RETURN result;
END;
$$;