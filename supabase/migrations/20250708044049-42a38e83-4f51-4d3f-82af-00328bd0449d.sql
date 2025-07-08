-- Phase 7: Create staking and triggers

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