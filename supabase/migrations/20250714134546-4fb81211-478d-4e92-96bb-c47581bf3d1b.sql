-- Fix ambiguous user_id column reference in book_service function
CREATE OR REPLACE FUNCTION book_service(
  p_service_id UUID,
  p_user_id UUID,
  p_tokens_to_use INTEGER,
  p_cash_amount_cents INTEGER
) RETURNS JSON AS $$
DECLARE
  service_record club_services%ROWTYPE;
  booking_id UUID;
  result JSON;
BEGIN
  -- Get service details
  SELECT * INTO service_record FROM club_services WHERE id = p_service_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Service not found');
  END IF;
  
  -- Create the booking with explicit table qualification
  INSERT INTO service_bookings (
    service_id,
    user_id,
    booking_status,
    tokens_used,
    cash_amount_cents,
    total_amount_cents,
    created_at
  ) VALUES (
    p_service_id,
    p_user_id,
    'confirmed',
    p_tokens_to_use,
    p_cash_amount_cents,
    p_tokens_to_use + p_cash_amount_cents,
    NOW()
  ) RETURNING id INTO booking_id;
  
  RETURN json_build_object(
    'success', true, 
    'booking_id', booking_id,
    'message', 'Service booked successfully'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false, 
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;