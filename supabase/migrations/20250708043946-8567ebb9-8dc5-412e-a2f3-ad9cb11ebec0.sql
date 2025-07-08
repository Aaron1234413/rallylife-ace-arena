-- Phase 7: Two-Layer Economics - Club Subscription Tiers (Fixed)

-- Add token_allocation column to subscription_tiers if not exists
ALTER TABLE public.subscription_tiers 
ADD COLUMN IF NOT EXISTS token_allocation INTEGER DEFAULT 0;

-- Add stripe_price_id columns for subscription management
ALTER TABLE public.subscription_tiers 
ADD COLUMN IF NOT EXISTS stripe_price_id_monthly TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id_yearly TEXT;

-- Update subscription_tiers table with the new club pricing structure
INSERT INTO public.subscription_tiers (
  id, name, price_monthly, member_limit, coach_limit, token_allocation, features
) VALUES 
  ('community', 'Community', 0, 50, 1, 5000, 
   '["Basic features", "5,000 tokens/month", "50 members max", "1 coach", "Community support"]'::jsonb),
  ('core', 'Core', 49, 100, 3, 50000,
   '["Enhanced features", "50,000 tokens/month", "100 members max", "3 coaches", "Email support"]'::jsonb),
  ('plus', 'Plus', 149, 300, 8, 150000,
   '["Advanced features", "150,000 tokens/month", "300 members max", "8 coaches", "Token rollover", "Priority support"]'::jsonb),
  ('pro', 'Pro', 299, 500, 15, 300000,
   '["All features", "300,000 tokens/month", "500 members max", "15 coaches", "Token rollover", "Overdraft capability", "Dedicated support"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  member_limit = EXCLUDED.member_limit,
  coach_limit = EXCLUDED.coach_limit,
  token_allocation = EXCLUDED.token_allocation,
  features = EXCLUDED.features,
  updated_at = now();