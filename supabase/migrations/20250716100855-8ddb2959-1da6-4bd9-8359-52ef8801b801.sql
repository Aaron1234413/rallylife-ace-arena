-- Add XP and leveling columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN xp INTEGER DEFAULT 0,
  ADD COLUMN level INTEGER DEFAULT 1,
  ADD COLUMN badges JSONB DEFAULT '[]';

-- Create XP activity log table for tracking XP gains
CREATE TABLE public.xp_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  level_before INTEGER DEFAULT 1,
  level_after INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on xp_activities
ALTER TABLE public.xp_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for xp_activities
CREATE POLICY "Users can view their own XP activities" ON public.xp_activities
  FOR SELECT USING (auth.uid() = player_id);

CREATE POLICY "Users can insert their own XP activities" ON public.xp_activities
  FOR INSERT WITH CHECK (auth.uid() = player_id);

-- Create function to calculate XP required for a level
CREATE OR REPLACE FUNCTION public.calculate_xp_for_level(target_level INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Progressive XP curve: Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 250 XP, etc.
  IF target_level <= 1 THEN
    RETURN 0;
  END IF;
  
  -- Formula: 50 * level^1.5 + 50 * (level - 1)
  RETURN FLOOR(50 * POWER(target_level, 1.5) + 50 * (target_level - 1));
END;
$$;

-- Create function to calculate level from total XP
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(total_xp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  level INTEGER := 1;
  required_xp INTEGER;
BEGIN
  -- Find the highest level achievable with the given XP
  WHILE level <= 100 LOOP
    required_xp := public.calculate_xp_for_level(level + 1);
    IF total_xp < required_xp THEN
      EXIT;
    END IF;
    level := level + 1;
  END LOOP;
  
  RETURN level;
END;
$$;

-- Create function to add XP and handle level ups
CREATE OR REPLACE FUNCTION public.add_xp(
  user_id UUID,
  xp_amount INTEGER,
  activity_type TEXT,
  description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_profile RECORD;
  new_total_xp INTEGER;
  new_level INTEGER;
  old_level INTEGER;
  current_level_xp INTEGER;
  next_level_xp INTEGER;
  xp_to_next INTEGER;
  level_up BOOLEAN := false;
  badges_earned TEXT[] := '{}';
  result JSON;
BEGIN
  -- Get current profile data
  SELECT * INTO current_profile
  FROM public.profiles
  WHERE id = user_id;
  
  IF current_profile IS NULL THEN
    RAISE EXCEPTION 'Profile not found for user %', user_id;
  END IF;
  
  -- Calculate new totals
  old_level := current_profile.level;
  new_total_xp := current_profile.xp + xp_amount;
  new_level := public.calculate_level_from_xp(new_total_xp);
  
  -- Check if level up occurred
  IF new_level > old_level THEN
    level_up := true;
    
    -- Award level up badges
    FOR i IN (old_level + 1)..new_level LOOP
      CASE i
        WHEN 5 THEN badges_earned := badges_earned || 'rising_star';
        WHEN 10 THEN badges_earned := badges_earned || 'tennis_pro';
        WHEN 20 THEN badges_earned := badges_earned || 'champion';
        WHEN 50 THEN badges_earned := badges_earned || 'legend';
        ELSE NULL;
      END CASE;
    END LOOP;
  END IF;
  
  -- Calculate XP progress within current level
  current_level_xp := public.calculate_xp_for_level(new_level);
  next_level_xp := public.calculate_xp_for_level(new_level + 1);
  xp_to_next := next_level_xp - new_total_xp;
  
  -- Update profile
  UPDATE public.profiles
  SET 
    xp = new_total_xp,
    level = new_level,
    badges = CASE 
      WHEN array_length(badges_earned, 1) > 0 THEN 
        badges::jsonb || to_jsonb(badges_earned)
      ELSE badges
    END,
    updated_at = now()
  WHERE id = user_id;
  
  -- Log the XP activity
  INSERT INTO public.xp_activities (player_id, activity_type, xp_earned, description, level_before, level_after)
  VALUES (user_id, activity_type, xp_amount, COALESCE(description, 'XP earned from ' || activity_type), old_level, new_level);
  
  -- Return result
  result := json_build_object(
    'xp_earned', xp_amount,
    'total_xp', new_total_xp,
    'current_level', new_level,
    'level_up', level_up,
    'levels_gained', new_level - old_level,
    'xp_to_next_level', xp_to_next,
    'badges_earned', badges_earned
  );
  
  RETURN result;
END;
$$;