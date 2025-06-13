
-- Create token_balances table to track user token balances
CREATE TABLE public.token_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
  regular_tokens INTEGER NOT NULL DEFAULT 0,
  premium_tokens INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on player_id to ensure one balance record per player
CREATE UNIQUE INDEX idx_token_balances_player_id ON public.token_balances(player_id);

-- Create token_transactions table to track all token activities
CREATE TABLE public.token_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
  transaction_type TEXT NOT NULL, -- 'earn', 'spend', 'purchase', 'convert'
  token_type TEXT NOT NULL, -- 'regular', 'premium'
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'daily_login', 'achievement', 'tournament', 'health_pack', 'avatar_item', etc.
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_token_transactions_player_id ON public.token_transactions(player_id);
CREATE INDEX idx_token_transactions_created_at ON public.token_transactions(created_at DESC);
CREATE INDEX idx_token_transactions_type ON public.token_transactions(transaction_type);

-- Enable Row Level Security
ALTER TABLE public.token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for token_balances
CREATE POLICY "Users can view their own token balance" 
  ON public.token_balances 
  FOR SELECT 
  USING (auth.uid() = player_id);

CREATE POLICY "Users can update their own token balance" 
  ON public.token_balances 
  FOR UPDATE 
  USING (auth.uid() = player_id);

CREATE POLICY "System can insert token balances" 
  ON public.token_balances 
  FOR INSERT 
  WITH CHECK (true);

-- Create RLS policies for token_transactions
CREATE POLICY "Users can view their own token transactions" 
  ON public.token_transactions 
  FOR SELECT 
  USING (auth.uid() = player_id);

CREATE POLICY "System can insert token transactions" 
  ON public.token_transactions 
  FOR INSERT 
  WITH CHECK (true);

-- Initialize token balance function
CREATE OR REPLACE FUNCTION public.initialize_player_tokens(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.token_balances (player_id, regular_tokens, premium_tokens, lifetime_earned)
  VALUES (user_id, 100, 0, 0) -- Start with 100 regular tokens
  ON CONFLICT (player_id) DO NOTHING;
END;
$$;

-- Add tokens function
CREATE OR REPLACE FUNCTION public.add_tokens(
  user_id uuid,
  amount integer,
  token_type text DEFAULT 'regular',
  source text DEFAULT 'manual',
  description text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  balance_record RECORD;
  new_balance INTEGER;
  new_lifetime INTEGER;
  result JSON;
BEGIN
  -- Get current balance
  SELECT * INTO balance_record
  FROM public.token_balances
  WHERE player_id = user_id;
  
  -- If no record exists, initialize it
  IF balance_record IS NULL THEN
    PERFORM public.initialize_player_tokens(user_id);
    SELECT * INTO balance_record
    FROM public.token_balances
    WHERE player_id = user_id;
  END IF;
  
  -- Calculate new balances
  IF token_type = 'premium' THEN
    new_balance := balance_record.premium_tokens + amount;
    new_lifetime := balance_record.lifetime_earned;
    
    -- Update premium tokens
    UPDATE public.token_balances
    SET premium_tokens = new_balance,
        updated_at = now()
    WHERE player_id = user_id;
    
    -- Log the transaction
    INSERT INTO public.token_transactions (
      player_id, transaction_type, token_type, amount, 
      balance_before, balance_after, source, description
    )
    VALUES (
      user_id, 'earn', 'premium', amount,
      balance_record.premium_tokens, new_balance, source, description
    );
    
  ELSE
    new_balance := balance_record.regular_tokens + amount;
    new_lifetime := balance_record.lifetime_earned + amount;
    
    -- Update regular tokens and lifetime earned
    UPDATE public.token_balances
    SET regular_tokens = new_balance,
        lifetime_earned = new_lifetime,
        updated_at = now()
    WHERE player_id = user_id;
    
    -- Log the transaction
    INSERT INTO public.token_transactions (
      player_id, transaction_type, token_type, amount,
      balance_before, balance_after, source, description
    )
    VALUES (
      user_id, 'earn', 'regular', amount,
      balance_record.regular_tokens, new_balance, source, description
    );
  END IF;
  
  -- Return result
  result := json_build_object(
    'tokens_added', amount,
    'token_type', token_type,
    'new_balance', new_balance,
    'lifetime_earned', new_lifetime
  );
  
  RETURN result;
END;
$$;

-- Spend tokens function
CREATE OR REPLACE FUNCTION public.spend_tokens(
  user_id uuid,
  amount integer,
  token_type text DEFAULT 'regular',
  source text DEFAULT 'purchase',
  description text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  balance_record RECORD;
  current_balance INTEGER;
  new_balance INTEGER;
  result JSON;
BEGIN
  -- Get current balance
  SELECT * INTO balance_record
  FROM public.token_balances
  WHERE player_id = user_id;
  
  -- Check if user has enough tokens
  IF token_type = 'premium' THEN
    current_balance := balance_record.premium_tokens;
  ELSE
    current_balance := balance_record.regular_tokens;
  END IF;
  
  IF current_balance < amount THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient tokens',
      'current_balance', current_balance,
      'required', amount
    );
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance - amount;
  
  -- Update balance
  IF token_type = 'premium' THEN
    UPDATE public.token_balances
    SET premium_tokens = new_balance,
        updated_at = now()
    WHERE player_id = user_id;
  ELSE
    UPDATE public.token_balances
    SET regular_tokens = new_balance,
        updated_at = now()
    WHERE player_id = user_id;
  END IF;
  
  -- Log the transaction
  INSERT INTO public.token_transactions (
    player_id, transaction_type, token_type, amount,
    balance_before, balance_after, source, description
  )
  VALUES (
    user_id, 'spend', token_type, amount,
    current_balance, new_balance, source, description
  );
  
  -- Return result
  result := json_build_object(
    'success', true,
    'tokens_spent', amount,
    'token_type', token_type,
    'new_balance', new_balance
  );
  
  RETURN result;
END;
$$;

-- Convert premium to regular tokens function
CREATE OR REPLACE FUNCTION public.convert_premium_tokens(
  user_id uuid,
  premium_amount integer,
  conversion_rate integer DEFAULT 10 -- 1 premium = 10 regular tokens
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  balance_record RECORD;
  regular_tokens_to_add INTEGER;
  result JSON;
BEGIN
  -- Get current balance
  SELECT * INTO balance_record
  FROM public.token_balances
  WHERE player_id = user_id;
  
  -- Check if user has enough premium tokens
  IF balance_record.premium_tokens < premium_amount THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient premium tokens',
      'current_premium_balance', balance_record.premium_tokens,
      'required', premium_amount
    );
  END IF;
  
  -- Calculate conversion
  regular_tokens_to_add := premium_amount * conversion_rate;
  
  -- Update balances
  UPDATE public.token_balances
  SET premium_tokens = premium_tokens - premium_amount,
      regular_tokens = regular_tokens + regular_tokens_to_add,
      lifetime_earned = lifetime_earned + regular_tokens_to_add,
      updated_at = now()
  WHERE player_id = user_id;
  
  -- Log the premium token spending
  INSERT INTO public.token_transactions (
    player_id, transaction_type, token_type, amount,
    balance_before, balance_after, source, description
  )
  VALUES (
    user_id, 'convert', 'premium', premium_amount,
    balance_record.premium_tokens, balance_record.premium_tokens - premium_amount,
    'conversion', 'Converted to regular tokens'
  );
  
  -- Log the regular token earning
  INSERT INTO public.token_transactions (
    player_id, transaction_type, token_type, amount,
    balance_before, balance_after, source, description
  )
  VALUES (
    user_id, 'convert', 'regular', regular_tokens_to_add,
    balance_record.regular_tokens, balance_record.regular_tokens + regular_tokens_to_add,
    'conversion', 'Converted from premium tokens'
  );
  
  -- Return result
  result := json_build_object(
    'success', true,
    'premium_spent', premium_amount,
    'regular_earned', regular_tokens_to_add,
    'conversion_rate', conversion_rate
  );
  
  RETURN result;
END;
$$;

-- Update the handle_new_user function to include token initialization
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
  
  -- Initialize HP, XP, and Tokens for players
  IF COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'player'::public.user_role) = 'player' THEN
    PERFORM public.initialize_player_hp(NEW.id);
    PERFORM public.initialize_player_xp(NEW.id);
    PERFORM public.initialize_player_tokens(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;
