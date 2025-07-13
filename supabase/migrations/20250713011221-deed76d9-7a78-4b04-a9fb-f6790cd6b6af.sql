-- Fix the initialize_player_tokens function to properly set player_id
CREATE OR REPLACE FUNCTION public.initialize_player_tokens(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.token_balances (player_id, regular_tokens, premium_tokens, lifetime_earned)
  VALUES (user_id, 100, 1, 0) -- Start with 100 regular tokens and 1 premium token
  ON CONFLICT (player_id) DO NOTHING;
END;
$$;