
-- Create the complete_meditation_session RPC function
CREATE OR REPLACE FUNCTION public.complete_meditation_session(
  user_id UUID,
  duration_minutes INTEGER,
  session_type TEXT DEFAULT 'guided'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  progress_record RECORD;
  hp_gained INTEGER;
  streak_bonus_applied BOOLEAN := false;
  base_hp INTEGER;
  result JSON;
BEGIN
  -- Calculate base HP gain based on duration
  base_hp := CASE 
    WHEN duration_minutes >= 15 THEN 12
    WHEN duration_minutes >= 10 THEN 8
    WHEN duration_minutes >= 5 THEN 5
    ELSE 3
  END;
  
  hp_gained := base_hp;
  
  -- Get or create meditation progress
  SELECT * INTO progress_record
  FROM public.meditation_progress
  WHERE user_id = complete_meditation_session.user_id;
  
  IF progress_record IS NULL THEN
    INSERT INTO public.meditation_progress (user_id, total_sessions, total_minutes, current_streak, longest_streak)
    VALUES (user_id, 0, 0, 0, 0)
    RETURNING * INTO progress_record;
  END IF;
  
  -- Check if this continues a streak (within 24 hours of last session)
  IF progress_record.last_session_date IS NOT NULL 
     AND progress_record.last_session_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Continue streak
    progress_record.current_streak := progress_record.current_streak + 1;
  ELSIF progress_record.last_session_date = CURRENT_DATE THEN
    -- Same day session, don't break streak but don't increment
    NULL;
  ELSE
    -- Reset streak to 1 (new session)
    progress_record.current_streak := 1;
  END IF;
  
  -- Apply streak bonus for longer streaks
  IF progress_record.current_streak >= 7 THEN
    hp_gained := hp_gained + 3;
    streak_bonus_applied := true;
  ELSIF progress_record.current_streak >= 3 THEN
    hp_gained := hp_gained + 1;
    streak_bonus_applied := true;
  END IF;
  
  -- Update longest streak
  IF progress_record.current_streak > progress_record.longest_streak THEN
    progress_record.longest_streak := progress_record.current_streak;
  END IF;
  
  -- Insert meditation session
  INSERT INTO public.meditation_sessions (user_id, duration_minutes, session_type, hp_gained)
  VALUES (user_id, duration_minutes, session_type, hp_gained)
  RETURNING * INTO session_record;
  
  -- Update progress
  UPDATE public.meditation_progress
  SET 
    total_sessions = total_sessions + 1,
    total_minutes = total_minutes + duration_minutes,
    current_streak = progress_record.current_streak,
    longest_streak = progress_record.longest_streak,
    last_session_date = CURRENT_DATE,
    updated_at = now()
  WHERE user_id = complete_meditation_session.user_id;
  
  -- Restore HP
  PERFORM public.restore_hp(
    user_id, 
    hp_gained, 
    'meditation', 
    'Meditation session: ' || duration_minutes || ' minutes'
  );
  
  -- Get updated progress for return
  SELECT * INTO progress_record
  FROM public.meditation_progress
  WHERE user_id = complete_meditation_session.user_id;
  
  -- Return result
  result := json_build_object(
    'success', true,
    'session_id', session_record.id,
    'hp_gained', hp_gained,
    'total_sessions', progress_record.total_sessions,
    'total_minutes', progress_record.total_minutes,
    'current_streak', progress_record.current_streak,
    'longest_streak', progress_record.longest_streak,
    'streak_bonus_applied', streak_bonus_applied
  );
  
  RETURN result;
END;
$$;

-- Fix the achievements table and add meditation achievements
-- First, add a unique constraint on the name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'achievements_name_key'
  ) THEN
    ALTER TABLE public.achievements ADD CONSTRAINT achievements_name_key UNIQUE (name);
  END IF;
END $$;

-- Now add meditation achievements
INSERT INTO public.achievements (name, description, category, tier, requirement_type, requirement_value, reward_xp, reward_tokens, reward_premium_tokens)
VALUES 
  ('Mindful Beginner', 'Complete your first meditation session', 'meditation', 'bronze', 'meditation_sessions', 1, 25, 10, 0),
  ('Zen Practitioner', 'Complete 10 meditation sessions', 'meditation', 'silver', 'meditation_sessions', 10, 75, 25, 5),
  ('Meditation Master', 'Complete 50 meditation sessions', 'meditation', 'gold', 'meditation_sessions', 50, 200, 75, 15),
  ('Time in Silence', 'Meditate for 100 total minutes', 'meditation', 'silver', 'meditation_minutes', 100, 100, 30, 5),
  ('Hour of Peace', 'Meditate for 1 hour total (60 minutes)', 'meditation', 'bronze', 'meditation_minutes', 60, 50, 20, 0),
  ('Streak Starter', 'Maintain a 3-day meditation streak', 'meditation', 'bronze', 'meditation_streak', 3, 50, 15, 0),
  ('Consistency Champion', 'Maintain a 7-day meditation streak', 'meditation', 'silver', 'meditation_streak', 7, 125, 40, 10),
  ('Mindfulness Master', 'Maintain a 30-day meditation streak', 'meditation', 'platinum', 'meditation_streak', 30, 500, 150, 50)
ON CONFLICT (name) DO NOTHING;
