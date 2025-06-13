
-- Create XP System table
CREATE TABLE public.player_xp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_xp INTEGER NOT NULL DEFAULT 0,
  total_xp_earned INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure valid values
  CONSTRAINT xp_bounds CHECK (current_xp >= 0 AND total_xp_earned >= 0),
  CONSTRAINT level_bounds CHECK (current_level >= 1 AND current_level <= 100),
  CONSTRAINT xp_to_next_level_bounds CHECK (xp_to_next_level >= 0),
  
  -- One XP record per player
  UNIQUE(player_id)
);

-- Enable RLS
ALTER TABLE public.player_xp ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own XP" 
  ON public.player_xp 
  FOR SELECT 
  USING (auth.uid() = player_id);

CREATE POLICY "Users can update their own XP" 
  ON public.player_xp 
  FOR UPDATE 
  USING (auth.uid() = player_id);

CREATE POLICY "System can insert XP records" 
  ON public.player_xp 
  FOR INSERT 
  WITH CHECK (auth.uid() = player_id);

-- Create XP activity log table
CREATE TABLE public.xp_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  xp_earned INTEGER NOT NULL,
  description TEXT,
  level_before INTEGER NOT NULL,
  level_after INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure valid activity types
  CONSTRAINT valid_xp_activity_type CHECK (activity_type IN ('match', 'training', 'lesson', 'social', 'achievement', 'bonus', 'daily_login'))
);

-- Enable RLS for XP activities
ALTER TABLE public.xp_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own XP activities" 
  ON public.xp_activities 
  FOR SELECT 
  USING (auth.uid() = player_id);

CREATE POLICY "System can insert XP activities" 
  ON public.xp_activities 
  FOR INSERT 
  WITH CHECK (auth.uid() = player_id);

-- Function to calculate required XP for a specific level (curved progression)
CREATE OR REPLACE FUNCTION public.calculate_xp_for_level(level INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Curved progression: XP required increases exponentially
  -- Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, etc.
  IF level <= 1 THEN
    RETURN 0;
  END IF;
  
  -- Formula: 50 * level^1.5 + 50 * (level - 1)
  RETURN FLOOR(50 * POWER(level, 1.5) + 50 * (level - 1));
END;
$$;

-- Function to calculate level from total XP
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

-- Function to initialize XP for new players
CREATE OR REPLACE FUNCTION public.initialize_player_xp(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.player_xp (player_id, current_xp, total_xp_earned, current_level, xp_to_next_level)
  VALUES (user_id, 0, 0, 1, 100)
  ON CONFLICT (player_id) DO NOTHING;
END;
$$;

-- Function to add XP and handle level ups
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
  xp_record RECORD;
  new_total_xp INTEGER;
  new_level INTEGER;
  old_level INTEGER;
  current_level_xp INTEGER;
  next_level_xp INTEGER;
  current_xp_in_level INTEGER;
  xp_to_next INTEGER;
  level_up BOOLEAN := false;
  result JSON;
BEGIN
  -- Get current XP status
  SELECT * INTO xp_record
  FROM public.player_xp
  WHERE player_id = user_id;
  
  -- If no record exists, initialize it
  IF xp_record IS NULL THEN
    PERFORM public.initialize_player_xp(user_id);
    SELECT * INTO xp_record
    FROM public.player_xp
    WHERE player_id = user_id;
  END IF;
  
  -- Calculate new totals
  old_level := xp_record.current_level;
  new_total_xp := xp_record.total_xp_earned + xp_amount;
  new_level := public.calculate_level_from_xp(new_total_xp);
  
  -- Check if level up occurred
  IF new_level > old_level THEN
    level_up := true;
  END IF;
  
  -- Calculate current XP within the level
  current_level_xp := public.calculate_xp_for_level(new_level);
  next_level_xp := public.calculate_xp_for_level(new_level + 1);
  current_xp_in_level := new_total_xp - current_level_xp;
  xp_to_next := next_level_xp - new_total_xp;
  
  -- Update XP record
  UPDATE public.player_xp
  SET 
    current_xp = current_xp_in_level,
    total_xp_earned = new_total_xp,
    current_level = new_level,
    xp_to_next_level = xp_to_next,
    updated_at = now()
  WHERE player_id = user_id;
  
  -- Log the XP gain
  INSERT INTO public.xp_activities (player_id, activity_type, xp_earned, description, level_before, level_after)
  VALUES (user_id, activity_type, xp_amount, 
          COALESCE(description, 'XP earned from ' || activity_type), 
          old_level, new_level);
  
  -- Return result with level up information
  result := json_build_object(
    'xp_earned', xp_amount,
    'total_xp', new_total_xp,
    'current_level', new_level,
    'level_up', level_up,
    'levels_gained', new_level - old_level,
    'current_xp_in_level', current_xp_in_level,
    'xp_to_next_level', xp_to_next
  );
  
  RETURN result;
END;
$$;

-- Update the handle_new_user function to initialize XP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'player'::public.user_role)
  );
  
  -- Initialize HP and XP for players
  IF COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'player'::public.user_role) = 'player' THEN
    PERFORM public.initialize_player_hp(NEW.id);
    PERFORM public.initialize_player_xp(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add indexes for better performance
CREATE INDEX idx_player_xp_player_id ON public.player_xp(player_id);
CREATE INDEX idx_xp_activities_player_id ON public.xp_activities(player_id);
CREATE INDEX idx_xp_activities_created_at ON public.xp_activities(created_at DESC);
