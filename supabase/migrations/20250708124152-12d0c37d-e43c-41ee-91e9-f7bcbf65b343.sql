-- Phase 2: Backend Integration - Service and Staking Functions

-- Create service booking RPC functions
CREATE OR REPLACE FUNCTION public.create_club_service(
  club_id_param UUID,
  service_name TEXT,
  service_description TEXT,
  service_type_param TEXT,
  price_tokens_param INTEGER,
  price_usd_param INTEGER,
  hybrid_payment_enabled_param BOOLEAN,
  duration_minutes_param INTEGER,
  max_participants_param INTEGER,
  available_slots_param INTEGER
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  service_id UUID;
  user_id UUID;
BEGIN
  user_id := auth.uid();
  
  -- Verify user has permission to create services for this club
  IF NOT EXISTS (
    SELECT 1 FROM club_memberships 
    WHERE club_id = club_id_param 
    AND user_id = auth.uid() 
    AND status = 'active'
    AND role IN ('owner', 'admin')
  ) THEN
    RAISE EXCEPTION 'User not authorized to create services for this club';
  END IF;
  
  -- Create the service
  INSERT INTO club_services (
    club_id, organizer_id, name, description, service_type,
    price_tokens, price_usd, hybrid_payment_enabled,
    duration_minutes, max_participants, available_slots
  )
  VALUES (
    club_id_param, user_id, service_name, service_description, service_type_param,
    price_tokens_param, price_usd_param, hybrid_payment_enabled_param,
    duration_minutes_param, max_participants_param, available_slots_param
  )
  RETURNING id INTO service_id;
  
  RETURN service_id;
END;
$$;

-- Create function to book a service
CREATE OR REPLACE FUNCTION public.book_club_service(
  service_id_param UUID,
  tokens_to_use INTEGER,
  cash_amount_cents INTEGER
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  booking_id UUID;
  service_record RECORD;
  user_id UUID;
  total_cost_tokens INTEGER;
  total_cost_usd INTEGER;
BEGIN
  user_id := auth.uid();
  
  -- Get service details
  SELECT * INTO service_record FROM club_services WHERE id = service_id_param AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Service not found or inactive';
  END IF;
  
  -- Check if user is a member of the club
  IF NOT EXISTS (
    SELECT 1 FROM club_memberships 
    WHERE club_id = service_record.club_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'User not a member of this club';
  END IF;
  
  -- Check available slots
  IF service_record.available_slots <= 0 THEN
    RAISE EXCEPTION 'No available slots for this service';
  END IF;
  
  -- Validate payment amounts
  total_cost_tokens := service_record.price_tokens;
  total_cost_usd := service_record.price_usd;
  
  IF tokens_to_use > total_cost_tokens THEN
    RAISE EXCEPTION 'Token amount exceeds service price';
  END IF;
  
  IF cash_amount_cents > total_cost_usd THEN
    RAISE EXCEPTION 'Cash amount exceeds service price';
  END IF;
  
  -- Create booking
  INSERT INTO service_bookings (
    service_id, user_id, booking_status, payment_method,
    tokens_used, cash_amount_cents, total_cost_tokens, total_cost_usd
  )
  VALUES (
    service_id_param, user_id, 'confirmed', 
    CASE WHEN tokens_to_use > 0 AND cash_amount_cents > 0 THEN 'hybrid'
         WHEN tokens_to_use > 0 THEN 'tokens'
         ELSE 'cash' END,
    tokens_to_use, cash_amount_cents, total_cost_tokens, total_cost_usd
  )
  RETURNING id INTO booking_id;
  
  -- Update available slots
  UPDATE club_services 
  SET available_slots = available_slots - 1 
  WHERE id = service_id_param;
  
  RETURN booking_id;
END;
$$;

-- Create player staking RPC functions
CREATE OR REPLACE FUNCTION public.create_player_stake(
  club_id_param UUID,
  target_player_id_param UUID,
  stake_type_param TEXT,
  stake_amount_param INTEGER,
  odds_multiplier_param DECIMAL,
  description_param TEXT,
  expires_at_param TIMESTAMPTZ
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stake_id UUID;
  user_id UUID;
BEGIN
  user_id := auth.uid();
  
  -- Verify user is a member of the club
  IF NOT EXISTS (
    SELECT 1 FROM club_memberships 
    WHERE club_id = club_id_param 
    AND user_id = auth.uid() 
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'User not a member of this club';
  END IF;
  
  -- Verify target player is also a member
  IF NOT EXISTS (
    SELECT 1 FROM club_memberships 
    WHERE club_id = club_id_param 
    AND user_id = target_player_id_param 
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Target player not a member of this club';
  END IF;
  
  -- Can't stake on yourself
  IF target_player_id_param = user_id THEN
    RAISE EXCEPTION 'Cannot stake on yourself';
  END IF;
  
  -- Validate stake amount
  IF stake_amount_param < 50 OR stake_amount_param > 2000 THEN
    RAISE EXCEPTION 'Stake amount must be between 50 and 2000 tokens';
  END IF;
  
  -- Create the stake
  INSERT INTO player_stakes (
    club_id, staker_id, target_player_id, stake_type,
    stake_amount_tokens, odds_multiplier, description, expires_at
  )
  VALUES (
    club_id_param, user_id, target_player_id_param, stake_type_param,
    stake_amount_param, odds_multiplier_param, description_param, expires_at_param
  )
  RETURNING id INTO stake_id;
  
  RETURN stake_id;
END;
$$;

-- Create function to resolve stakes
CREATE OR REPLACE FUNCTION public.resolve_player_stake(
  stake_id_param UUID,
  outcome_won BOOLEAN
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stake_record RECORD;
  payout_amount INTEGER;
  club_fee INTEGER;
  result JSON;
BEGIN
  -- Get stake details
  SELECT * INTO stake_record FROM player_stakes WHERE id = stake_id_param;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stake not found';
  END IF;
  
  -- Check if user has permission to resolve (club admin)
  IF NOT EXISTS (
    SELECT 1 FROM club_memberships 
    WHERE club_id = stake_record.club_id 
    AND user_id = auth.uid() 
    AND status = 'active'
    AND role IN ('owner', 'admin')
  ) THEN
    RAISE EXCEPTION 'User not authorized to resolve stakes';
  END IF;
  
  -- Check if already resolved
  IF stake_record.stake_status != 'active' THEN
    RAISE EXCEPTION 'Stake already resolved';
  END IF;
  
  -- Calculate payout
  IF outcome_won THEN
    payout_amount := ROUND(stake_record.stake_amount_tokens * stake_record.odds_multiplier);
    club_fee := ROUND(payout_amount * 0.05); -- 5% club fee
    payout_amount := payout_amount - club_fee;
    
    -- Update stake as won
    UPDATE player_stakes 
    SET stake_status = 'won', 
        resolved_at = now(), 
        payout_amount = payout_amount
    WHERE id = stake_id_param;
  ELSE
    -- Update stake as lost
    UPDATE player_stakes 
    SET stake_status = 'lost', 
        resolved_at = now(), 
        payout_amount = 0
    WHERE id = stake_id_param;
  END IF;
  
  result := json_build_object(
    'success', true,
    'outcome', CASE WHEN outcome_won THEN 'won' ELSE 'lost' END,
    'payout_amount', COALESCE(payout_amount, 0),
    'club_fee', COALESCE(club_fee, 0)
  );
  
  RETURN result;
END;
$$;

-- Create function to check token availability for club redemptions
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
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  -- Get current month's token pool
  SELECT * INTO pool_record 
  FROM club_token_pools 
  WHERE club_id = club_id_param AND month_year = current_month;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Calculate available tokens
  available_tokens := pool_record.allocated_tokens + 
                     pool_record.rollover_tokens + 
                     pool_record.purchased_tokens - 
                     pool_record.used_tokens;
  
  RETURN available_tokens >= requested_tokens;
END;
$$;

-- Create function to process token redemptions for services
CREATE OR REPLACE FUNCTION public.process_token_redemption(
  club_id_param UUID,
  player_id_param UUID,
  service_type_param TEXT,
  service_details_param JSONB,
  tokens_to_use INTEGER,
  cash_amount_param INTEGER,
  total_service_value_param INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month TEXT;
  redemption_percentage DECIMAL;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  -- Check token availability
  IF NOT public.check_token_availability(club_id_param, tokens_to_use) THEN
    RETURN false;
  END IF;
  
  -- Calculate redemption percentage
  redemption_percentage := (tokens_to_use::DECIMAL / total_service_value_param) * 100;
  
  -- Update token pool
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
  
  RETURN true;
END;
$$;