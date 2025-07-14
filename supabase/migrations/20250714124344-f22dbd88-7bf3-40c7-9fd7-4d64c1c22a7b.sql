-- Add RLS policies for enhanced club_court_bookings table
-- Add policy for player_id access (backward compatibility)
DROP POLICY IF EXISTS "Users can view their bookings via player_id" ON public.club_court_bookings;
CREATE POLICY "Users can view their bookings via player_id" 
ON public.club_court_bookings
FOR SELECT 
USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Users can update their bookings via player_id" ON public.club_court_bookings;
CREATE POLICY "Users can update their bookings via player_id" 
ON public.club_court_bookings
FOR UPDATE 
USING (auth.uid() = player_id);

-- Create a view for backward compatibility with existing code that expects court_bookings format
CREATE OR REPLACE VIEW public.unified_court_bookings AS
SELECT 
  id,
  court_id,
  COALESCE(user_id, player_id) as player_id,
  (booking_date + start_time::interval)::timestamptz as start_datetime,
  (booking_date + end_time::interval)::timestamptz as end_datetime,
  status,
  payment_method,
  COALESCE(total_cost_money, base_amount, 0) as total_cost_money,
  COALESCE(total_cost_tokens, tokens_used, 0) as total_cost_tokens,
  notes,
  created_at,
  updated_at,
  club_id,
  -- Additional club_court_bookings fields
  stripe_session_id,
  payment_status,
  base_amount,
  convenience_fee,
  total_amount
FROM public.club_court_bookings;