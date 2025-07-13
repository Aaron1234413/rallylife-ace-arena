-- Enhanced complete_session_unified function with comprehensive error handling
CREATE OR REPLACE FUNCTION public.complete_session_unified(
  session_id_param UUID,
  session_type_param TEXT,
  player_level_param INTEGER,
  opponent_level_param INTEGER DEFAULT NULL,
  is_winner_param BOOLEAN DEFAULT NULL,
  stakes_amount_param INTEGER DEFAULT 0,
  session_duration_param INTEGER DEFAULT 60,
  activity_metadata_param JSONB DEFAULT '{}'::jsonb
) RETURNS JSON AS $$
DECLARE
  player_user_id UUID;
  mapped_session_type TEXT;
  xp_gained INTEGER;
  hp_lost INTEGER;
  tokens_earned INTEGER;
  final_result JSON;
  error_msg TEXT;
  error_detail TEXT;
  error_context TEXT;
BEGIN
  -- Initialize logging context
  error_context := format('session_id: %s, type: %s, player_level: %s', 
                         session_id_param, session_type_param, player_level_param);
  
  RAISE LOG 'complete_session_unified started - %', error_context;
  
  BEGIN
    -- Get current user ID
    player_user_id := auth.uid();
    
    IF player_user_id IS NULL THEN
      error_msg := 'Authentication required - no user ID available';
      RAISE LOG 'ERROR: %', error_msg;
      RETURN json_build_object(
        'success', false,
        'error', error_msg,
        'error_code', 'AUTH_REQUIRED',
        'context', error_context
      );
    END IF;
    
    RAISE LOG 'Processing session completion for user: % - %', player_user_id, error_context;
    
    -- Map "match" session type to "competitive" for reward calculations
    mapped_session_type := CASE 
      WHEN session_type_param = 'match' THEN 'competitive'
      ELSE session_type_param
    END;
    
    RAISE LOG 'Session type mapped from % to %', session_type_param, mapped_session_type;
    
    -- Validate session type
    IF mapped_session_type NOT IN ('social', 'competitive', 'training') THEN
      error_msg := format('Invalid session type: %s (mapped from %s). Must be one of: social, competitive, training, match', 
                         mapped_session_type, session_type_param);
      RAISE LOG 'ERROR: %', error_msg;
      RETURN json_build_object(
        'success', false,
        'error', error_msg,
        'error_code', 'INVALID_SESSION_TYPE',
        'context', error_context
      );
    END IF;
    
    -- Validate required parameters
    IF player_level_param < 1 OR player_level_param > 100 THEN
      error_msg := format('Invalid player level: %s. Must be between 1 and 100', player_level_param);
      RAISE LOG 'ERROR: %', error_msg;
      RETURN json_build_object(
        'success', false,
        'error', error_msg,
        'error_code', 'INVALID_PLAYER_LEVEL',
        'context', error_context
      );
    END IF;
    
    IF opponent_level_param IS NOT NULL AND (opponent_level_param < 1 OR opponent_level_param > 100) THEN
      error_msg := format('Invalid opponent level: %s. Must be between 1 and 100', opponent_level_param);
      RAISE LOG 'ERROR: %', error_msg;
      RETURN json_build_object(
        'success', false,
        'error', error_msg,
        'error_code', 'INVALID_OPPONENT_LEVEL',
        'context', error_context
      );
    END IF;
    
    IF session_duration_param < 1 OR session_duration_param > 480 THEN
      error_msg := format('Invalid session duration: %s minutes. Must be between 1 and 480 minutes', session_duration_param);
      RAISE LOG 'ERROR: %', error_msg;
      RETURN json_build_object(
        'success', false,
        'error', error_msg,
        'error_code', 'INVALID_DURATION',
        'context', error_context
      );
    END IF;
    
    -- Calculate XP, HP loss, and tokens with level balancing
    CASE mapped_session_type
      WHEN 'competitive' THEN
        xp_gained := CASE 
          WHEN is_winner_param = true THEN 
            GREATEST(30 + (COALESCE(opponent_level_param, player_level_param) - player_level_param) * 3, 15)
          WHEN is_winner_param = false THEN 
            GREATEST(20 + (COALESCE(opponent_level_param, player_level_param) - player_level_param) * 2, 10)
          ELSE 25
        END;
        hp_lost := GREATEST(LEAST(8 - (player_level_param / 10), 10), CASE WHEN is_winner_param = true THEN 2 ELSE 4 END);
        tokens_earned := CASE 
          WHEN stakes_amount_param > 0 AND is_winner_param = true THEN FLOOR(stakes_amount_param * 0.9)
          WHEN stakes_amount_param = 0 THEN 30
          ELSE 0
        END;
      WHEN 'social' THEN
        xp_gained := GREATEST(15 + (session_duration_param / 30), 10);
        hp_lost := GREATEST(3 - (player_level_param / 20), 1);
        tokens_earned := CASE
          WHEN stakes_amount_param > 0 AND is_winner_param = true THEN FLOOR(LEAST(stakes_amount_param, 20) * 0.9)
          ELSE 15
        END;
      WHEN 'training' THEN
        xp_gained := GREATEST(20 + (session_duration_param / 20), 12);
        hp_lost := GREATEST(5 - (player_level_param / 15), 2);
        tokens_earned := 12;
      ELSE
        xp_gained := 15;
        hp_lost := 3;
        tokens_earned := 10;
    END CASE;
    
    -- Ensure max HP loss is 10
    hp_lost := LEAST(hp_lost, 10);
    
    RAISE LOG 'Calculated rewards - XP: %, HP: %, Tokens: %', xp_gained, hp_lost, tokens_earned;
    
    -- Award XP to player
    BEGIN
      PERFORM public.add_xp(
        player_user_id,
        xp_gained,
        format('%s_session', mapped_session_type),
        format('%s session completed (Level %s)', initcap(session_type_param), player_level_param)
      );
      RAISE LOG 'Successfully awarded % XP to user %', xp_gained, player_user_id;
    EXCEPTION WHEN OTHERS THEN
      error_detail := SQLERRM;
      error_msg := format('Failed to award XP (%s): %s', xp_gained, error_detail);
      RAISE LOG 'ERROR: %', error_msg;
      RETURN json_build_object('success', false, 'error', error_msg, 'error_code', 'XP_AWARD_FAILED', 'context', error_context, 'sql_error', error_detail);
    END;
    
    -- Deduct HP from player
    BEGIN
      PERFORM public.lose_hp(
        player_user_id,
        hp_lost,
        format('%s_session', mapped_session_type),
        format('%s session fatigue (Level %s)', initcap(session_type_param), player_level_param)
      );
      RAISE LOG 'Successfully deducted % HP from user %', hp_lost, player_user_id;
    EXCEPTION WHEN OTHERS THEN
      error_detail := SQLERRM;
      error_msg := format('Failed to deduct HP (%s): %s', hp_lost, error_detail);
      RAISE LOG 'ERROR: %', error_msg;
      RETURN json_build_object('success', false, 'error', error_msg, 'error_code', 'HP_DEDUCTION_FAILED', 'context', error_context, 'sql_error', error_detail);
    END;
    
    -- Award tokens if earned
    IF tokens_earned > 0 THEN
      BEGIN
        PERFORM public.add_tokens(
          player_user_id,
          tokens_earned,
          'regular',
          format('%s_session', mapped_session_type),
          format('%s session reward (Level %s)', initcap(session_type_param), player_level_param)
        );
        RAISE LOG 'Successfully awarded % tokens to user %', tokens_earned, player_user_id;
      EXCEPTION WHEN OTHERS THEN
        error_detail := SQLERRM;
        error_msg := format('Failed to award tokens (%s): %s', tokens_earned, error_detail);
        RAISE LOG 'ERROR: %', error_msg;
        RETURN json_build_object('success', false, 'error', error_msg, 'error_code', 'TOKEN_AWARD_FAILED', 'context', error_context, 'sql_error', error_detail);
      END;
    END IF;
    
    -- Build success response
    final_result := json_build_object(
      'success', true,
      'session_id', session_id_param,
      'session_type', session_type_param,
      'mapped_session_type', mapped_session_type,
      'rewards', json_build_object(
        'xp_gained', xp_gained,
        'hp_lost', hp_lost,
        'tokens_earned', tokens_earned
      ),
      'session_details', json_build_object(
        'player_level', player_level_param,
        'opponent_level', opponent_level_param,
        'is_winner', is_winner_param,
        'stakes_amount', stakes_amount_param,
        'duration_minutes', session_duration_param
      ),
      'completed_at', now()
    );
    
    RAISE LOG 'Session completion successful - %', error_context;
    RETURN final_result;
    
  EXCEPTION WHEN OTHERS THEN
    error_detail := SQLERRM;
    error_msg := format('Unexpected error during session completion: %s', error_detail);
    RAISE LOG 'CRITICAL ERROR: % - %', error_msg, error_context;
    
    RETURN json_build_object(
      'success', false,
      'error', error_msg,
      'error_code', 'UNEXPECTED_ERROR',
      'context', error_context,
      'sql_error', error_detail,
      'sql_state', SQLSTATE
    );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function comment
COMMENT ON FUNCTION public.complete_session_unified IS 'Enhanced session completion function with comprehensive error handling, transaction rollback, and detailed logging for all session types including match';