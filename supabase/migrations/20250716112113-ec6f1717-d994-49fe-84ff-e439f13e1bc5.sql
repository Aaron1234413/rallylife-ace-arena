-- Create trigger to automatically initialize tokens for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Initialize player tokens
  PERFORM public.initialize_player_tokens(NEW.id);
  
  -- Initialize other player systems
  PERFORM public.initialize_player_hp(NEW.id);
  PERFORM public.initialize_player_xp(NEW.id);
  PERFORM public.initialize_player_avatar(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after user insertion
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- Update initialize_player_tokens function to use profiles table
CREATE OR REPLACE FUNCTION public.initialize_player_tokens(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update profiles table with initial tokens
  INSERT INTO public.profiles (id, tokens, lifetime_tokens_earned, daily_streak, last_login)
  VALUES (user_id, 100, 0, 0, CURRENT_DATE)
  ON CONFLICT (id) DO UPDATE SET
    tokens = COALESCE(profiles.tokens, 100),
    lifetime_tokens_earned = COALESCE(profiles.lifetime_tokens_earned, 0),
    daily_streak = COALESCE(profiles.daily_streak, 0),
    last_login = COALESCE(profiles.last_login, CURRENT_DATE);

  -- Also initialize token_balances table for backward compatibility
  INSERT INTO public.token_balances (player_id, regular_tokens, lifetime_earned)
  VALUES (user_id, 100, 0)
  ON CONFLICT (player_id) DO UPDATE SET
    regular_tokens = COALESCE(token_balances.regular_tokens, 100),
    lifetime_earned = COALESCE(token_balances.lifetime_earned, 0);
END;
$$;

-- Initialize tokens for existing users who don't have them
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id FROM auth.users 
    WHERE id NOT IN (SELECT id FROM public.profiles WHERE tokens IS NOT NULL)
  LOOP
    PERFORM public.initialize_player_tokens(user_record.id);
  END LOOP;
END $$;