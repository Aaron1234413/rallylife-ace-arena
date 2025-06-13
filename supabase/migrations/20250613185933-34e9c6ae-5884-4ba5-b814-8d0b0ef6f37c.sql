
-- Create coach_tokens table for tracking coach token balances
CREATE TABLE public.coach_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  current_tokens INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coach_token_transactions table for tracking token activities
CREATE TABLE public.coach_token_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES auth.users NOT NULL,
  transaction_type TEXT NOT NULL, -- 'earn' or 'spend'
  amount INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'successful_coaching', 'premium_content', 'platform_engagement', etc.
  description TEXT,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_token_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coach_tokens
CREATE POLICY "Coaches can view their own token balance"
  ON public.coach_tokens FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own token balance"
  ON public.coach_tokens FOR UPDATE
  USING (auth.uid() = coach_id);

CREATE POLICY "System can insert coach token records"
  ON public.coach_tokens FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

-- RLS Policies for coach_token_transactions
CREATE POLICY "Coaches can view their own token transactions"
  ON public.coach_token_transactions FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "System can insert coach token transactions"
  ON public.coach_token_transactions FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

-- Function to initialize coach tokens
CREATE OR REPLACE FUNCTION public.initialize_coach_tokens(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.coach_tokens (coach_id, current_tokens, lifetime_earned)
  VALUES (user_id, 50, 0) -- Start with 50 tokens
  ON CONFLICT (coach_id) DO NOTHING;
END;
$$;

-- Function to add coach tokens
CREATE OR REPLACE FUNCTION public.add_coach_tokens(
  user_id UUID,
  amount INTEGER,
  source TEXT DEFAULT 'manual',
  description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_record RECORD;
  new_balance INTEGER;
  new_lifetime INTEGER;
  result JSON;
BEGIN
  -- Get current balance
  SELECT * INTO token_record
  FROM public.coach_tokens
  WHERE coach_id = user_id;
  
  -- If no record exists, initialize it
  IF token_record IS NULL THEN
    PERFORM public.initialize_coach_tokens(user_id);
    SELECT * INTO token_record
    FROM public.coach_tokens
    WHERE coach_id = user_id;
  END IF;
  
  -- Calculate new balances
  new_balance := token_record.current_tokens + amount;
  new_lifetime := token_record.lifetime_earned + amount;
  
  -- Update balance
  UPDATE public.coach_tokens
  SET current_tokens = new_balance,
      lifetime_earned = new_lifetime,
      updated_at = now()
  WHERE coach_id = user_id;
  
  -- Log the transaction
  INSERT INTO public.coach_token_transactions (
    coach_id, transaction_type, amount, source, description,
    balance_before, balance_after
  )
  VALUES (
    user_id, 'earn', amount, source, description,
    token_record.current_tokens, new_balance
  );
  
  -- Return result
  result := json_build_object(
    'tokens_added', amount,
    'new_balance', new_balance,
    'lifetime_earned', new_lifetime
  );
  
  RETURN result;
END;
$$;

-- Function to spend coach tokens
CREATE OR REPLACE FUNCTION public.spend_coach_tokens(
  user_id UUID,
  amount INTEGER,
  source TEXT DEFAULT 'purchase',
  description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_record RECORD;
  new_balance INTEGER;
  result JSON;
BEGIN
  -- Get current balance
  SELECT * INTO token_record
  FROM public.coach_tokens
  WHERE coach_id = user_id;
  
  -- Check if coach has enough tokens
  IF token_record.current_tokens < amount THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient tokens',
      'current_balance', token_record.current_tokens,
      'required', amount
    );
  END IF;
  
  -- Calculate new balance
  new_balance := token_record.current_tokens - amount;
  
  -- Update balance
  UPDATE public.coach_tokens
  SET current_tokens = new_balance,
      updated_at = now()
  WHERE coach_id = user_id;
  
  -- Log the transaction
  INSERT INTO public.coach_token_transactions (
    coach_id, transaction_type, amount, source, description,
    balance_before, balance_after
  )
  VALUES (
    user_id, 'spend', amount, source, description,
    token_record.current_tokens, new_balance
  );
  
  -- Return result
  result := json_build_object(
    'success', true,
    'tokens_spent', amount,
    'new_balance', new_balance
  );
  
  RETURN result;
END;
$$;

-- Update the handle_new_user function to initialize coach tokens for new coaches
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'player'::public.user_role)
  );
  
  -- Initialize HP, XP, Tokens, and Avatar for players
  IF COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'player'::public.user_role) = 'player' THEN
    PERFORM public.initialize_player_hp(NEW.id);
    PERFORM public.initialize_player_xp(NEW.id);
    PERFORM public.initialize_player_tokens(NEW.id);
    PERFORM public.initialize_player_avatar(NEW.id);
  END IF;
  
  -- Initialize CRP, CXP, and CTK for coaches
  IF COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'player'::public.user_role) = 'coach' THEN
    PERFORM public.initialize_coach_crp(NEW.id);
    PERFORM public.initialize_coach_cxp(NEW.id);
    PERFORM public.initialize_coach_tokens(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;
