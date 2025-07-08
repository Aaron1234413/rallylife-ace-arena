-- First, update existing club subscriptions to use new tier IDs
UPDATE club_subscriptions 
SET tier_id = CASE 
  WHEN tier_id = 'community' THEN 'free'
  WHEN tier_id = 'competitive' THEN 'core' 
  WHEN tier_id = 'champions' THEN 'plus'
  ELSE 'free'
END;

-- Update clubs table as well
UPDATE clubs 
SET subscription_tier = CASE 
  WHEN subscription_tier = 'community' THEN 'free'
  WHEN subscription_tier = 'competitive' THEN 'core'
  WHEN subscription_tier = 'champions' THEN 'plus' 
  ELSE 'free'
END;

-- Now update the subscription tiers
DELETE FROM subscription_tiers WHERE id IN ('community', 'competitive', 'champions');

INSERT INTO subscription_tiers (id, name, price_monthly, member_limit, coach_limit, features) VALUES
('free', 'Free', 0.00, 50, 1, '[
  "Basic club creation & joining",
  "5,000 tokens per month", 
  "Static roster (refresh to see new members)",
  "Standard sessions (no rake breakdown)",
  "Community support"
]'),
('core', 'Core', 99.00, 200, 4, '[
  "Everything in Free",
  "50,000 tokens per month",
  "Real-time roster updates", 
  "Token-session rake & host-split UI",
  "Session analytics dashboard",
  "Email support"
]'),
('plus', 'Plus', 199.00, 350, 8, '[
  "Everything in Core", 
  "150,000 tokens per month",
  "Token rollover (unused tokens carry forward)",
  "Recurring session scheduling & waitlists",
  "Peak/off-peak court pricing controls",
  "Priority support"
]'),
('pro', 'Pro', 399.00, 999999, 999999, '[
  "Everything in Plus",
  "300,000 tokens per month", 
  "Unlimited members & coaches",
  "Custom branding (club logo in app)",
  "Advanced analytics & reporting",
  "Dedicated account manager",
  "API access"
]')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  member_limit = EXCLUDED.member_limit,
  coach_limit = EXCLUDED.coach_limit,
  features = EXCLUDED.features,
  updated_at = now();

-- Update the check constraint
ALTER TABLE clubs DROP CONSTRAINT IF EXISTS clubs_subscription_tier_check;
ALTER TABLE clubs ADD CONSTRAINT clubs_subscription_tier_check 
  CHECK (subscription_tier IN ('free', 'core', 'plus', 'pro'));