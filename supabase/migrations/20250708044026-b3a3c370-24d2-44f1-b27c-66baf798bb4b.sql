-- Phase 7: Create economics tables

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