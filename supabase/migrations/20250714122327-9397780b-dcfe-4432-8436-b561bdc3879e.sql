-- Phase 1: Enhance club_court_bookings and migrate court_bookings data

-- First, add missing fields to club_court_bookings table
ALTER TABLE public.club_court_bookings 
ADD COLUMN IF NOT EXISTS total_cost_money INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_cost_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS player_id UUID REFERENCES auth.users(id);

-- Create index for player_id for better query performance
CREATE INDEX IF NOT EXISTS idx_club_court_bookings_player_id ON public.club_court_bookings(player_id);

-- Migrate data from court_bookings to club_court_bookings
-- First, we need to extract club_id from court relationships
INSERT INTO public.club_court_bookings (
  club_id,
  court_id, 
  user_id,
  player_id,
  booking_date,
  start_time,
  end_time,
  status,
  payment_method,
  total_cost_money,
  total_cost_tokens,
  tokens_used,
  notes,
  created_at,
  updated_at
)
SELECT 
  cc.club_id,
  cb.court_id,
  cb.player_id as user_id,
  cb.player_id,
  DATE(cb.start_datetime) as booking_date,
  TIME(cb.start_datetime) as start_time,
  TIME(cb.end_datetime) as end_time,
  cb.status,
  cb.payment_method,
  cb.total_cost_money,
  cb.total_cost_tokens,
  COALESCE(cb.total_cost_tokens, 0) as tokens_used,
  cb.notes,
  cb.created_at,
  cb.updated_at
FROM public.court_bookings cb
JOIN public.club_courts cc ON cb.court_id = cc.id
WHERE NOT EXISTS (
  -- Avoid duplicates by checking if booking already exists in club_court_bookings
  SELECT 1 FROM public.club_court_bookings ccb 
  WHERE ccb.court_id = cb.court_id 
    AND ccb.user_id = cb.player_id
    AND ccb.booking_date = DATE(cb.start_datetime)
    AND ccb.start_time = TIME(cb.start_datetime)
);

-- Update RLS policies for enhanced club_court_bookings table
-- The existing policies should still work, but let's ensure player_id access

-- Add policy for player_id access (backward compatibility)
CREATE POLICY IF NOT EXISTS "Users can view their bookings via player_id" 
ON public.club_court_bookings
FOR SELECT 
USING (auth.uid() = player_id);

CREATE POLICY IF NOT EXISTS "Users can update their bookings via player_id" 
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

-- Enable RLS on the view 
ALTER VIEW public.unified_court_bookings SET (security_invoker = true);

-- Add comment for documentation
COMMENT ON TABLE public.club_court_bookings IS 'Unified court booking table that combines features from both court_bookings and club_court_bookings. Supports both token-based and stripe payments within club context.';

COMMENT ON VIEW public.unified_court_bookings IS 'Backward compatibility view that presents club_court_bookings data in the original court_bookings format for existing code.';