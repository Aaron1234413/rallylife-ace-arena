-- Update complete_session_unified function to handle session type mapping and add logging
CREATE OR REPLACE FUNCTION public.complete_session_unified(
  session_id_param UUID,
  winner_id_param UUID DEFAULT NULL,
  winning_team_param TEXT[] DEFAULT NULL,
  completion_data JSONB DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_record RECORD;
  result JSON;
  session_duration INTEGER;
  mapped_session_type TEXT;
  total_xp_awarded INTEGER := 0;
  total_hp_consumed INTEGER := 0;
  total_tokens_awarded INTEGER := 0;
  debug_info JSONB := '{}';
BEGIN
  -- Log function call
  RAISE LOG 'complete_session_unified called with session_id: %, winner_id: %, winning_team: %', 
    session_id_param, winner_id_param, winning_team_param;
  
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF session_record IS NULL THEN
    RAISE LOG 'Session not found: %', session_id_param;
    RETURN json_build_object(
      'success', false,
      'error', 'Session not found',
      'session_id', session_id_param
    );
  END IF;
  
  -- Map session type (match -> competitive)
  mapped_session_type := CASE 
    WHEN session_record.session_type = 'match' THEN 'competitive'
    WHEN session_record.session_type IN ('social', 'training', 'wellbeing') THEN session_record.session_type
    ELSE 'competitive' -- default fallback
  END CASE;
  
  RAISE LOG 'Session type mapping: % -> %', session_record.session_type, mapped_session_type;
  
  -- Calculate session duration
  session_duration := COALESCE(
    EXTRACT(EPOCH FROM (session_record.ended_at - session_record.started_at)) / 60,
    60
  )::INTEGER;
  
  RAISE LOG 'Session duration calculated: % minutes', session_duration;
  
  -- Update session status to completed
  UPDATE public.sessions
  SET 
    status = 'completed',
    ended_at = COALESCE(ended_at, now()),
    winner_id = winner_id_param,
    completion_data = COALESCE(completion_data, '{}'),
    updated_at = now()
  WHERE id = session_id_param;
  
  RAISE LOG 'Session status updated to completed';
  
  -- Process each participant
  FOR participant_record IN 
    SELECT sp.*, p.full_name, p.current_level
    FROM public.session_participants sp
    JOIN public.profiles p ON sp.participant_id = p.id
    WHERE sp.session_id = session_id_param
  LOOP
    DECLARE
      is_winner BOOLEAN := false;
      xp_amount INTEGER := 0;
      hp_amount INTEGER := 0;
      token_amount INTEGER := 0;
      calculation_details JSONB;
    BEGIN
      RAISE LOG 'Processing participant: % (level: %)', participant_record.full_name, participant_record.current_level;
      
      -- Determine if participant is winner
      is_winner := (winner_id_param IS NOT NULL AND participant_record.participant_id = winner_id_param) OR
                   (winning_team_param IS NOT NULL AND participant_record.participant_id = ANY(winning_team_param::UUID[]));
      
      RAISE LOG 'Participant % is winner: %', participant_record.full_name, is_winner;
      
      -- Calculate rewards based on mapped session type
      CASE mapped_session_type
        WHEN 'competitive' THEN
          xp_amount := CASE WHEN is_winner THEN 100 ELSE 50 END;
          hp_amount := CASE WHEN is_winner THEN 5 ELSE 15 END; -- winners lose less HP
          token_amount := CASE WHEN is_winner THEN 50 ELSE 25 END;
          
        WHEN 'social' THEN
          xp_amount := 30;
          hp_amount := 0; -- no HP loss for social
          token_amount := 20;
          
        WHEN 'training' THEN
          xp_amount := 40;
          hp_amount := 5; -- light HP loss
          token_amount := 15;
          
        WHEN 'wellbeing' THEN
          xp_amount := 20;
          hp_amount := -10; -- restore HP
          token_amount := 10;
          
        ELSE
          RAISE LOG 'Unknown session type: %, using default values', mapped_session_type;
          xp_amount := 25;
          hp_amount := 10;
          token_amount := 15;
      END CASE;
      
      -- Adjust for session duration (longer sessions = more rewards)
      IF session_duration > 60 THEN
        xp_amount := xp_amount + (session_duration - 60) / 30 * 10;
        token_amount := token_amount + (session_duration - 60) / 30 * 5;
      END IF;
      
      RAISE LOG 'Calculated rewards for %: XP=%, HP=%, Tokens=%', 
        participant_record.full_name, xp_amount, hp_amount, token_amount;
      
      -- Award XP
      IF xp_amount > 0 THEN
        INSERT INTO public.xp_activities (player_id, activity_type, xp_earned, description)
        VALUES (participant_record.participant_id, 'session_completion', xp_amount, 
                format('Completed %s session', mapped_session_type));
        
        UPDATE public.player_xp 
        SET total_xp_earned = total_xp_earned + xp_amount,
            updated_at = now()
        WHERE player_id = participant_record.participant_id;
        
        total_xp_awarded := total_xp_awarded + xp_amount;
      END IF;
      
      -- Handle HP (positive = consume, negative = restore)
      IF hp_amount != 0 THEN
        IF hp_amount > 0 THEN
          -- Consume HP
          INSERT INTO public.hp_activities (player_id, activity_type, hp_change, description)
          VALUES (participant_record.participant_id, 'session_completion', -hp_amount,
                  format('HP consumed from %s session', mapped_session_type));
          
          UPDATE public.player_hp
          SET current_hp = GREATEST(current_hp - hp_amount, 0),
              updated_at = now()
          WHERE player_id = participant_record.participant_id;
          
          total_hp_consumed := total_hp_consumed + hp_amount;
        ELSE
          -- Restore HP
          INSERT INTO public.hp_activities (player_id, activity_type, hp_change, description)
          VALUES (participant_record.participant_id, 'session_completion', -hp_amount,
                  format('HP restored from %s session', mapped_session_type));
          
          UPDATE public.player_hp
          SET current_hp = LEAST(current_hp - hp_amount, max_hp),
              updated_at = now()
          WHERE player_id = participant_record.participant_id;
        END IF;
      END IF;
      
      -- Award tokens
      IF token_amount > 0 THEN
        INSERT INTO public.token_transactions (player_id, transaction_type, token_type, amount, source, description)
        VALUES (participant_record.participant_id, 'earn', 'regular', token_amount, 'session_completion',
                format('Tokens earned from %s session', mapped_session_type));
        
        UPDATE public.token_balances
        SET regular_tokens = regular_tokens + token_amount,
            lifetime_tokens_earned = lifetime_tokens_earned + token_amount,
            updated_at = now()
        WHERE player_id = participant_record.participant_id;
        
        total_tokens_awarded := total_tokens_awarded + token_amount;
      END IF;
      
      -- Log reward transaction
      INSERT INTO public.reward_transactions (
        session_id, participant_id, transaction_type, amount, calculation_data
      ) VALUES (
        session_id_param, participant_record.participant_id, 'session_completion', 
        json_build_object('xp', xp_amount, 'hp', hp_amount, 'tokens', token_amount)::NUMERIC,
        json_build_object(
          'session_type', mapped_session_type,
          'original_type', session_record.session_type,
          'is_winner', is_winner,
          'duration_minutes', session_duration,
          'rewards', json_build_object('xp', xp_amount, 'hp', hp_amount, 'tokens', token_amount)
        )
      );
      
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Error processing participant %: %', participant_record.participant_id, SQLERRM;
      -- Continue with other participants
    END;
  END LOOP;
  
  -- Build debug info
  debug_info := json_build_object(
    'session_type_mapping', json_build_object(
      'original', session_record.session_type,
      'mapped', mapped_session_type
    ),
    'duration_minutes', session_duration,
    'totals', json_build_object(
      'xp_awarded', total_xp_awarded,
      'hp_consumed', total_hp_consumed,
      'tokens_awarded', total_tokens_awarded
    )
  );
  
  RAISE LOG 'Session completion summary: %', debug_info;
  
  -- Return success result
  result := json_build_object(
    'success', true,
    'session_id', session_id_param,
    'session_type', mapped_session_type,
    'original_type', session_record.session_type,
    'duration_minutes', session_duration,
    'winner_id', winner_id_param,
    'total_xp_awarded', total_xp_awarded,
    'total_hp_consumed', total_hp_consumed,
    'total_tokens_awarded', total_tokens_awarded,
    'debug_info', debug_info
  );
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Critical error in complete_session_unified: %', SQLERRM;
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'session_id', session_id_param,
    'debug_info', debug_info
  );
END;
$$;