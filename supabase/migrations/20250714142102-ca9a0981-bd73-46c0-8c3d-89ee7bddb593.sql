-- Fix book_club_service function to match actual service_bookings table schema
CREATE OR REPLACE FUNCTION public.book_club_service(
  service_id_param uuid, 
  tokens_to_use integer, 
  cash_amount_cents integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  booking_id UUID;
  service_record RECORD;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Get service details
  SELECT * INTO service_record FROM club_services 
  WHERE id = service_id_param AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Service not found or inactive';
  END IF;
  
  -- Check if user is a member of the club
  IF NOT EXISTS (
    SELECT 1 FROM club_memberships 
    WHERE club_id = service_record.club_id 
    AND user_id = current_user_id 
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'User not a member of this club';
  END IF;
  
  -- Check available slots
  IF service_record.available_slots IS NOT NULL AND service_record.available_slots <= 0 THEN
    RAISE EXCEPTION 'No available slots for this service';
  END IF;
  
  -- Validate payment amounts
  IF cash_amount_cents > COALESCE(service_record.price_usd, 0) THEN
    RAISE EXCEPTION 'Cash amount exceeds service price';
  END IF;
  
  IF tokens_to_use > service_record.price_tokens THEN
    RAISE EXCEPTION 'Token amount exceeds service price';
  END IF;
  
  -- Ensure total payment covers service cost
  IF tokens_to_use + cash_amount_cents < service_record.price_tokens THEN
    RAISE EXCEPTION 'Payment amount does not cover service cost';
  END IF;
  
  -- Insert with correct column names matching actual table schema
  INSERT INTO service_bookings (
    service_id, 
    club_id, 
    player_id, 
    payment_type,
    tokens_paid, 
    usd_paid, 
    booking_status
  )
  VALUES (
    service_id_param, 
    service_record.club_id,
    current_user_id, 
    CASE 
      WHEN tokens_to_use > 0 AND cash_amount_cents > 0 THEN 'hybrid'
      WHEN tokens_to_use > 0 THEN 'tokens'
      ELSE 'cash' 
    END,
    tokens_to_use, 
    cash_amount_cents, 
    'confirmed'
  )
  RETURNING id INTO booking_id;
  
  -- Update available slots if applicable
  IF service_record.available_slots IS NOT NULL THEN
    UPDATE club_services 
    SET available_slots = available_slots - 1 
    WHERE id = service_id_param;
  END IF;
  
  RETURN booking_id;
END;
$function$