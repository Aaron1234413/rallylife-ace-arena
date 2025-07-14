-- Fix ambiguous user_id column reference in book_club_service function
CREATE OR REPLACE FUNCTION public.book_club_service(service_id_param uuid, tokens_to_use integer, cash_amount_cents integer)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  booking_id UUID;
  service_record RECORD;
  current_user_id UUID;
  total_cost_tokens INTEGER;
  total_cost_usd INTEGER;
BEGIN
  current_user_id := auth.uid();
  
  -- Get service details
  SELECT * INTO service_record FROM club_services WHERE id = service_id_param AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Service not found or inactive';
  END IF;
  
  -- Check if user is a member of the club
  IF NOT EXISTS (
    SELECT 1 FROM club_memberships 
    WHERE club_id = service_record.club_id 
    AND club_memberships.user_id = current_user_id 
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
  
  -- Create booking with explicit table qualification
  INSERT INTO service_bookings (
    service_id, user_id, booking_status, payment_method,
    tokens_used, cash_amount_cents, total_cost_tokens, total_cost_usd
  )
  VALUES (
    service_id_param, current_user_id, 'confirmed', 
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
$function$