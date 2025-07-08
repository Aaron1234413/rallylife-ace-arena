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