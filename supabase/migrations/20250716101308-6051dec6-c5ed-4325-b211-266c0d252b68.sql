-- Add HP system columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hp INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS max_hp INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS last_hp_update TIMESTAMPTZ DEFAULT now();

-- Create function to calculate HP regeneration
CREATE OR REPLACE FUNCTION public.calculate_hp_regen(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record RECORD;
  hours_since_update NUMERIC;
  regen_amount INTEGER;
  new_hp INTEGER;
BEGIN
  -- Get current profile data
  SELECT * INTO profile_record
  FROM public.profiles
  WHERE id = user_id;
  
  IF profile_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate hours since last update
  hours_since_update := EXTRACT(EPOCH FROM (now() - profile_record.last_hp_update)) / 3600;
  
  -- Calculate regeneration: 2 HP per hour
  regen_amount := FLOOR(hours_since_update * 2)::INTEGER;
  
  -- Cap at max HP
  new_hp := LEAST(profile_record.hp + regen_amount, profile_record.max_hp);
  
  -- Update if there's regeneration
  IF regen_amount > 0 THEN
    UPDATE public.profiles
    SET hp = new_hp,
        last_hp_update = now()
    WHERE id = user_id;
  END IF;
  
  RETURN new_hp;
END;
$$;

-- Create function to deduct HP for activities
CREATE OR REPLACE FUNCTION public.deduct_hp(user_id UUID, hours_played NUMERIC)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record RECORD;
  hp_loss INTEGER;
  new_hp INTEGER;
BEGIN
  -- First apply any regeneration
  PERFORM public.calculate_hp_regen(user_id);
  
  -- Get updated profile
  SELECT * INTO profile_record
  FROM public.profiles
  WHERE id = user_id;
  
  IF profile_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate HP loss: min(5 × hours_played, 10)
  hp_loss := LEAST((5 * hours_played)::INTEGER, 10);
  
  -- Apply HP loss
  new_hp := GREATEST(profile_record.hp - hp_loss, 0);
  
  UPDATE public.profiles
  SET hp = new_hp,
      last_hp_update = now()
  WHERE id = user_id;
  
  RETURN new_hp;
END;
$$;

-- Create function for daily login bonus
CREATE OR REPLACE FUNCTION public.daily_login_bonus(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record RECORD;
  last_login_date DATE;
  today DATE;
  new_hp INTEGER;
BEGIN
  -- First apply any regeneration
  PERFORM public.calculate_hp_regen(user_id);
  
  -- Get profile
  SELECT * INTO profile_record
  FROM public.profiles
  WHERE id = user_id;
  
  IF profile_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Check if already got bonus today
  last_login_date := DATE(profile_record.last_hp_update);
  today := CURRENT_DATE;
  
  IF last_login_date < today THEN
    -- Give daily bonus: +5 HP
    new_hp := LEAST(profile_record.hp + 5, profile_record.max_hp);
    
    UPDATE public.profiles
    SET hp = new_hp,
        last_hp_update = now()
    WHERE id = user_id;
    
    RETURN new_hp;
  END IF;
  
  RETURN profile_record.hp;
END;
$$;