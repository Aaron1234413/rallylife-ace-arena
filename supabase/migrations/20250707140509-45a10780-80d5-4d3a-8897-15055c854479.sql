-- Phase 1: Enhanced Club Creation Form Database Changes

-- Add subscription and operational fields to clubs table
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'community';
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS court_count INTEGER DEFAULT 1;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS coach_slots INTEGER DEFAULT 1;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{"monday": {"open": "06:00", "close": "22:00"}, "tuesday": {"open": "06:00", "close": "22:00"}, "wednesday": {"open": "06:00", "close": "22:00"}, "thursday": {"open": "06:00", "close": "22:00"}, "friday": {"open": "06:00", "close": "22:00"}, "saturday": {"open": "08:00", "close": "20:00"}, "sunday": {"open": "08:00", "close": "20:00"}}';
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS current_member_count INTEGER DEFAULT 0;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS current_coach_count INTEGER DEFAULT 0;

-- Create subscription tiers table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly DECIMAL NOT NULL,
  member_limit INTEGER NOT NULL,
  coach_limit INTEGER NOT NULL,
  features JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert the three tiers
INSERT INTO subscription_tiers (id, name, price_monthly, member_limit, coach_limit, features) VALUES
('community', 'Community', 0.00, 50, 1, '["Basic club creation & joining", "Static roster (refresh to see new members)", "Standard sessions (no rake breakdown)"]'),
('competitive', 'Competitive', 99.00, 200, 4, '["Everything in Community", "Real-time roster updates", "Token-session rake & host-split UI", "Session analytics dashboard (matches played, token volume)"]'),
('champions', 'Champions', 199.00, 350, 8, '["Everything in Competitive", "Recurring session scheduling & waitlists", "Peak/off-peak court pricing controls", "Priority support & custom branding (club logo in app)"]')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  member_limit = EXCLUDED.member_limit,
  coach_limit = EXCLUDED.coach_limit,
  features = EXCLUDED.features,
  updated_at = now();

-- Add constraint to ensure valid subscription tiers
ALTER TABLE clubs ADD CONSTRAINT IF NOT EXISTS clubs_subscription_tier_check 
  CHECK (subscription_tier IN ('community', 'competitive', 'champions'));

-- Add constraint to ensure positive values
ALTER TABLE clubs ADD CONSTRAINT IF NOT EXISTS clubs_court_count_positive 
  CHECK (court_count > 0);
ALTER TABLE clubs ADD CONSTRAINT IF NOT EXISTS clubs_coach_slots_positive 
  CHECK (coach_slots > 0);

-- Update existing clubs to have default values
UPDATE clubs SET 
  current_member_count = member_count,
  current_coach_count = 0
WHERE current_member_count IS NULL OR current_coach_count IS NULL;