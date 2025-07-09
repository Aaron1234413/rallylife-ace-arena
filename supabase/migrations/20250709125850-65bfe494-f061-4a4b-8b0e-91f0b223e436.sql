-- Award all players a one-time bonus of 100 tokens
-- First, update existing token_balance records
UPDATE public.token_balances 
SET 
  regular_tokens = regular_tokens + 100,
  lifetime_tokens_earned = lifetime_tokens_earned + 100,
  updated_at = now()
WHERE player_id IN (
  SELECT id FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'player' 
  OR (raw_user_meta_data->>'role' IS NULL AND email IS NOT NULL)
);

-- Insert token_balance records for players who don't have one yet
INSERT INTO public.token_balances (player_id, regular_tokens, lifetime_tokens_earned)
SELECT 
  u.id,
  100,
  100
FROM auth.users u
LEFT JOIN public.token_balances tb ON u.id = tb.player_id
WHERE tb.player_id IS NULL 
  AND (u.raw_user_meta_data->>'role' = 'player' OR (u.raw_user_meta_data->>'role' IS NULL AND u.email IS NOT NULL));

-- Log the bonus transactions for all players
INSERT INTO public.token_transactions (player_id, transaction_type, token_type, amount, source, description, metadata)
SELECT 
  u.id,
  'earn',
  'regular',
  100,
  'admin_bonus',
  'One-time 100 token bonus for all players',
  '{"bonus_type": "admin_award", "awarded_at": "' || now()::text || '"}'::jsonb
FROM auth.users u
WHERE u.raw_user_meta_data->>'role' = 'player' 
  OR (u.raw_user_meta_data->>'role' IS NULL AND u.email IS NOT NULL);