-- Fix activity_type constraint violation in complete_session_unified function
CREATE OR REPLACE FUNCTION public.complete_session_unified(
  session_id_param UUID,
  winner_id_param UUID DEFAULT NULL,
  winning_team_param TEXT[] DEFAULT NULL,
  completion_data JSONB DEFAULT '{}'::jsonb
) RETURNS JSON AS $$
DECLARE
  session_record RECORD;
  participant_records RECORD[];
  participant_record RECORD;
  
  -- Calculations
  total_stakes INTEGER := 0;
  platform_fee INTEGER := 0;
  net_payout INTEGER := 0;
  participant_count INTEGER := 0;
  
  -- XP and HP calculations
  base_xp INTEGER := 30;
  hp_cost INTEGER := 10;
  calculated_xp INTEGER;
  calculated_hp INTEGER;
  session_duration INTEGER;
  
  -- Token balance tracking
  current_balance INTEGER := 0;
  new_balance INTEGER := 0;
  
  -- Result tracking
  result JSON;
  success BOOLEAN := true;
  error_message TEXT := NULL;
  
BEGIN
  -- Start transaction logging
  RAISE LOG 'complete_session_unified: Starting session completion for session_id=%', session_id_param;
  RAISE LOG 'complete_session_unified: Parameters - winner_id=%, winning_team=%, completion_data=%', 
    winner_id_param, winning_team_param, completion_data;

  -- Get session details
  SELECT * INTO session_record 
  FROM sessions 
  WHERE id = session_id_param;
  
  IF NOT FOUND THEN
    RAISE LOG 'complete_session_unified: Session not found - %', session_id_param;
    RETURN json_build_object(
      'success', false,
      'error', 'Session not found',
      'session_id', session_id_param
    );
  END IF;
  
  RAISE LOG 'complete_session_unified: Found session - type=%, status=%', 
    session_record.session_type, session_record.status;

  -- Check if already completed
  IF session_record.status = 'completed' THEN
    RAISE LOG 'complete_session_unified: Session already completed';
    RETURN json_build_object(
      'success', false,
      'error', 'Session already completed',
      'session_id', session_id_param
    );
  END IF;

  -- Get participants with stakes
  SELECT array_agg(sp.*) INTO participant_records
  FROM session_participants sp
  WHERE sp.session_id = session_id_param 
    AND sp.status = 'joined';
  
  participant_count := COALESCE(array_length(participant_records, 1), 0);
  
  RAISE LOG 'complete_session_unified: Found % participants', participant_count;
  
  IF participant_count = 0 THEN
    RAISE LOG 'complete_session_unified: No participants found';
    RETURN json_build_object(
      'success', false,
      'error', 'No participants found for session',
      'session_id', session_id_param
    );
  END IF;

  -- Calculate total stakes
  FOR i IN 1..participant_count LOOP
    total_stakes := total_stakes + COALESCE(participant_records[i].stakes_contributed, 0);
  END LOOP;
  
  RAISE LOG 'complete_session_unified: Total stakes calculated - %', total_stakes;

  -- Calculate platform fee and net payout
  platform_fee := FLOOR(total_stakes * COALESCE((completion_data->>'platform_fee_rate')::numeric, 0.1));
  net_payout := total_stakes - platform_fee;
  
  RAISE LOG 'complete_session_unified: Rewards calculated - platform_fee=%, net_payout=%', 
    platform_fee, net_payout;

  -- Calculate session duration and XP/HP
  session_duration := COALESCE((completion_data->>'session_duration_minutes')::integer, 60);
  calculated_xp := base_xp + (session_duration / 30) * 10; -- Bonus XP for longer sessions
  calculated_hp := LEAST(hp_cost + (session_duration / 60) * 5, 25); -- Cap HP cost
  
  RAISE LOG 'complete_session_unified: Session metrics - duration=% mins, xp=%, hp=%', 
    session_duration, calculated_xp, calculated_hp;

  -- Update session status
  UPDATE sessions 
  SET 
    status = 'completed',
    completed_at = now(),
    updated_at = now()
  WHERE id = session_id_param;
  
  RAISE LOG 'complete_session_unified: Session status updated to completed';

  -- Award rewards to winner (if specified)
  IF winner_id_param IS NOT NULL AND net_payout > 0 THEN
    RAISE LOG 'complete_session_unified: Awarding % tokens to winner %', net_payout, winner_id_param;
    
    -- Get current token balance
    SELECT COALESCE(regular_tokens, 0) INTO current_balance 
    FROM token_balances 
    WHERE player_id = winner_id_param;
    
    -- Calculate new balance
    new_balance := COALESCE(current_balance, 0) + net_payout;
    
    -- Update token balance
    INSERT INTO token_balances (player_id, regular_tokens, updated_at)
    VALUES (winner_id_param, net_payout, now())
    ON CONFLICT (player_id) 
    DO UPDATE SET 
      regular_tokens = token_balances.regular_tokens + net_payout,
      updated_at = now();
    
    -- Add tokens to winner with proper balance tracking
    INSERT INTO token_transactions (
      player_id, 
      transaction_type, 
      token_type, 
      amount, 
      source, 
      description,
      balance_before,
      balance_after,
      metadata
    ) VALUES (
      winner_id_param, 
      'earn', 
      'regular', 
      net_payout, 
      'session_completion', 
      'Session completion reward',
      COALESCE(current_balance, 0),
      new_balance,
      json_build_object(
        'session_id', session_id_param,
        'session_type', session_record.session_type,
        'total_stakes', total_stakes,
        'platform_fee', platform_fee
      )
    );
  END IF;

  -- Process each participant for XP and activity logging
  FOR i IN 1..participant_count LOOP
    participant_record := participant_records[i];
    
    RAISE LOG 'complete_session_unified: Processing participant % - user_id=%', 
      i, participant_record.user_id;
    
    -- Award XP to participant using valid activity type based on session type
    INSERT INTO xp_activities (
      player_id, 
      activity_type, 
      xp_earned, 
      description, 
      level_before, 
      level_after
    ) VALUES (
      participant_record.user_id,
      CASE session_record.session_type
        WHEN 'match' THEN 'match'
        WHEN 'training' THEN 'training'
        WHEN 'lesson' THEN 'lesson'
        WHEN 'social_play' THEN 'social'
        ELSE 'social' -- fallback
      END,
      calculated_xp,
      'Session participation reward',
      1, -- Will be updated by XP system
      1  -- Will be updated by XP system
    );
    
    -- Log activity using session type for activity_type
    INSERT INTO activity_logs (
      player_id,
      activity_category,
      activity_type,
      title,
      description,
      duration_minutes,
      xp_earned,
      hp_impact,
      logged_at,
      metadata
    ) VALUES (
      participant_record.user_id,
      'session',
      session_record.session_type,
      'Session Completed: ' || session_record.session_type,
      COALESCE(completion_data->>'notes', 'Session completed successfully'),
      session_duration,
      calculated_xp,
      -calculated_hp,
      now(),
      json_build_object(
        'session_id', session_id_param,
        'stakes_contributed', participant_record.stakes_contributed,
        'is_winner', participant_record.user_id = winner_id_param
      )
    );
  END LOOP;

  -- Prepare successful result
  result := json_build_object(
    'success', true,
    'session_id', session_id_param,
    'total_stakes', total_stakes,
    'platform_fee', platform_fee,
    'net_payout', net_payout,
    'winner_id', winner_id_param,
    'winning_team', winning_team_param,
    'participant_count', participant_count,
    'xp_awarded', calculated_xp,
    'hp_cost', calculated_hp,
    'completed_at', now()
  );
  
  RAISE LOG 'complete_session_unified: Session completion successful - %', result;
  
  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    error_message := SQLERRM;
    RAISE LOG 'complete_session_unified: Error occurred - %', error_message;
    
    -- Rollback any changes and return error
    RETURN json_build_object(
      'success', false,
      'error', error_message,
      'session_id', session_id_param,
      'rollback', true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;