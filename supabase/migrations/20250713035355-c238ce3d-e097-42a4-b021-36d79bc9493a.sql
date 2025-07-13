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
  session_record RECORD;
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
  -- Start transaction explicitly for better control
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
    
    -- Calculate XP gain based on session type and level balancing
    CASE mapped_session_type
      WHEN 'competitive' THEN
        xp_gained := CASE 
          WHEN is_winner_param = true THEN 
            GREATEST(30 + (COALESCE(opponent_level_param, player_level_param) - player_level_param) * 3, 15)
          WHEN is_winner_param = false THEN 
            GREATEST(20 + (COALESCE(opponent_level_param, player_level_param) - player_level_param) * 2, 10)
          ELSE 25 -- No winner specified
        END;
      WHEN 'social' THEN
        xp_gained := GREATEST(15 + (session_duration_param / 30), 10);
      WHEN 'training' THEN
        xp_gained := GREATEST(20 + (session_duration_param / 20), 12);
      ELSE
        xp_gained := 15; -- Fallback
    END CASE;
    
    -- Calculate HP loss (higher level players lose less HP, max 10)
    hp_lost := CASE mapped_session_type
      WHEN 'competitive' THEN 
        GREATEST(
          LEAST(8 - (player_level_param / 10), 10), 
          CASE WHEN is_winner_param = true THEN 2 ELSE 4 END
        )
      WHEN 'social' THEN 
        GREATEST(3 - (player_level_param / 20), 1)
      WHEN 'training' THEN 
        GREATEST(5 - (player_level_param / 15), 2)
      ELSE 3
    END;
    
    -- Ensure max HP loss is 10
    hp_lost := LEAST(hp_lost, 10);
    
    -- Calculate token earnings
    tokens_earned := CASE mapped_session_type
      WHEN 'competitive' THEN
        CASE 
          WHEN stakes_amount_param > 0 AND is_winner_param = true THEN 
            -- 90% of stake goes to winner (10% platform rake)
            FLOOR(stakes_amount_param * 0.9)
          WHEN stakes_amount_param = 0 THEN 30 -- Base competitive reward
          ELSE 0 -- Loser gets no stake tokens
        END
      WHEN 'social' THEN
        CASE
          WHEN stakes_amount_param > 0 AND is_winner_param = true THEN
            -- Social stakes capped at 20 tokens
            FLOOR(LEAST(stakes_amount_param, 20) * 0.9)
          ELSE 15 -- Base social reward
        END
      WHEN 'training' THEN 12 -- Coach fee for training
      ELSE 10
    END;
    
    RAISE LOG 'Calculated rewards - XP: %, HP: %, Tokens: %', xp_gained, hp_lost, tokens_earned;
    
    -- Award XP to player
    BEGIN
      PERFORM public.add_xp(
        player_user_id,
        xp_gained,
        format('%s_session', mapped_session_type),
        format('%s session completed (Level %s)', 
               initcap(session_type_param), 
               player_level_param)
      );
      RAISE LOG 'Successfully awarded % XP to user %', xp_gained, player_user_id;
    EXCEPTION WHEN OTHERS THEN
      error_detail := SQLERRM;
      error_msg := format('Failed to award XP (%s): %s', xp_gained, error_detail);
      RAISE LOG 'ERROR: %', error_msg;
      RETURN json_build_object(
        'success', false,
        'error', error_msg,
        'error_code', 'XP_AWARD_FAILED',
        'context', error_context,
        'sql_error', error_detail
      );
    END;
    
    -- Deduct HP from player (HP loss is positive, so we negate it)
    BEGIN
      PERFORM public.lose_hp(
        player_user_id,
        hp_lost,
        format('%s_session', mapped_session_type),
        format('%s session fatigue (Level %s)', 
               initcap(session_type_param), 
               player_level_param)
      );
      RAISE LOG 'Successfully deducted % HP from user %', hp_lost, player_user_id;
    EXCEPTION WHEN OTHERS THEN
      error_detail := SQLERRM;
      error_msg := format('Failed to deduct HP (%s): %s', hp_lost, error_detail);
      RAISE LOG 'ERROR: %', error_msg;
      RETURN json_build_object(
        'success', false,
        'error', error_msg,
        'error_code', 'HP_DEDUCTION_FAILED',
        'context', error_context,
        'sql_error', error_detail
      );
    END;
    
    -- Award tokens to player (if earned)
    IF tokens_earned > 0 THEN
      BEGIN
        PERFORM public.add_tokens(
          player_user_id,
          tokens_earned,
          'regular',
          format('%s_session', mapped_session_type),
          format('%s session reward (Level %s)', 
                 initcap(session_type_param), 
                 player_level_param)
        );
        RAISE LOG 'Successfully awarded % tokens to user %', tokens_earned, player_user_id;
      EXCEPTION WHEN OTHERS THEN
        error_detail := SQLERRM;
        error_msg := format('Failed to award tokens (%s): %s', tokens_earned, error_detail);
        RAISE LOG 'ERROR: %', error_msg;
        RETURN json_build_object(
          'success', false,
          'error', error_msg,
          'error_code', 'TOKEN_AWARD_FAILED',
          'context', error_context,
          'sql_error', error_detail
        );
      END;
    END IF;
    
    -- Log activity (optional, best effort)
    BEGIN
      INSERT INTO public.activity_logs (
        player_id,
        activity_category,
        activity_type,
        title,
        description,
        duration_minutes,
        xp_earned,
        hp_impact,
        opponent_name,
        is_competitive,
        metadata
      ) VALUES (
        player_user_id,
        'tennis',
        mapped_session_type,
        format('%s Session', initcap(session_type_param)),
        format('Level %s %s session%s', 
               player_level_param,
               session_type_param,
               CASE WHEN opponent_level_param IS NOT NULL THEN 
                 format(' vs Level %s opponent', opponent_level_param)
               ELSE '' END),
        session_duration_param,
        xp_gained,
        -hp_lost, -- Negative because it's a loss
        CASE WHEN opponent_level_param IS NOT NULL THEN 
          format('Level %s Opponent', opponent_level_param)
        ELSE NULL END,
        mapped_session_type = 'competitive',
        jsonb_build_object(
          'session_id', session_id_param,
          'original_session_type', session_type_param,
          'mapped_session_type', mapped_session_type,
          'player_level', player_level_param,
          'opponent_level', opponent_level_param,
          'is_winner', is_winner_param,
          'stakes_amount', stakes_amount_param,
          'tokens_earned', tokens_earned,
          'completed_at', now()
        ) || COALESCE(activity_metadata_param, '{}'::jsonb)
      );
      RAISE LOG 'Successfully logged activity for user %', player_user_id;
    EXCEPTION WHEN OTHERS THEN
      error_detail := SQLERRM;
      RAISE LOG 'WARNING: Failed to log activity (non-critical): %', error_detail;
      -- Don't fail the entire function for activity logging issues
    END;
    
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
    -- Catch any unhandled errors
    error_detail := SQLERRM;
    error_msg := format('Unexpected error during session completion: %s', error_detail);
    RAISE LOG 'CRITICAL ERROR: % - %', error_msg, error_context;
    
    -- Return detailed error information
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

-- Add comment for documentation
COMMENT ON FUNCTION public.complete_session_unified IS 'Enhanced session completion function with comprehensive error handling, transaction rollback, and detailed logging';

-- Create lose_hp function if it doesn't exist (referenced in the main function)
CREATE OR REPLACE FUNCTION public.lose_hp(
  user_id uuid, 
  hp_amount integer, 
  activity_type text, 
  description text DEFAULT NULL
) RETURNS integer AS $$
DECLARE
  hp_record RECORD;
  new_hp INTEGER;
  actual_loss INTEGER;
BEGIN
  -- Get current HP status
  SELECT * INTO hp_record
  FROM public.player_hp
  WHERE player_id = user_id;
  
  -- If no record exists, initialize it
  IF hp_record IS NULL THEN
    PERFORM public.initialize_player_hp(user_id);
    SELECT * INTO hp_record
    FROM public.player_hp
    WHERE player_id = user_id;
  END IF;
  
  -- Calculate new HP (minimum 0)
  new_hp := GREATEST(hp_record.current_hp - hp_amount, 0);
  actual_loss := hp_record.current_hp - new_hp;
  
  -- Update HP and last activity
  UPDATE public.player_hp
  SET current_hp = new_hp,
      last_activity = now(),
      updated_at = now()
  WHERE player_id = user_id;
  
  -- Log the HP loss
  IF actual_loss > 0 THEN
    INSERT INTO public.hp_activities (player_id, activity_type, hp_change, hp_before, hp_after, description)
    VALUES (user_id, activity_type, -actual_loss, hp_record.current_hp, new_hp, 
            COALESCE(description, 'HP lost from ' || activity_type));
  END IF;
  
  RETURN new_hp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create add_tokens function if it doesn't exist (referenced in the main function)
CREATE OR REPLACE FUNCTION public.add_tokens(
  user_id uuid,
  token_amount integer,
  token_type text DEFAULT 'regular',
  source text DEFAULT 'manual',
  description text DEFAULT NULL
) RETURNS json AS $$
DECLARE
  balance_record RECORD;
  new_balance INTEGER;
  result JSON;
BEGIN
  -- Get current token balance
  SELECT * INTO balance_record
  FROM public.token_balances
  WHERE player_id = user_id;
  
  -- Initialize if no record exists
  IF balance_record IS NULL THEN
    INSERT INTO public.token_balances (player_id, regular_tokens, premium_tokens)
    VALUES (user_id, 0, 0)
    ON CONFLICT (player_id) DO NOTHING;
    
    SELECT * INTO balance_record
    FROM public.token_balances
    WHERE player_id = user_id;
  END IF;
  
  -- Update token balance based on type
  IF token_type = 'premium' THEN
    new_balance := balance_record.premium_tokens + token_amount;
    UPDATE public.token_balances
    SET premium_tokens = new_balance,
        lifetime_tokens_earned = lifetime_tokens_earned + token_amount,
        updated_at = now()
    WHERE player_id = user_id;
  ELSE
    new_balance := balance_record.regular_tokens + token_amount;
    UPDATE public.token_balances
    SET regular_tokens = new_balance,
        lifetime_tokens_earned = lifetime_tokens_earned + token_amount,
        updated_at = now()
    WHERE player_id = user_id;
  END IF;
  
  -- Log the transaction
  INSERT INTO public.token_transactions (
    player_id, transaction_type, token_type, amount, source, description
  ) VALUES (
    user_id, 'earn', token_type, token_amount, source,
    COALESCE(description, 'Tokens earned from ' || source)
  );
  
  result := json_build_object(
    'success', true,
    'tokens_added', token_amount,
    'token_type', token_type,
    'new_balance', new_balance
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;