-- Add court_limit column to subscription_tiers table
ALTER TABLE subscription_tiers ADD COLUMN court_limit INTEGER;

-- Update subscription tiers with court limits
UPDATE subscription_tiers 
SET court_limit = 1 
WHERE id = 'community';

UPDATE subscription_tiers 
SET court_limit = 6 
WHERE id = 'core';

UPDATE subscription_tiers 
SET court_limit = 10 
WHERE id = 'plus';

UPDATE subscription_tiers 
SET court_limit = -1 
WHERE id = 'pro'; -- -1 represents unlimited