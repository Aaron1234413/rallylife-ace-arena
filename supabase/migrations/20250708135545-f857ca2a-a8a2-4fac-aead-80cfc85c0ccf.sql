-- First, drop the old constraint
ALTER TABLE clubs DROP CONSTRAINT clubs_subscription_tier_check;

-- Add new constraint that includes 'community' and removes 'free'
ALTER TABLE clubs ADD CONSTRAINT clubs_subscription_tier_check 
CHECK (subscription_tier = ANY (ARRAY['community'::text, 'core'::text, 'plus'::text, 'pro'::text]));

-- Update existing club subscriptions from 'free' to 'community'
UPDATE club_subscriptions 
SET tier_id = 'community', updated_at = now() 
WHERE tier_id = 'free';

-- Remove the old 'free' tier to prevent confusion
DELETE FROM subscription_tiers WHERE id = 'free';

-- Update clubs table default subscription tier
UPDATE clubs 
SET subscription_tier = 'community' 
WHERE subscription_tier = 'free' OR subscription_tier IS NULL;