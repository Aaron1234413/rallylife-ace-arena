-- Phase 1: Critical Database Functions (Part 2)

-- Academy progress functions
CREATE OR REPLACE FUNCTION public.initialize_academy_progress(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.academy_progress (player_id)
  VALUES (user_id)
  ON CONFLICT (player_id) DO NOTHING;
END;
$$;

-- Update academy progress
CREATE OR REPLACE FUNCTION public.update_academy_progress(
  user_id UUID,
  xp_gained INTEGER DEFAULT 0,
  tokens_gained INTEGER DEFAULT 0,
  quiz_completed BOOLEAN DEFAULT false
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  progress_record RECORD;
  new_level INTEGER;
  level_up BOOLEAN := false;
  result JSON;
BEGIN
  -- Get current progress
  SELECT * INTO progress_record
  FROM public.academy_progress
  WHERE player_id = user_id;
  
  -- If no record exists, initialize it
  IF progress_record IS NULL THEN
    PERFORM public.initialize_academy_progress(user_id);
    SELECT * INTO progress_record
    FROM public.academy_progress
    WHERE player_id = user_id;
  END IF;
  
  -- Calculate new values
  new_level := FLOOR((progress_record.total_xp + xp_gained) / 100) + 1;
  IF new_level > progress_record.level THEN
    level_up := true;
  END IF;
  
  -- Update progress
  UPDATE public.academy_progress
  SET 
    total_xp = total_xp + xp_gained,
    level = new_level,
    daily_tokens_earned = CASE 
      WHEN DATE(last_activity) = CURRENT_DATE THEN daily_tokens_earned + tokens_gained
      ELSE tokens_gained
    END,
    quizzes_completed = CASE 
      WHEN quiz_completed THEN quizzes_completed + 1 
      ELSE quizzes_completed 
    END,
    last_activity = now(),
    updated_at = now(),
    level_name = CASE
      WHEN new_level >= 20 THEN 'Master'
      WHEN new_level >= 15 THEN 'Expert'
      WHEN new_level >= 10 THEN 'Advanced'
      WHEN new_level >= 5 THEN 'Intermediate'
      ELSE 'Beginner'
    END
  WHERE player_id = user_id;
  
  -- Return result
  result := json_build_object(
    'level_up', level_up,
    'new_level', new_level,
    'xp_gained', xp_gained,
    'tokens_gained', tokens_gained
  );
  
  RETURN result;
END;
$$;

-- Complete academy onboarding
CREATE OR REPLACE FUNCTION public.complete_academy_onboarding(
  user_id UUID,
  starting_level INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.academy_progress (
    player_id, 
    level, 
    is_onboarding_completed, 
    placement_quiz_completed,
    total_xp,
    level_name
  )
  VALUES (
    user_id, 
    starting_level, 
    true, 
    true,
    (starting_level - 1) * 100,
    CASE
      WHEN starting_level >= 20 THEN 'Master'
      WHEN starting_level >= 15 THEN 'Expert'
      WHEN starting_level >= 10 THEN 'Advanced'
      WHEN starting_level >= 5 THEN 'Intermediate'
      ELSE 'Beginner'
    END
  )
  ON CONFLICT (player_id) DO UPDATE SET
    level = starting_level,
    is_onboarding_completed = true,
    placement_quiz_completed = true,
    total_xp = (starting_level - 1) * 100,
    level_name = CASE
      WHEN starting_level >= 20 THEN 'Master'
      WHEN starting_level >= 15 THEN 'Expert'
      WHEN starting_level >= 10 THEN 'Advanced'
      WHEN starting_level >= 5 THEN 'Intermediate'
      ELSE 'Beginner'
    END,
    updated_at = now();
END;
$$;