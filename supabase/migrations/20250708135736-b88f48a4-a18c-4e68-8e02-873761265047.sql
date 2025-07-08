-- Step 1: Drop the existing constraint completely
ALTER TABLE clubs DROP CONSTRAINT IF EXISTS clubs_subscription_tier_check;

-- Step 2: Update all the data
UPDATE clubs 
SET subscription_tier = 'community' 
WHERE subscription_tier = 'free' OR subscription_tier IS NULL;

UPDATE club_subscriptions 
SET tier_id = 'community', updated_at = now() 
WHERE tier_id = 'free';

-- Step 3: Add the new constraint (without 'free')
ALTER TABLE clubs ADD CONSTRAINT clubs_subscription_tier_check 
CHECK (subscription_tier = ANY (ARRAY['community'::text, 'core'::text, 'plus'::text, 'pro'::text]));

-- Step 4: Remove the old 'free' tier
DELETE FROM subscription_tiers WHERE id = 'free';