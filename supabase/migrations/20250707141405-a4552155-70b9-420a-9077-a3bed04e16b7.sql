-- Phase 2: Subscription Management & Stripe Integration Database Changes

-- Club subscription tracking
CREATE TABLE IF NOT EXISTS club_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  tier_id TEXT REFERENCES subscription_tiers(id),
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Usage tracking for enforcement
CREATE TABLE IF NOT EXISTS club_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  tracking_date DATE DEFAULT CURRENT_DATE,
  active_members INTEGER DEFAULT 0,
  active_coaches INTEGER DEFAULT 0,
  sessions_created INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(club_id, tracking_date)
);

-- Enable RLS on new tables
ALTER TABLE club_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for club_subscriptions
CREATE POLICY "Club owners can view subscription info" ON club_subscriptions
FOR SELECT USING (
  club_id IN (
    SELECT id FROM clubs WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Club owners can update subscription info" ON club_subscriptions
FOR UPDATE USING (
  club_id IN (
    SELECT id FROM clubs WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "System can manage subscriptions" ON club_subscriptions
FOR ALL USING (true);

-- RLS policies for club_usage_tracking
CREATE POLICY "Club owners can view usage tracking" ON club_usage_tracking
FOR SELECT USING (
  club_id IN (
    SELECT id FROM clubs WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Club members can view usage tracking" ON club_usage_tracking
FOR SELECT USING (
  club_id IN (
    SELECT club_id FROM club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "System can manage usage tracking" ON club_usage_tracking
FOR ALL USING (true);

-- Function to update club usage tracking
CREATE OR REPLACE FUNCTION update_club_usage_tracking(club_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO club_usage_tracking (
    club_id,
    tracking_date,
    active_members,
    active_coaches,
    sessions_created,
    updated_at
  )
  VALUES (
    club_id_param,
    CURRENT_DATE,
    (SELECT COUNT(*) FROM club_memberships 
     WHERE club_id = club_id_param AND status = 'active' AND role != 'coach'),
    (SELECT COUNT(*) FROM club_memberships 
     WHERE club_id = club_id_param AND status = 'active' AND role = 'coach'),
    0, -- sessions will be updated separately
    now()
  )
  ON CONFLICT (club_id, tracking_date) 
  DO UPDATE SET
    active_members = EXCLUDED.active_members,
    active_coaches = EXCLUDED.active_coaches,
    updated_at = now();
END;
$$;

-- Initialize subscriptions for existing clubs
INSERT INTO club_subscriptions (club_id, tier_id, status, created_at)
SELECT 
  id,
  COALESCE(subscription_tier, 'community'),
  COALESCE(subscription_status, 'active'),
  created_at
FROM clubs
WHERE id NOT IN (SELECT club_id FROM club_subscriptions WHERE club_id IS NOT NULL)
ON CONFLICT DO NOTHING;