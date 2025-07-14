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
  cb.start_datetime::date as booking_date,
  cb.start_datetime::time as start_time,
  cb.end_datetime::time as end_time,
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
    AND ccb.booking_date = cb.start_datetime::date
    AND ccb.start_time = cb.start_datetime::time
);