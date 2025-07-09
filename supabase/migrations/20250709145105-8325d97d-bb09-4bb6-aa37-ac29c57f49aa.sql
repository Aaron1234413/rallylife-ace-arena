-- Fix the join_session function to use correct token_balances column names
CREATE OR REPLACE FUNCTION public.join_session(
  session_id_param uuid,
  user_id_param uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  current_balance INTEGER;
  new_balance INTEGER;
  result JSON;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF session_record IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Session not found'
    );
  END IF;
  
  -- Check if user is already a participant
  IF EXISTS (
    SELECT 1 FROM public.session_participants 
    WHERE session_id = session_id_param AND user_id = user_id_param
  ) THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Already joined this session'
    );
  END IF;
  
  -- Check if session is full
  IF session_record.max_players > 0 THEN
    DECLARE
      current_participants INTEGER;
    BEGIN
      SELECT COUNT(*) INTO current_participants
      FROM public.session_participants
      WHERE session_id = session_id_param;
      
      IF current_participants >= session_record.max_players THEN
        RETURN json_build_object(
          'success', false, 
          'error', 'Session is full'
        );
      END IF;
    END;
  END IF;
  
  -- Get current token balance using correct column names
  SELECT COALESCE(
    (SELECT 
      regular_tokens + COALESCE(monthly_subscription_tokens, 0) + COALESCE(personal_tokens, 0)
     FROM public.token_balances 
     WHERE player_id = user_id_param), 
    0
  ) INTO current_balance;
  
  -- Check if user has enough tokens
  IF current_balance < session_record.stakes_amount THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Insufficient tokens'
    );
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance - session_record.stakes_amount;
  
  -- Start transaction
  BEGIN
    -- Add user to session participants
    INSERT INTO public.session_participants (
      session_id, user_id, role, joined_at, payment_status, 
      attendance_status, tokens_paid, money_paid
    )
    VALUES (
      session_id_param, user_id_param, 'participant', now(), 'paid', 
      'registered', session_record.stakes_amount, 0
    );
    
    -- Update token balance if stakes > 0
    IF session_record.stakes_amount > 0 THEN
      -- Deduct tokens from regular_tokens first, then monthly_subscription_tokens, then personal_tokens
      INSERT INTO public.token_balances (
        player_id, regular_tokens, monthly_subscription_tokens, personal_tokens, updated_at
      )
      VALUES (
        user_id_param, 
        GREATEST(0, new_balance), 0, 0, now()
      )
      ON CONFLICT (player_id) 
      DO UPDATE SET 
        regular_tokens = CASE 
          WHEN token_balances.regular_tokens >= session_record.stakes_amount 
          THEN token_balances.regular_tokens - session_record.stakes_amount
          ELSE GREATEST(0, token_balances.regular_tokens + COALESCE(token_balances.monthly_subscription_tokens, 0) + COALESCE(token_balances.personal_tokens, 0) - session_record.stakes_amount)
        END,
        monthly_subscription_tokens = CASE
          WHEN token_balances.regular_tokens >= session_record.stakes_amount 
          THEN token_balances.monthly_subscription_tokens
          ELSE 0
        END,
        personal_tokens = CASE
          WHEN token_balances.regular_tokens >= session_record.stakes_amount 
          THEN token_balances.personal_tokens
          WHEN token_balances.regular_tokens + COALESCE(token_balances.monthly_subscription_tokens, 0) >= session_record.stakes_amount
          THEN token_balances.personal_tokens
          ELSE 0
        END,
        updated_at = now();
      
      -- Log the token transaction with proper balance tracking
      INSERT INTO public.token_transactions (
        player_id, transaction_type, token_type, amount, source, 
        description, balance_before, balance_after
      )
      VALUES (
        user_id_param, 'spend', 'regular', session_record.stakes_amount, 
        'session_join', 'Joined session: ' || session_record.id,
        current_balance, new_balance
      );
    END IF;
    
    -- Return success
    result := json_build_object(
      'success', true,
      'message', 'Successfully joined session',
      'tokens_paid', session_record.stakes_amount,
      'new_balance', new_balance
    );
    
    RETURN result;
    
  EXCEPTION WHEN OTHERS THEN
    -- Rollback will happen automatically
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to join session: ' || SQLERRM
    );
  END;
END;
$$;