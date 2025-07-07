-- Phase 6: Edge Functions Support - Database Functions

-- Token redemption processing function
CREATE OR REPLACE FUNCTION public.process_token_redemption(
  club_id_param UUID,
  player_id_param UUID,
  service_type_param TEXT,
  service_details_param JSONB,
  tokens_to_use INTEGER,
  cash_amount_param NUMERIC,
  total_service_value_param NUMERIC
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month TEXT;
  pool_record RECORD;
  available_tokens INTEGER;
  redemption_percentage NUMERIC := 100.0; -- Default 100% redemption
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  -- Get current token pool
  SELECT * INTO pool_record
  FROM public.club_token_pools
  WHERE club_id = club_id_param 
    AND month_year = current_month;
    
  IF pool_record IS NULL THEN
    -- Initialize pool if it doesn't exist
    PERFORM public.initialize_monthly_token_pool(club_id_param, current_month);
    
    SELECT * INTO pool_record
    FROM public.club_token_pools
    WHERE club_id = club_id_param 
      AND month_year = current_month;
  END IF;
  
  -- Calculate available tokens (including overdraft for Pro clubs)
  available_tokens := pool_record.allocated_tokens + 
                     pool_record.rollover_tokens + 
                     pool_record.purchased_tokens - 
                     pool_record.used_tokens;
  
  -- Check if enough tokens available
  IF available_tokens < tokens_to_use THEN
    -- Check if club allows overdraft (Pro tier)
    DECLARE
      club_tier TEXT;
    BEGIN
      SELECT subscription_tier INTO club_tier
      FROM public.clubs
      WHERE id = club_id_param;
      
      IF club_tier = 'pro' THEN
        -- Allow overdraft up to monthly allocation
        IF (pool_record.overdraft_tokens + tokens_to_use - available_tokens) > pool_record.allocated_tokens THEN
          RETURN FALSE; -- Overdraft limit exceeded
        END IF;
      ELSE
        RETURN FALSE; -- No overdraft allowed
      END IF;
    END;
  END IF;
  
  -- Get service redemption settings
  SELECT redemption_percentage INTO redemption_percentage
  FROM public.service_redemption_settings
  WHERE club_id = club_id_param 
    AND service_type = service_type_param
    AND enabled = true;
    
  IF redemption_percentage IS NULL THEN
    redemption_percentage := 100.0; -- Default to 100%
  END IF;
  
  -- Calculate actual tokens needed based on redemption percentage
  tokens_to_use := CEIL(tokens_to_use * redemption_percentage / 100.0);
  
  -- Update token pool
  UPDATE public.club_token_pools
  SET used_tokens = used_tokens + tokens_to_use,
      overdraft_tokens = CASE 
        WHEN (allocated_tokens + rollover_tokens + purchased_tokens - used_tokens - tokens_to_use) < 0 
        THEN overdraft_tokens + ABS(allocated_tokens + rollover_tokens + purchased_tokens - used_tokens - tokens_to_use)
        ELSE overdraft_tokens
      END,
      updated_at = now()
  WHERE club_id = club_id_param 
    AND month_year = current_month;
  
  -- Record the redemption
  INSERT INTO public.token_redemptions (
    club_id, player_id, service_type, service_details,
    tokens_used, cash_amount, total_service_value, redemption_percentage
  ) VALUES (
    club_id_param, player_id_param, service_type_param, service_details_param,
    tokens_to_use, cash_amount_param, total_service_value_param, redemption_percentage
  );
  
  RETURN TRUE;
END;
$$;

-- Check token availability function
CREATE OR REPLACE FUNCTION public.check_token_availability(
  club_id_param UUID,
  requested_tokens INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month TEXT;
  pool_record RECORD;
  available_tokens INTEGER;
  club_tier TEXT;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  -- Get current token pool
  SELECT * INTO pool_record
  FROM public.club_token_pools
  WHERE club_id = club_id_param 
    AND month_year = current_month;
    
  IF pool_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate available tokens
  available_tokens := pool_record.allocated_tokens + 
                     pool_record.rollover_tokens + 
                     pool_record.purchased_tokens - 
                     pool_record.used_tokens;
  
  -- Check if enough tokens available
  IF available_tokens >= requested_tokens THEN
    RETURN TRUE;
  END IF;
  
  -- Check overdraft capability for Pro clubs
  SELECT subscription_tier INTO club_tier
  FROM public.clubs
  WHERE id = club_id_param;
  
  IF club_tier = 'pro' THEN
    -- Allow overdraft up to monthly allocation
    IF (pool_record.overdraft_tokens + requested_tokens - available_tokens) <= pool_record.allocated_tokens THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Add coach tokens function
CREATE OR REPLACE FUNCTION public.add_coach_tokens(
  coach_id UUID,
  token_amount INTEGER,
  token_type TEXT,
  transaction_type TEXT,
  description TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update or insert coach token balance
  INSERT INTO public.coach_tokens (coach_id, coaching_tokens, updated_at)
  VALUES (coach_id, token_amount, now())
  ON CONFLICT (coach_id) 
  DO UPDATE SET 
    coaching_tokens = coach_tokens.coaching_tokens + token_amount,
    updated_at = now();
    
  -- Log the transaction
  INSERT INTO public.coach_token_transactions (
    coach_id, transaction_type, token_type, amount, source, description
  ) VALUES (
    coach_id, transaction_type, token_type, token_amount, 'system', description
  );
END;
$$;

-- Create missing tables for token management
CREATE TABLE IF NOT EXISTS public.token_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL,
  player_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  service_details JSONB,
  tokens_used INTEGER NOT NULL,
  cash_amount NUMERIC DEFAULT 0,
  total_service_value NUMERIC NOT NULL,
  redemption_percentage NUMERIC DEFAULT 100.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_redemption_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  redemption_percentage NUMERIC NOT NULL DEFAULT 100.0,
  max_tokens_per_transaction INTEGER,
  daily_limit INTEGER,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(club_id, service_type)
);

CREATE TABLE IF NOT EXISTS public.coach_token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  transaction_type TEXT NOT NULL,
  token_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  source TEXT DEFAULT 'system',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.token_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_redemption_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_token_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for token_redemptions
CREATE POLICY "Club members can view redemptions" ON public.token_redemptions
FOR SELECT USING (
  club_id IN (
    SELECT club_id FROM public.club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "System can manage redemptions" ON public.token_redemptions
FOR ALL USING (true);

-- RLS policies for service_redemption_settings
CREATE POLICY "Club admins can manage service settings" ON public.service_redemption_settings
FOR ALL USING (
  club_id IN (
    SELECT club_id FROM public.club_memberships 
    WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND role IN ('owner', 'admin')
  )
);

-- RLS policies for coach_token_transactions
CREATE POLICY "Coaches can view their transactions" ON public.coach_token_transactions
FOR SELECT USING (coach_id = auth.uid());

CREATE POLICY "System can manage coach transactions" ON public.coach_token_transactions
FOR INSERT WITH CHECK (true);