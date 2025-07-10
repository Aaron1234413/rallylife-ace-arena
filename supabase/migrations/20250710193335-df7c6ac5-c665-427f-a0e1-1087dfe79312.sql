-- Ensure all Phase 1 database schema requirements are met

-- 1. Check if session_hp_reductions table has all required columns
DO $$
BEGIN
    -- Add missing columns to session_hp_reductions if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_hp_reductions' AND column_name = 'user_level') THEN
        ALTER TABLE session_hp_reductions ADD COLUMN user_level INTEGER NOT NULL DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_hp_reductions' AND column_name = 'session_duration_minutes') THEN
        ALTER TABLE session_hp_reductions ADD COLUMN session_duration_minutes INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- 2. Ensure session_participants has tokens_paid column with proper default
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_participants' AND column_name = 'tokens_paid') THEN
        ALTER TABLE session_participants ADD COLUMN tokens_paid INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. Create or replace the HP reduction calculation function
CREATE OR REPLACE FUNCTION calculate_hp_reduction(
  user_level INTEGER,
  duration_minutes INTEGER,
  session_type TEXT
) RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  base_reduction INTEGER;
  level_modifier NUMERIC;
  final_reduction INTEGER;
BEGIN
  -- Return 0 for social and training sessions (no HP reduction)
  IF session_type IN ('social', 'training') THEN
    RETURN 0;
  END IF;
  
  -- Calculate base reduction: duration / 10 minutes
  base_reduction := GREATEST(1, duration_minutes / 10);
  
  -- Level modifier: (100 - user_level) / 100
  -- Higher level = less HP reduction
  level_modifier := (100.0 - LEAST(user_level, 99)) / 100.0;
  
  -- Apply level modifier and ensure minimum 1 HP for challenge sessions
  final_reduction := GREATEST(1, FLOOR(base_reduction * level_modifier));
  
  RETURN final_reduction;
END;
$$;

-- 4. Create comprehensive session start function
CREATE OR REPLACE FUNCTION start_session_with_tracking(
  session_id_param UUID,
  starter_id_param UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_record RECORD;
  hp_reductions JSON[] := '{}';
  result JSON;
BEGIN
  -- Check if user is the session creator
  SELECT * INTO session_record
  FROM sessions
  WHERE id = session_id_param AND creator_id = starter_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized to start this session');
  END IF;
  
  -- Check if session is already started
  IF session_record.session_started_at IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session already started');
  END IF;
  
  -- Update session with start time
  UPDATE sessions
  SET session_started_at = now(),
      status = 'active',
      updated_at = now()
  WHERE id = session_id_param;
  
  -- For challenge sessions, reduce HP for all participants
  IF session_record.session_type = 'challenge' THEN
    FOR participant_record IN
      SELECT sp.user_id, 
             COALESCE(px.current_level, 1) as user_level,
             COALESCE(ph.current_hp, 100) as current_hp
      FROM session_participants sp
      LEFT JOIN player_xp px ON sp.user_id = px.player_id
      LEFT JOIN player_hp ph ON sp.user_id = ph.player_id
      WHERE sp.session_id = session_id_param
    LOOP
      -- Calculate and apply HP reduction
      DECLARE
        hp_reduction INTEGER;
        estimated_duration INTEGER := 60; -- Estimate 60 minutes for new sessions
      BEGIN
        hp_reduction := calculate_hp_reduction(
          participant_record.user_level,
          estimated_duration,
          session_record.session_type
        );
        
        -- Apply HP reduction
        IF hp_reduction > 0 THEN
          PERFORM reduce_hp(
            participant_record.user_id,
            hp_reduction,
            'session_participation',
            'HP reduced for challenge session participation'
          );
          
          -- Log the HP reduction
          INSERT INTO session_hp_reductions (
            session_id, user_id, hp_reduced, user_level, session_duration_minutes
          ) VALUES (
            session_id_param, participant_record.user_id, hp_reduction, 
            participant_record.user_level, estimated_duration
          );
          
          hp_reductions := hp_reductions || json_build_object(
            'user_id', participant_record.user_id,
            'hp_reduced', hp_reduction,
            'hp_before', participant_record.current_hp,
            'hp_after', participant_record.current_hp - hp_reduction
          )::JSON;
        END IF;
      END;
    END LOOP;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'hp_reductions', hp_reductions,
    'session_started_at', session_record.session_started_at
  );
END;
$$;

-- 5. Create comprehensive session completion function
CREATE OR REPLACE FUNCTION complete_session_with_hp(
  session_id_param UUID,
  winner_id_param UUID DEFAULT NULL,
  winning_team_param TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_count INTEGER;
  total_stakes INTEGER;
  platform_fee INTEGER;
  winner_payout INTEGER;
  session_duration INTEGER;
  total_hp_consumed INTEGER := 0;
  tokens_distributed INTEGER := 0;
  result JSON;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM sessions
  WHERE id = session_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;
  
  -- Check if session is already completed
  IF session_record.session_ended_at IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session already completed');
  END IF;
  
  -- Calculate session duration
  IF session_record.session_started_at IS NOT NULL THEN
    session_duration := EXTRACT(EPOCH FROM (now() - session_record.session_started_at)) / 60;
  ELSE
    session_duration := 60; -- Default 1 hour if not started properly
  END IF;
  
  -- Get participant count
  SELECT COUNT(*) INTO participant_count
  FROM session_participants
  WHERE session_id = session_id_param;
  
  -- Calculate token distribution for challenge sessions
  IF session_record.session_type = 'challenge' AND session_record.stakes_amount > 0 THEN
    total_stakes := session_record.stakes_amount * participant_count;
    platform_fee := FLOOR(total_stakes * (session_record.platform_fee_percentage::NUMERIC / 100));
    winner_payout := total_stakes - platform_fee;
    
    -- Distribute tokens to winner
    IF winner_id_param IS NOT NULL THEN
      PERFORM add_tokens(
        winner_id_param,
        winner_payout,
        'regular',
        'session_victory',
        'Challenge session victory payout'
      );
      tokens_distributed := winner_payout;
    END IF;
  END IF;
  
  -- Calculate total HP consumed from this session
  SELECT COALESCE(SUM(hp_reduced), 0) INTO total_hp_consumed
  FROM session_hp_reductions
  WHERE session_id = session_id_param;
  
  -- Award XP to all participants based on duration
  DECLARE
    participant_record RECORD;
    xp_reward INTEGER;
  BEGIN
    FOR participant_record IN
      SELECT user_id FROM session_participants WHERE session_id = session_id_param
    LOOP
      -- Calculate XP: 2 XP per minute, bonus for longer sessions
      xp_reward := LEAST(session_duration * 2, 200); -- Max 200 XP per session
      
      PERFORM add_xp(
        participant_record.user_id,
        xp_reward,
        'session_completion',
        format('Completed %s session (%s minutes)', session_record.session_type, session_duration)
      );
    END LOOP;
  END;
  
  -- Update session completion
  UPDATE sessions
  SET session_ended_at = now(),
      winner_id = winner_id_param,
      winning_team = CASE WHEN winning_team_param IS NOT NULL THEN to_jsonb(winning_team_param) ELSE NULL END,
      status = 'completed',
      updated_at = now()
  WHERE id = session_id_param;
  
  RETURN json_build_object(
    'success', true,
    'session_duration', session_duration,
    'total_hp_consumed', total_hp_consumed,
    'tokens_distributed', tokens_distributed,
    'platform_fee', COALESCE(platform_fee, 0),
    'participant_count', participant_count
  );
END;
$$;

-- 6. Create session joining function with HP validation
CREATE OR REPLACE FUNCTION join_session_with_hp_check(
  session_id_param UUID,
  user_id_param UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  user_hp INTEGER;
  participant_count INTEGER;
  tokens_cost INTEGER := 0;
  hp_cost INTEGER := 0;
  result JSON;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM sessions
  WHERE id = session_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;
  
  -- Check if session is full
  SELECT COUNT(*) INTO participant_count
  FROM session_participants
  WHERE session_id = session_id_param;
  
  IF participant_count >= session_record.max_players THEN
    RETURN json_build_object('success', false, 'error', 'Session is full');
  END IF;
  
  -- Check if user already joined
  IF EXISTS (SELECT 1 FROM session_participants WHERE session_id = session_id_param AND user_id = user_id_param) THEN
    RETURN json_build_object('success', false, 'error', 'Already joined this session');
  END IF;
  
  -- Check HP requirements for challenge sessions
  IF session_record.session_type = 'challenge' THEN
    SELECT COALESCE(current_hp, 100) INTO user_hp
    FROM player_hp
    WHERE player_id = user_id_param;
    
    -- Require minimum HP for challenge sessions
    IF user_hp < 20 THEN
      RETURN json_build_object('success', false, 'error', 'Not enough HP for challenge session (minimum 20 HP required)');
    END IF;
  END IF;
  
  -- Calculate costs
  IF session_record.session_type = 'training' THEN
    tokens_cost := session_record.stakes_amount; -- Fixed cost for training
  ELSIF session_record.session_type = 'challenge' AND session_record.stakes_amount > 0 THEN
    tokens_cost := session_record.stakes_amount; -- Stakes for challenge
  END IF;
  
  -- Deduct tokens if required
  IF tokens_cost > 0 THEN
    -- Check token balance
    DECLARE
      token_balance INTEGER;
    BEGIN
      SELECT COALESCE(total_tokens + monthly_subscription_tokens + premium_tokens, 0) INTO token_balance
      FROM token_balances
      WHERE player_id = user_id_param;
      
      IF token_balance < tokens_cost THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient tokens');
      END IF;
      
      -- Deduct tokens
      PERFORM spend_tokens(user_id_param, tokens_cost, 'session_join', format('Joined %s session', session_record.session_type));
    END;
  END IF;
  
  -- Add participant
  INSERT INTO session_participants (
    session_id, user_id, role, payment_status, attendance_status, tokens_paid, stakes_contributed
  ) VALUES (
    session_id_param, user_id_param, 'player', 
    CASE WHEN tokens_cost > 0 THEN 'paid' ELSE 'free' END,
    'registered', tokens_cost, tokens_cost
  );
  
  RETURN json_build_object(
    'success', true,
    'tokens_paid', tokens_cost,
    'hp_cost', hp_cost,
    'message', format('Successfully joined %s session', session_record.session_type)
  );
END;
$$;