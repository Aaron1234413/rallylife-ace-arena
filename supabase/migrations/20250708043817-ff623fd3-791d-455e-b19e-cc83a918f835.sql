-- Phase 7: Two-Layer Economics - Club Subscription Tiers

-- Update subscription_tiers table with the new club pricing structure
INSERT INTO public.subscription_tiers (
  id, name, price_monthly, member_limit, coach_limit, token_allocation, features
) VALUES 
  ('community', 'Community', 0, 50, 1, 5000, 
   '["Basic features", "5,000 tokens/month", "50 members max", "1 coach", "Community support"]'::jsonb),
  ('core', 'Core', 49, 100, 3, 50000,
   '["Enhanced features", "50,000 tokens/month", "100 members max", "3 coaches", "Email support"]'::jsonb),
  ('plus', 'Plus', 149, 300, 8, 150000,
   '["Advanced features", "150,000 tokens/month", "300 members max", "8 coaches", "Token rollover", "Priority support"]'::jsonb),
  ('pro', 'Pro', 299, 500, 15, 300000,
   '["All features", "300,000 tokens/month", "500 members max", "15 coaches", "Token rollover", "Overdraft capability", "Dedicated support"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  member_limit = EXCLUDED.member_limit,
  coach_limit = EXCLUDED.coach_limit,
  token_allocation = EXCLUDED.token_allocation,
  features = EXCLUDED.features,
  updated_at = now();

-- Create club services pricing table for organizer-set pricing
CREATE TABLE IF NOT EXISTS public.club_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('lesson', 'tournament', 'social', 'court_booking', 'coaching_session')),
  name TEXT NOT NULL,
  description TEXT,
  price_tokens INTEGER NOT NULL DEFAULT 0,
  price_usd INTEGER DEFAULT 0, -- in cents
  hybrid_payment_enabled BOOLEAN DEFAULT true,
  duration_minutes INTEGER,
  max_participants INTEGER,
  available_slots INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for club services
ALTER TABLE public.club_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for club services
CREATE POLICY "Club members can view club services"
ON public.club_services FOR SELECT
USING (
  club_id IN (
    SELECT club_id FROM public.club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Club organizers can manage services"
ON public.club_services FOR ALL
USING (
  organizer_id = auth.uid() OR
  club_id IN (
    SELECT club_id FROM public.club_memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
  )
);

-- Create service bookings table for tracking payments
CREATE TABLE IF NOT EXISTS public.service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.club_services(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('tokens', 'usd', 'hybrid')),
  tokens_paid INTEGER DEFAULT 0,
  usd_paid INTEGER DEFAULT 0, -- in cents
  stripe_payment_intent_id TEXT,
  booking_status TEXT NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  scheduled_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for service bookings
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service bookings
CREATE POLICY "Users can view their own bookings"
ON public.service_bookings FOR SELECT
USING (player_id = auth.uid());

CREATE POLICY "Users can create bookings"
ON public.service_bookings FOR INSERT
WITH CHECK (player_id = auth.uid());

CREATE POLICY "Club organizers can view all bookings"
ON public.service_bookings FOR SELECT
USING (
  club_id IN (
    SELECT club_id FROM public.club_memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'coach') AND status = 'active'
  )
);

-- Create player staking table for player-to-player stakes
CREATE TABLE IF NOT EXISTS public.player_stakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  staker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stake_type TEXT NOT NULL CHECK (stake_type IN ('match_outcome', 'training_completion', 'achievement_unlock')),
  stake_amount_tokens INTEGER NOT NULL,
  odds_multiplier DECIMAL(3,2) DEFAULT 1.0,
  stake_status TEXT NOT NULL DEFAULT 'active' CHECK (stake_status IN ('active', 'won', 'lost', 'cancelled')),
  description TEXT,
  expires_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  payout_amount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for player stakes
ALTER TABLE public.player_stakes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for player stakes
CREATE POLICY "Users can view stakes they're involved in"
ON public.player_stakes FOR SELECT
USING (staker_id = auth.uid() OR target_player_id = auth.uid());

CREATE POLICY "Users can create stakes"
ON public.player_stakes FOR INSERT
WITH CHECK (staker_id = auth.uid());

CREATE POLICY "Users can update their own stakes"
ON public.player_stakes FOR UPDATE
USING (staker_id = auth.uid());

-- Add token_allocation column to subscription_tiers if not exists
ALTER TABLE public.subscription_tiers 
ADD COLUMN IF NOT EXISTS token_allocation INTEGER DEFAULT 0;

-- Add stripe_price_id columns for subscription management
ALTER TABLE public.subscription_tiers 
ADD COLUMN IF NOT EXISTS stripe_price_id_monthly TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id_yearly TEXT;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_club_services_updated_at 
  BEFORE UPDATE ON public.club_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_bookings_updated_at 
  BEFORE UPDATE ON public.service_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_stakes_updated_at 
  BEFORE UPDATE ON public.player_stakes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();