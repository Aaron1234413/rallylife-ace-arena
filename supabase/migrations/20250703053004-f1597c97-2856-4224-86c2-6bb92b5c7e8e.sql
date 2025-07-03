-- Fix Academy Progress Level Persistence Issue

-- First, ensure the unique constraint exists on player_id
ALTER TABLE public.academy_progress 
ADD CONSTRAINT IF NOT EXISTS academy_progress_player_id_unique UNIQUE (player_id);

-- Fix the complete_academy_onboarding function to be more robust
CREATE OR REPLACE FUNCTION public.complete_academy_onboarding(
  user_id UUID,
  starting_level INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Use upsert to ensure data is always saved correctly
  INSERT INTO public.academy_progress (
    player_id, 
    level, 
    is_onboarding_completed, 
    placement_quiz_completed,
    total_xp,
    level_name,
    updated_at
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
    END,
    now()
  )
  ON CONFLICT (player_id) DO UPDATE SET
    level = EXCLUDED.level,
    is_onboarding_completed = EXCLUDED.is_onboarding_completed,
    placement_quiz_completed = EXCLUDED.placement_quiz_completed,
    total_xp = EXCLUDED.total_xp,
    level_name = EXCLUDED.level_name,
    updated_at = now();
    
  -- Log the completion for debugging
  RAISE NOTICE 'Academy onboarding completed for user % with level %', user_id, starting_level;
END;
$$;