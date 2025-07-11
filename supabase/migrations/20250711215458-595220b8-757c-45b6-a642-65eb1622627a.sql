-- Add payment-related columns to club_court_bookings table
ALTER TABLE public.club_court_bookings 
ADD COLUMN stripe_session_id TEXT,
ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN base_amount INTEGER, -- Amount in cents before fees
ADD COLUMN convenience_fee INTEGER, -- 5% RAKO fee in cents
ADD COLUMN total_amount INTEGER; -- Total amount in cents (base + convenience fee)

-- Update payment_method to include 'stripe' option
ALTER TABLE public.club_court_bookings 
ALTER COLUMN payment_method SET DEFAULT 'stripe';

-- Add index for faster stripe session lookups
CREATE INDEX idx_club_court_bookings_stripe_session_id ON public.club_court_bookings(stripe_session_id);

-- Add index for payment status queries
CREATE INDEX idx_club_court_bookings_payment_status ON public.club_court_bookings(payment_status);

-- Update the status column to include payment-related statuses
-- Current default is 'confirmed', we'll keep that but add 'pending_payment', 'paid', 'cancelled'