-- Phase 1: Database Foundation & Subscription Architecture

-- Player subscriptions
CREATE TABLE player_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'premium', 'pro')),
  monthly_token_allocation INTEGER NOT NULL,
  max_clubs_allowed INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due')),
  stripe_subscription_id TEXT UNIQUE,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Coach subscriptions  
CREATE TABLE coach_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'premium', 'pro')),
  monthly_token_allocation INTEGER NOT NULL,
  max_clubs_allowed INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due')),
  stripe_subscription_id TEXT UNIQUE,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Monthly token pools for clubs
CREATE TABLE club_token_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL,
  month_year TEXT NOT NULL, -- "2024-01"
  allocated_tokens INTEGER NOT NULL,
  used_tokens INTEGER DEFAULT 0,
  overdraft_tokens INTEGER DEFAULT 0,
  purchased_tokens INTEGER DEFAULT 0,
  rollover_tokens INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(club_id, month_year)
);

-- Token redemption logs
CREATE TABLE token_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL,
  player_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  service_details JSONB,
  tokens_used INTEGER NOT NULL,
  cash_amount NUMERIC NOT NULL,
  total_service_value NUMERIC NOT NULL,
  redemption_percentage NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE player_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_token_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for player_subscriptions
CREATE POLICY "Players can view their own subscription" 
ON player_subscriptions FOR SELECT 
USING (player_id = auth.uid());

CREATE POLICY "System can manage player subscriptions" 
ON player_subscriptions FOR ALL 
USING (true);

-- RLS Policies for coach_subscriptions
CREATE POLICY "Coaches can view their own subscription" 
ON coach_subscriptions FOR SELECT 
USING (coach_id = auth.uid());

CREATE POLICY "System can manage coach subscriptions" 
ON coach_subscriptions FOR ALL 
USING (true);

-- RLS Policies for club_token_pools
CREATE POLICY "Club members can view token pools" 
ON club_token_pools FOR SELECT 
USING (club_id IN (
  SELECT club_id FROM club_memberships 
  WHERE user_id = auth.uid() AND status = 'active'
));

CREATE POLICY "System can manage token pools" 
ON club_token_pools FOR ALL 
USING (true);

-- RLS Policies for token_redemptions
CREATE POLICY "Club members can view redemptions" 
ON token_redemptions FOR SELECT 
USING (club_id IN (
  SELECT club_id FROM club_memberships 
  WHERE user_id = auth.uid() AND status = 'active'
) OR player_id = auth.uid());

CREATE POLICY "System can manage redemptions" 
ON token_redemptions FOR ALL 
USING (true);

-- Initialize monthly token pool function
CREATE OR REPLACE FUNCTION initialize_monthly_token_pool(
  club_id_param UUID,
  month_year_param TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  club_subscription RECORD;
  token_allocation INTEGER;
  rollover_amount INTEGER := 0;
  previous_month TEXT;
BEGIN
  -- Get club subscription details
  SELECT cs.*, c.subscription_tier 
  INTO club_subscription
  FROM club_subscriptions cs
  JOIN clubs c ON cs.club_id = c.id
  WHERE cs.club_id = club_id_param AND cs.status = 'active';
  
  IF NOT FOUND THEN
    -- Default to free tier
    token_allocation := 5000;
  ELSE
    -- Set allocation based on subscription tier
    CASE club_subscription.tier_id
      WHEN 'free' THEN token_allocation := 5000;
      WHEN 'core' THEN token_allocation := 50000;
      WHEN 'plus' THEN token_allocation := 150000;
      WHEN 'pro' THEN token_allocation := 300000;
      ELSE token_allocation := 5000;
    END CASE;
  END IF;
  
  -- Calculate rollover for Plus and Pro plans
  IF club_subscription.tier_id IN ('plus', 'pro') THEN
    previous_month := to_char(to_date(month_year_param, 'YYYY-MM') - interval '1 month', 'YYYY-MM');
    
    SELECT COALESCE(allocated_tokens + rollover_tokens + purchased_tokens - used_tokens, 0)
    INTO rollover_amount
    FROM club_token_pools
    WHERE club_id = club_id_param AND month_year = previous_month;
    
    -- Cap rollover at 1x monthly allocation
    rollover_amount := LEAST(rollover_amount, token_allocation);
  END IF;
  
  -- Insert or update the monthly pool
  INSERT INTO club_token_pools (
    club_id, month_year, allocated_tokens, rollover_tokens,
    expires_at
  )
  VALUES (
    club_id_param, month_year_param, token_allocation, rollover_amount,
    (to_date(month_year_param, 'YYYY-MM') + interval '1 month')::timestamptz
  )
  ON CONFLICT (club_id, month_year) 
  DO UPDATE SET
    allocated_tokens = EXCLUDED.allocated_tokens,
    rollover_tokens = EXCLUDED.rollover_tokens,
    updated_at = now();
END;
$$;

-- Check token availability function
CREATE OR REPLACE FUNCTION check_token_availability(
  club_id_param UUID,
  requested_tokens INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month TEXT := to_char(CURRENT_DATE, 'YYYY-MM');
  pool_record RECORD;
  available_tokens INTEGER;
  overdraft_limit INTEGER := 0;
  club_tier TEXT;
BEGIN
  -- Get current month's pool
  SELECT * INTO pool_record
  FROM club_token_pools
  WHERE club_id = club_id_param AND month_year = current_month;
  
  IF NOT FOUND THEN
    -- Initialize pool if it doesn't exist
    PERFORM initialize_monthly_token_pool(club_id_param, current_month);
    
    SELECT * INTO pool_record
    FROM club_token_pools
    WHERE club_id = club_id_param AND month_year = current_month;
  END IF;
  
  -- Get club tier for overdraft calculation
  SELECT subscription_tier INTO club_tier
  FROM clubs
  WHERE id = club_id_param;
  
  -- Set overdraft limit based on tier
  IF club_tier IN ('plus', 'pro') THEN
    overdraft_limit := pool_record.allocated_tokens * 0.1; -- 10% overdraft
  END IF;
  
  -- Calculate available tokens
  available_tokens := pool_record.allocated_tokens + 
                     pool_record.rollover_tokens + 
                     pool_record.purchased_tokens - 
                     pool_record.used_tokens +
                     overdraft_limit -
                     pool_record.overdraft_tokens;
  
  RETURN available_tokens >= requested_tokens;
END;
$$;

-- Process token redemption function
CREATE OR REPLACE FUNCTION process_token_redemption(
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
  current_month TEXT := to_char(CURRENT_DATE, 'YYYY-MM');
  redemption_percentage NUMERIC;
BEGIN
  -- Check if tokens are available
  IF NOT check_token_availability(club_id_param, tokens_to_use) THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate redemption percentage
  redemption_percentage := (tokens_to_use * 0.007) / total_service_value_param * 100;
  
  -- Update token pool usage
  UPDATE club_token_pools
  SET used_tokens = used_tokens + tokens_to_use,
      updated_at = now()
  WHERE club_id = club_id_param AND month_year = current_month;
  
  -- Log the redemption
  INSERT INTO token_redemptions (
    club_id, player_id, service_type, service_details,
    tokens_used, cash_amount, total_service_value, redemption_percentage
  )
  VALUES (
    club_id_param, player_id_param, service_type_param, service_details_param,
    tokens_to_use, cash_amount_param, total_service_value_param, redemption_percentage
  );
  
  RETURN TRUE;
END;
$$;