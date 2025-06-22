
-- Update log_comprehensive_activity function to provide coach-level-based benefits for lessons
CREATE OR REPLACE FUNCTION public.log_comprehensive_activity(
  user_id UUID,
  activity_type TEXT,
  activity_category TEXT,
  title TEXT,
  description TEXT DEFAULT NULL,
  duration_minutes INTEGER DEFAULT NULL,
  intensity_level TEXT DEFAULT 'medium',
  location TEXT DEFAULT NULL,
  opponent_name TEXT DEFAULT NULL,
  coach_name TEXT DEFAULT NULL,
  score TEXT DEFAULT NULL,
  result TEXT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  weather_conditions TEXT DEFAULT NULL,
  court_surface TEXT DEFAULT NULL,
  equipment_used TEXT[] DEFAULT NULL,
  skills_practiced TEXT[] DEFAULT NULL,
  energy_before INTEGER DEFAULT NULL,
  energy_after INTEGER DEFAULT NULL,
  enjoyment_rating INTEGER DEFAULT NULL,
  difficulty_rating INTEGER DEFAULT NULL,
  tags TEXT[] DEFAULT NULL,
  is_competitive BOOLEAN DEFAULT FALSE,
  is_official BOOLEAN DEFAULT FALSE,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT NULL,
  coach_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  activity_id UUID;
  xp_amount INTEGER;
  hp_impact INTEGER;
  token_amount INTEGER;
  duration_factor NUMERIC;
  base_duration INTEGER := 60; -- Base duration in minutes
  coach_level INTEGER := 1;
  coach_tier TEXT := 'novice';
  result JSON;
BEGIN
  -- Set default duration if not provided
  IF duration_minutes IS NULL THEN
    duration_minutes := base_duration;
  END IF;
  
  -- Calculate duration factor for scaling
  duration_factor := duration_minutes::NUMERIC / base_duration::NUMERIC;

  -- For lessons, look up coach level and calculate enhanced benefits
  IF activity_type = 'lesson' AND coach_id IS NOT NULL THEN
    -- Get coach level from coach_cxp table
    SELECT current_level, coaching_tier 
    INTO coach_level, coach_tier
    FROM public.coach_cxp 
    WHERE coach_id = log_comprehensive_activity.coach_id;
    
    -- If no coach record found, use defaults
    IF coach_level IS NULL THEN
      coach_level := 1;
      coach_tier := 'novice';
    END IF;
    
    -- Calculate HP restoration and XP based on coach level
    CASE 
      WHEN coach_level >= 40 THEN
        hp_impact := 25; -- Master Coach: +25 HP
        xp_amount := 130; -- Master XP
      WHEN coach_level >= 25 THEN
        hp_impact := 20; -- Expert Coach: +20 HP  
        xp_amount := 110; -- Elite XP
      WHEN coach_level >= 15 THEN
        hp_impact := 15; -- Advanced Coach: +15 HP
        xp_amount := 90;  -- Premium XP
      WHEN coach_level >= 8 THEN
        hp_impact := 12; -- Intermediate Coach: +12 HP
        xp_amount := 75;  -- Higher XP
      WHEN coach_level >= 3 THEN
        hp_impact := 8;  -- Junior Coach: +8 HP
        xp_amount := 60;  -- Enhanced XP
      ELSE
        hp_impact := 5;  -- Novice Coach: +5 HP
        xp_amount := 45;  -- Standard XP
    END CASE;
    
    -- Scale by duration but ensure positive HP impact for lessons
    hp_impact := GREATEST(ROUND(hp_impact * duration_factor), 1);
    xp_amount := GREATEST(ROUND(xp_amount * duration_factor), 1);
    token_amount := ROUND(xp_amount * 0.5);
    
  ELSE
    -- Original logic for non-lesson activities
    CASE intensity_level
      WHEN 'light' THEN
        xp_amount := 25;
        hp_impact := -3;
        token_amount := 12;
      WHEN 'medium' THEN
        xp_amount := 45;
        hp_impact := -5;
        token_amount := 22;
      WHEN 'high' THEN
        xp_amount := 70;
        hp_impact := -8;
        token_amount := 35;
      WHEN 'extreme' THEN
        xp_amount := 100;
        hp_impact := -15;
        token_amount := 50;
      ELSE
        xp_amount := 45;
        hp_impact := -5;
        token_amount := 22;
    END CASE;
    
    -- Scale rewards by duration
    xp_amount := GREATEST(ROUND(xp_amount * duration_factor), 1);
    hp_impact := ROUND(hp_impact * duration_factor);
    token_amount := GREATEST(ROUND(token_amount * duration_factor), 1);
  END IF;

  -- Log the activity
  INSERT INTO public.activity_logs (
    player_id, activity_type, activity_category, title, description,
    duration_minutes, intensity_level, location, opponent_name, coach_name,
    score, result, notes, weather_conditions, court_surface, equipment_used,
    skills_practiced, energy_before, energy_after, enjoyment_rating,
    difficulty_rating, tags, is_competitive, is_official, logged_at,
    xp_earned, hp_impact, metadata
  )
  VALUES (
    user_id, activity_type, activity_category, title, description,
    duration_minutes, intensity_level, location, opponent_name, coach_name,
    score, result, notes, weather_conditions, court_surface, equipment_used,
    skills_practiced, energy_before, energy_after, enjoyment_rating,
    difficulty_rating, tags, is_competitive, is_official, logged_at,
    xp_amount, hp_impact, 
    COALESCE(metadata, '{}'::jsonb) || 
    CASE 
      WHEN activity_type = 'lesson' AND coach_id IS NOT NULL THEN
        jsonb_build_object(
          'coach_id', coach_id,
          'coach_level', coach_level,
          'coach_tier', coach_tier,
          'hp_bonus_from_coach', hp_impact,
          'xp_bonus_from_coach', xp_amount
        )
      ELSE '{}'::jsonb
    END
  )
  RETURNING id INTO activity_id;

  -- Award XP
  PERFORM public.add_xp(user_id, xp_amount, activity_type, 
    CASE 
      WHEN activity_type = 'lesson' THEN
        'Lesson with ' || COALESCE(coach_tier, 'novice') || ' coach (Level ' || coach_level || ')'
      ELSE
        COALESCE(description, 'Activity: ' || title)
    END
  );

  -- Apply HP changes (positive for lessons with coaches, negative for other activities)
  PERFORM public.restore_hp(user_id, hp_impact, activity_type,
    CASE 
      WHEN activity_type = 'lesson' AND hp_impact > 0 THEN
        'HP restored from lesson with Level ' || coach_level || ' coach'
      ELSE
        COALESCE(description, 'HP impact from: ' || title)
    END
  );

  -- Award tokens
  PERFORM public.add_tokens(user_id, token_amount, 'regular', activity_type,
    CASE 
      WHEN activity_type = 'lesson' THEN
        'Token reward from lesson with coach'
      ELSE
        'Token reward from activity'
    END
  );

  -- Award coach CXP for lessons
  IF activity_type = 'lesson' AND coach_id IS NOT NULL THEN
    PERFORM public.add_cxp(
      coach_id,
      CASE 
        WHEN duration_minutes >= 90 THEN 15
        WHEN duration_minutes >= 60 THEN 10
        ELSE 5
      END,
      'lesson_completion',
      'Completed lesson with player',
      user_id,
      jsonb_build_object('lesson_duration', duration_minutes, 'student_id', user_id)
    );
  END IF;

  -- Return comprehensive result
  result := json_build_object(
    'success', true,
    'activity_id', activity_id,
    'xp_earned', xp_amount,
    'hp_impact', hp_impact,
    'tokens_earned', token_amount,
    'coach_level_bonus', activity_type = 'lesson' AND coach_id IS NOT NULL,
    'coach_level', CASE WHEN activity_type = 'lesson' AND coach_id IS NOT NULL THEN coach_level ELSE null END,
    'coach_tier', CASE WHEN activity_type = 'lesson' AND coach_id IS NOT NULL THEN coach_tier ELSE null END
  );

  RETURN result;
END;
$$;
