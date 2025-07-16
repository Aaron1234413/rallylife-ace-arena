-- Create the missing award_tokens function
CREATE OR REPLACE FUNCTION public.award_tokens(
  target_user_id UUID,
  token_amount INTEGER,
  transaction_type TEXT,
  match_id UUID DEFAULT NULL,
  description_text TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_tokens INTEGER;
  new_total INTEGER;
  transaction_id UUID;
  result JSON;
BEGIN
  -- Get current token balance
  SELECT tokens INTO current_tokens
  FROM public.profiles
  WHERE id = target_user_id;
  
  IF current_tokens IS NULL THEN
    current_tokens := 0;
  END IF;
  
  -- Calculate new total
  new_total := current_tokens + token_amount;
  
  -- Update profile with new token balance and lifetime earned
  UPDATE public.profiles
  SET tokens = new_total,
      lifetime_tokens_earned = COALESCE(lifetime_tokens_earned, 0) + token_amount
  WHERE id = target_user_id;
  
  -- Record transaction
  INSERT INTO public.token_transactions (
    user_id, amount, type, source_match_id, description
  )
  VALUES (
    target_user_id, token_amount, transaction_type, match_id, description_text
  )
  RETURNING id INTO transaction_id;
  
  -- Return result
  result := json_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'previous_balance', current_tokens,
    'new_balance', new_total,
    'tokens_awarded', token_amount
  );
  
  RETURN result;
END;
$$;

-- Create a function to handle daily login and award streak tokens
CREATE OR REPLACE FUNCTION public.handle_daily_login(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  streak_result JSON;
BEGIN
  -- Call the existing update_daily_streak function which already awards tokens
  SELECT public.update_daily_streak(user_id) INTO streak_result;
  
  RETURN streak_result;
END;
$$;