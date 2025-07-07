-- Phase 3: Token Economics & Redemption System Migration

-- Update token_balances table for new personal token structure
ALTER TABLE public.token_balances 
ADD COLUMN IF NOT EXISTS personal_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_subscription_tokens INTEGER DEFAULT 0;

-- Update existing regular_tokens to personal_tokens if personal_tokens is 0
UPDATE public.token_balances 
SET personal_tokens = regular_tokens 
WHERE personal_tokens = 0;

-- Create token_redemptions table for tracking redemptions
CREATE TABLE IF NOT EXISTS public.token_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL,
  player_id UUID NOT NULL,
  service_type TEXT NOT NULL, -- 'lesson', 'court_time', 'clinic'
  service_details JSONB DEFAULT '{}',
  tokens_used INTEGER NOT NULL,
  cash_amount DECIMAL(10,2) NOT NULL,
  total_service_value DECIMAL(10,2) NOT NULL,
  redemption_percentage DECIMAL(5,2) NOT NULL,
  club_pool_deducted INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on token_redemptions
ALTER TABLE public.token_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for token_redemptions
CREATE POLICY "Users can view their own redemptions" ON public.token_redemptions
  FOR SELECT USING (auth.uid() = player_id);

CREATE POLICY "Club members can view club redemptions" ON public.token_redemptions
  FOR SELECT USING (
    club_id IN (
      SELECT club_id FROM club_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Function to check token availability in club pool
CREATE OR REPLACE FUNCTION public.check_token_availability(
  club_id_param UUID,
  requested_tokens INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  current_pool RECORD;
  available_tokens INTEGER;
BEGIN
  -- Get current month's pool
  SELECT * INTO current_pool
  FROM club_token_pools
  WHERE club_id = club_id_param 
    AND month_year = to_char(now(), 'YYYY-MM');
  
  IF current_pool IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate available tokens including overdraft
  available_tokens := current_pool.allocated_tokens + 
                     current_pool.rollover_tokens + 
                     current_pool.purchased_tokens - 
                     current_pool.used_tokens +
                     current_pool.overdraft_tokens;
  
  RETURN available_tokens >= requested_tokens;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process token redemption
CREATE OR REPLACE FUNCTION public.process_token_redemption(
  club_id_param UUID,
  player_id_param UUID,
  service_type_param TEXT,
  service_details_param JSONB,
  tokens_to_use INTEGER,
  cash_amount_param DECIMAL,
  total_service_value_param DECIMAL
) RETURNS BOOLEAN AS $$
DECLARE
  pool_record RECORD;
  redemption_percentage DECIMAL;
BEGIN
  -- Check if tokens are available
  IF NOT public.check_token_availability(club_id_param, tokens_to_use) THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate redemption percentage
  redemption_percentage := (tokens_to_use * 0.007) / total_service_value_param * 100;
  
  -- Update club token pool
  UPDATE club_token_pools
  SET used_tokens = used_tokens + tokens_to_use,
      updated_at = now()
  WHERE club_id = club_id_param 
    AND month_year = to_char(now(), 'YYYY-MM');
  
  -- Create redemption record
  INSERT INTO token_redemptions (
    club_id, player_id, service_type, service_details,
    tokens_used, cash_amount, total_service_value, 
    redemption_percentage, club_pool_deducted
  ) VALUES (
    club_id_param, player_id_param, service_type_param, service_details_param,
    tokens_to_use, cash_amount_param, total_service_value_param,
    redemption_percentage, tokens_to_use
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add monthly subscription tokens
CREATE OR REPLACE FUNCTION public.add_monthly_subscription_tokens(
  user_id_param UUID,
  token_amount INTEGER
) RETURNS VOID AS $$
BEGIN
  -- Update or insert token balance
  INSERT INTO token_balances (player_id, monthly_subscription_tokens, updated_at)
  VALUES (user_id_param, token_amount, now())
  ON CONFLICT (player_id) 
  DO UPDATE SET 
    monthly_subscription_tokens = token_balances.monthly_subscription_tokens + token_amount,
    updated_at = now();
    
  -- Log the transaction
  INSERT INTO token_transactions (
    player_id, transaction_type, token_type, amount, source, description
  ) VALUES (
    user_id_param, 'earn', 'subscription', token_amount, 'subscription', 
    'Monthly subscription tokens added'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_token_redemptions_club_id ON token_redemptions(club_id);
CREATE INDEX IF NOT EXISTS idx_token_redemptions_player_id ON token_redemptions(player_id);
CREATE INDEX IF NOT EXISTS idx_token_redemptions_created_at ON token_redemptions(created_at);

-- Add realtime publication for token_redemptions
ALTER PUBLICATION supabase_realtime ADD TABLE token_redemptions;