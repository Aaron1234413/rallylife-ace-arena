
-- Create coach_cxp table for tracking coach experience points and levels
CREATE TABLE public.coach_cxp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_cxp INTEGER NOT NULL DEFAULT 0,
  total_cxp_earned INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  cxp_to_next_level INTEGER NOT NULL DEFAULT 100,
  coaching_tier TEXT NOT NULL DEFAULT 'novice',
  commission_rate NUMERIC NOT NULL DEFAULT 0.15,
  tools_unlocked TEXT[] DEFAULT ARRAY['basic_schedule', 'basic_messaging'],
  certifications_unlocked TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cxp_activities table for tracking CXP earning activities
CREATE TABLE public.cxp_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  cxp_earned INTEGER NOT NULL,
  description TEXT,
  source_player_id UUID REFERENCES public.profiles(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.coach_cxp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cxp_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for coach_cxp
CREATE POLICY "Coaches can view their own CXP"
  ON public.coach_cxp
  FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "System can manage coach CXP"
  ON public.coach_cxp
  FOR ALL
  USING (true);

-- RLS policies for cxp_activities
CREATE POLICY "Coaches can view their own CXP activities"
  ON public.cxp_activities
  FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "System can manage CXP activities"
  ON public.cxp_activities
  FOR ALL
  USING (true);

-- Function to calculate CXP required for a specific level
CREATE OR REPLACE FUNCTION public.calculate_cxp_for_level(level INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Curved progression for coaches: CXP required increases exponentially
  -- Level 1: 0 CXP, Level 2: 100 CXP, Level 3: 275 CXP, etc.
  IF level <= 1 THEN
    RETURN 0;
  END IF;
  
  -- Formula: 75 * level^1.6 + 25 * (level - 1) - more challenging than player XP
  RETURN FLOOR(75 * POWER(level, 1.6) + 25 * (level - 1));
END;
$$;

-- Function to calculate level from total CXP
CREATE OR REPLACE FUNCTION public.calculate_level_from_cxp(total_cxp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  level INTEGER := 1;
  required_cxp INTEGER;
BEGIN
  -- Find the highest level achievable with the given CXP
  WHILE level <= 50 LOOP -- Cap at level 50 for coaches
    required_cxp := public.calculate_cxp_for_level(level + 1);
    IF total_cxp < required_cxp THEN
      EXIT;
    END IF;
    level := level + 1;
  END LOOP;
  
  RETURN level;
END;
$$;

-- Function to initialize coach CXP
CREATE OR REPLACE FUNCTION public.initialize_coach_cxp(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.coach_cxp (coach_id, current_cxp, total_cxp_earned, current_level, cxp_to_next_level)
  VALUES (user_id, 0, 0, 1, 100)
  ON CONFLICT (coach_id) DO NOTHING;
END;
$$;

-- Function to add CXP and handle level progression
CREATE OR REPLACE FUNCTION public.add_cxp(
  user_id UUID, 
  cxp_amount INTEGER, 
  activity_type TEXT, 
  description TEXT DEFAULT NULL,
  source_player_id UUID DEFAULT NULL,
  metadata JSONB DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cxp_record RECORD;
  new_total_cxp INTEGER;
  new_level INTEGER;
  old_level INTEGER;
  current_level_cxp INTEGER;
  next_level_cxp INTEGER;
  current_cxp_in_level INTEGER;
  cxp_to_next INTEGER;
  level_up BOOLEAN := false;
  new_tier TEXT;
  new_commission NUMERIC;
  new_tools TEXT[];
  new_certifications TEXT[];
  result JSON;
BEGIN
  -- Get current CXP status
  SELECT * INTO cxp_record
  FROM public.coach_cxp
  WHERE coach_id = user_id;
  
  -- If no record exists, initialize it
  IF cxp_record IS NULL THEN
    PERFORM public.initialize_coach_cxp(user_id);
    SELECT * INTO cxp_record
    FROM public.coach_cxp
    WHERE coach_id = user_id;
  END IF;
  
  -- Calculate new totals
  old_level := cxp_record.current_level;
  new_total_cxp := cxp_record.total_cxp_earned + cxp_amount;
  new_level := public.calculate_level_from_cxp(new_total_cxp);
  
  -- Check if level up occurred
  IF new_level > old_level THEN
    level_up := true;
  END IF;
  
  -- Calculate current CXP within the level
  current_level_cxp := public.calculate_cxp_for_level(new_level);
  next_level_cxp := public.calculate_cxp_for_level(new_level + 1);
  current_cxp_in_level := new_total_cxp - current_level_cxp;
  cxp_to_next := next_level_cxp - new_total_cxp;
  
  -- Determine coaching tier and benefits based on level
  IF new_level >= 40 THEN
    new_tier := 'master';
    new_commission := 0.35;
    new_tools := ARRAY['basic_schedule', 'basic_messaging', 'advanced_analytics', 'video_analysis', 'performance_tracking', 'custom_drills', 'tournament_prep', 'injury_prevention'];
    new_certifications := ARRAY['master_coach', 'performance_specialist', 'tournament_coach'];
  ELSIF new_level >= 25 THEN
    new_tier := 'expert';
    new_commission := 0.30;
    new_tools := ARRAY['basic_schedule', 'basic_messaging', 'advanced_analytics', 'video_analysis', 'performance_tracking', 'custom_drills'];
    new_certifications := ARRAY['advanced_coach', 'technique_specialist'];
  ELSIF new_level >= 15 THEN
    new_tier := 'advanced';
    new_commission := 0.25;
    new_tools := ARRAY['basic_schedule', 'basic_messaging', 'advanced_analytics', 'video_analysis', 'performance_tracking'];
    new_certifications := ARRAY['certified_coach'];
  ELSIF new_level >= 8 THEN
    new_tier := 'intermediate';
    new_commission := 0.20;
    new_tools := ARRAY['basic_schedule', 'basic_messaging', 'advanced_analytics', 'video_analysis'];
    new_certifications := ARRAY[]::TEXT[];
  ELSIF new_level >= 3 THEN
    new_tier := 'junior';
    new_commission := 0.18;
    new_tools := ARRAY['basic_schedule', 'basic_messaging', 'advanced_analytics'];
    new_certifications := ARRAY[]::TEXT[];
  ELSE
    new_tier := 'novice';
    new_commission := 0.15;
    new_tools := ARRAY['basic_schedule', 'basic_messaging'];
    new_certifications := ARRAY[]::TEXT[];
  END IF;
  
  -- Update CXP record
  UPDATE public.coach_cxp
  SET 
    current_cxp = current_cxp_in_level,
    total_cxp_earned = new_total_cxp,
    current_level = new_level,
    cxp_to_next_level = cxp_to_next,
    coaching_tier = new_tier,
    commission_rate = new_commission,
    tools_unlocked = new_tools,
    certifications_unlocked = new_certifications,
    updated_at = now()
  WHERE coach_id = user_id;
  
  -- Log the CXP gain
  INSERT INTO public.cxp_activities (coach_id, activity_type, cxp_earned, description, source_player_id, metadata)
  VALUES (user_id, activity_type, cxp_amount, 
          COALESCE(description, 'CXP earned from ' || activity_type), 
          source_player_id, metadata);
  
  -- Return result with level up information
  result := json_build_object(
    'cxp_earned', cxp_amount,
    'total_cxp', new_total_cxp,
    'current_level', new_level,
    'level_up', level_up,
    'levels_gained', new_level - old_level,
    'current_cxp_in_level', current_cxp_in_level,
    'cxp_to_next_level', cxp_to_next,
    'coaching_tier', new_tier,
    'commission_rate', new_commission,
    'tools_unlocked', new_tools,
    'certifications_unlocked', new_certifications
  );
  
  RETURN result;
END;
$$;

-- Update the handle_new_user function to initialize CXP for coaches
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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
  
  -- Initialize HP, XP, Tokens, and Avatar for players
  IF COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'player'::public.user_role) = 'player' THEN
    PERFORM public.initialize_player_hp(NEW.id);
    PERFORM public.initialize_player_xp(NEW.id);
    PERFORM public.initialize_player_tokens(NEW.id);
    PERFORM public.initialize_player_avatar(NEW.id);
  END IF;
  
  -- Initialize CRP and CXP for coaches
  IF COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'player'::public.user_role) = 'coach' THEN
    PERFORM public.initialize_coach_crp(NEW.id);
    PERFORM public.initialize_coach_cxp(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;
