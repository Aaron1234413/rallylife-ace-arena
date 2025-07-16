-- Create token transactions table
CREATE TABLE public.token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('match_completed', 'daily_login', 'weekly_streak', 'challenge_won', 'achievement_unlocked')),
  source_match_id UUID REFERENCES public.challenges(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  description TEXT
);

-- Add token economy columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login DATE,
ADD COLUMN IF NOT EXISTS lifetime_tokens_earned INTEGER DEFAULT 0;

-- Enable RLS on token_transactions
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for token_transactions
CREATE POLICY "Users can view their own token transactions" 
ON public.token_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert token transactions" 
ON public.token_transactions 
FOR INSERT 
WITH CHECK (true);

-- Create function to award tokens
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
  
  -- Update profile with new token balance
  UPDATE public.profiles
  SET 
    tokens = new_total,
    lifetime_tokens_earned = lifetime_tokens_earned + token_amount
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

-- Create function to spend tokens
CREATE OR REPLACE FUNCTION public.spend_tokens(
  spender_user_id UUID,
  token_amount INTEGER,
  transaction_type TEXT,
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
  WHERE id = spender_user_id;
  
  IF current_tokens IS NULL OR current_tokens < token_amount THEN
    result := json_build_object(
      'success', false,
      'error', 'Insufficient tokens',
      'current_balance', COALESCE(current_tokens, 0),
      'required', token_amount
    );
    RETURN result;
  END IF;
  
  -- Calculate new total
  new_total := current_tokens - token_amount;
  
  -- Update profile with new token balance
  UPDATE public.profiles
  SET tokens = new_total
  WHERE id = spender_user_id;
  
  -- Record transaction (negative amount for spending)
  INSERT INTO public.token_transactions (
    user_id, amount, type, description
  )
  VALUES (
    spender_user_id, -token_amount, transaction_type, description_text
  )
  RETURNING id INTO transaction_id;
  
  -- Return result
  result := json_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'previous_balance', current_tokens,
    'new_balance', new_total,
    'tokens_spent', token_amount
  );
  
  RETURN result;
END;
$$;

-- Create function to update daily streak
CREATE OR REPLACE FUNCTION public.update_daily_streak(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_streak INTEGER;
  last_login_date DATE;
  today_date DATE := CURRENT_DATE;
  new_streak INTEGER;
  tokens_awarded INTEGER := 0;
  result JSON;
BEGIN
  -- Get current streak and last login
  SELECT daily_streak, last_login 
  INTO current_streak, last_login_date
  FROM public.profiles
  WHERE id = target_user_id;
  
  IF current_streak IS NULL THEN
    current_streak := 0;
  END IF;
  
  -- Check if user already logged in today
  IF last_login_date = today_date THEN
    result := json_build_object(
      'success', true,
      'already_logged_today', true,
      'current_streak', current_streak,
      'tokens_awarded', 0
    );
    RETURN result;
  END IF;
  
  -- Calculate new streak
  IF last_login_date = today_date - INTERVAL '1 day' THEN
    -- Consecutive day
    new_streak := current_streak + 1;
  ELSE
    -- Streak broken or first login
    new_streak := 1;
  END IF;
  
  -- Award tokens for login (base 10 + streak bonus)
  tokens_awarded := 10 + (new_streak - 1) * 2;
  
  -- Update profile
  UPDATE public.profiles
  SET 
    daily_streak = new_streak,
    last_login = today_date
  WHERE id = target_user_id;
  
  -- Award tokens
  PERFORM public.award_tokens(
    target_user_id,
    tokens_awarded,
    'daily_login',
    NULL,
    'Daily login streak: ' || new_streak || ' days'
  );
  
  result := json_build_object(
    'success', true,
    'previous_streak', current_streak,
    'new_streak', new_streak,
    'tokens_awarded', tokens_awarded,
    'streak_broken', current_streak > new_streak
  );
  
  RETURN result;
END;
$$;