-- Update club subscription tiers with new pricing structure
-- Clear existing tiers and insert new ones

DELETE FROM subscription_tiers;

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
]');

-- Update existing clubs to use 'free' tier if they have invalid tiers
UPDATE clubs 
SET subscription_tier = 'free' 
WHERE subscription_tier NOT IN ('free', 'core', 'plus', 'pro');

-- Update the check constraint to include new tiers
ALTER TABLE clubs DROP CONSTRAINT IF EXISTS clubs_subscription_tier_check;
ALTER TABLE clubs ADD CONSTRAINT clubs_subscription_tier_check 
  CHECK (subscription_tier IN ('free', 'core', 'plus', 'pro'));