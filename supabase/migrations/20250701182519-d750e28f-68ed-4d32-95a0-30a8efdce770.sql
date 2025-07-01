-- Phase 1: Coach Functions (Part 3)

-- Coach CRP functions
CREATE OR REPLACE FUNCTION public.add_crp(
  coach_id UUID,
  amount INTEGER,
  activity_type TEXT,
  description TEXT DEFAULT NULL,
  source_player_id UUID DEFAULT NULL,
  metadata JSONB DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  crp_record RECORD;
  new_crp INTEGER;
  new_level TEXT;
  result JSON;
BEGIN
  -- Get current CRP
  SELECT * INTO crp_record
  FROM public.coach_crp
  WHERE coach_crp.coach_id = add_crp.coach_id;
  
  -- If no record exists, initialize it
  IF crp_record IS NULL THEN
    INSERT INTO public.coach_crp (coach_id)
    VALUES (add_crp.coach_id);
    
    SELECT * INTO crp_record
    FROM public.coach_crp
    WHERE coach_crp.coach_id = add_crp.coach_id;
  END IF;
  
  -- Calculate new CRP
  new_crp := crp_record.current_crp + amount;
  
  -- Determine reputation level
  new_level := CASE
    WHEN new_crp >= 1000 THEN 'platinum'
    WHEN new_crp >= 500 THEN 'gold'
    WHEN new_crp >= 250 THEN 'silver'
    ELSE 'bronze'
  END;
  
  -- Update CRP
  UPDATE public.coach_crp
  SET 
    current_crp = new_crp,
    total_crp_earned = total_crp_earned + amount,
    reputation_level = new_level,
    updated_at = now()
  WHERE coach_crp.coach_id = add_crp.coach_id;
  
  -- Log the activity
  INSERT INTO public.crp_activities (
    coach_id, activity_type, crp_change, crp_before, crp_after, 
    description, source_player_id, metadata
  )
  VALUES (
    add_crp.coach_id, activity_type, amount, crp_record.current_crp, new_crp,
    description, source_player_id, metadata
  );
  
  result := json_build_object(
    'crp_added', amount,
    'new_crp', new_crp,
    'new_level', new_level
  );
  
  RETURN result;
END;
$$;

-- Coach CXP functions
CREATE OR REPLACE FUNCTION public.add_cxp(
  coach_id UUID,
  amount INTEGER,
  activity_type TEXT,
  description TEXT DEFAULT NULL,
  source_player_id UUID DEFAULT NULL,
  metadata JSONB DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cxp_record RECORD;
  new_total_cxp INTEGER;
  new_level INTEGER;
  new_tier TEXT;
  level_up BOOLEAN := false;
  result JSON;
BEGIN
  -- Get current CXP
  SELECT * INTO cxp_record
  FROM public.coach_cxp
  WHERE coach_cxp.coach_id = add_cxp.coach_id;
  
  -- If no record exists, initialize it
  IF cxp_record IS NULL THEN
    INSERT INTO public.coach_cxp (coach_id)
    VALUES (add_cxp.coach_id);
    
    SELECT * INTO cxp_record
    FROM public.coach_cxp
    WHERE coach_cxp.coach_id = add_cxp.coach_id;
  END IF;
  
  -- Calculate new totals
  new_total_cxp := cxp_record.total_cxp_earned + amount;
  new_level := FLOOR(new_total_cxp / 100) + 1;
  
  IF new_level > cxp_record.current_level THEN
    level_up := true;
  END IF;
  
  -- Determine coaching tier
  new_tier := CASE
    WHEN new_level >= 20 THEN 'master'
    WHEN new_level >= 15 THEN 'expert'
    WHEN new_level >= 10 THEN 'professional'
    WHEN new_level >= 5 THEN 'intermediate'
    ELSE 'novice'
  END;
  
  -- Update CXP
  UPDATE public.coach_cxp
  SET 
    current_cxp = (new_total_cxp % 100),
    total_cxp_earned = new_total_cxp,
    current_level = new_level,
    cxp_to_next_level = 100 - (new_total_cxp % 100),
    coaching_tier = new_tier,
    commission_rate = LEAST(0.30, 0.15 + (new_level - 1) * 0.01),
    updated_at = now()
  WHERE coach_cxp.coach_id = add_cxp.coach_id;
  
  -- Log the activity
  INSERT INTO public.cxp_activities (
    coach_id, activity_type, cxp_earned, description, source_player_id, metadata
  )
  VALUES (
    add_cxp.coach_id, activity_type, amount, description, source_player_id, metadata
  );
  
  result := json_build_object(
    'cxp_earned', amount,
    'new_total_cxp', new_total_cxp,
    'new_level', new_level,
    'level_up', level_up,
    'new_tier', new_tier
  );
  
  RETURN result;
END;
$$;

-- Coach token functions
CREATE OR REPLACE FUNCTION public.initialize_coach_tokens(coach_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.coach_tokens (coach_id, current_tokens, lifetime_earned)
  VALUES (coach_id, 50, 0) -- Start coaches with 50 tokens
  ON CONFLICT (coach_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_coach_tokens(
  coach_id UUID,
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
  WHERE coach_tokens.coach_id = add_coach_tokens.coach_id;
  
  -- If no record exists, initialize it
  IF token_record IS NULL THEN
    PERFORM public.initialize_coach_tokens(add_coach_tokens.coach_id);
    SELECT * INTO token_record
    FROM public.coach_tokens
    WHERE coach_tokens.coach_id = add_coach_tokens.coach_id;
  END IF;
  
  -- Calculate new balances
  new_balance := token_record.current_tokens + amount;
  new_lifetime := token_record.lifetime_earned + amount;
  
  -- Update tokens
  UPDATE public.coach_tokens
  SET 
    current_tokens = new_balance,
    lifetime_earned = new_lifetime,
    updated_at = now()
  WHERE coach_tokens.coach_id = add_coach_tokens.coach_id;
  
  -- Log transaction
  INSERT INTO public.coach_token_transactions (
    coach_id, transaction_type, amount, balance_before, balance_after, source, description
  )
  VALUES (
    add_coach_tokens.coach_id, 'earn', amount, token_record.current_tokens, new_balance, source, description
  );
  
  result := json_build_object(
    'tokens_added', amount,
    'new_balance', new_balance,
    'lifetime_earned', new_lifetime
  );
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.spend_coach_tokens(
  coach_id UUID,
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
  WHERE coach_tokens.coach_id = spend_coach_tokens.coach_id;
  
  -- Check if user has enough tokens
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
  SET 
    current_tokens = new_balance,
    updated_at = now()
  WHERE coach_tokens.coach_id = spend_coach_tokens.coach_id;
  
  -- Log transaction
  INSERT INTO public.coach_token_transactions (
    coach_id, transaction_type, amount, balance_before, balance_after, source, description
  )
  VALUES (
    spend_coach_tokens.coach_id, 'spend', amount, token_record.current_tokens, new_balance, source, description
  );
  
  result := json_build_object(
    'success', true,
    'tokens_spent', amount,
    'new_balance', new_balance
  );
  
  RETURN result;
END;
$$;