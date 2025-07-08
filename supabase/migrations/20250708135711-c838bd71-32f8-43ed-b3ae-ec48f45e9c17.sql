-- Step 1: Update all data first (while old constraint still allows 'free')
UPDATE clubs 
SET subscription_tier = 'community' 
WHERE subscription_tier = 'free' OR subscription_tier IS NULL;

UPDATE club_subscriptions 
SET tier_id = 'community', updated_at = now() 
WHERE tier_id = 'free';

-- Step 2: Now drop and recreate the constraint (all data is now 'community')
ALTER TABLE clubs DROP CONSTRAINT clubs_subscription_tier_check;

ALTER TABLE clubs ADD CONSTRAINT clubs_subscription_tier_check 
CHECK (subscription_tier = ANY (ARRAY['community'::text, 'core'::text, 'plus'::text, 'pro'::text]));

-- Step 3: Remove the old 'free' tier from subscription_tiers
DELETE FROM subscription_tiers WHERE id = 'free';