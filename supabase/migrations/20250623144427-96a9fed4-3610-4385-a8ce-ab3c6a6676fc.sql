
-- First, let's check the existing achievements table structure
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'achievements' AND table_schema = 'public';

-- Check if stretching_progress table exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stretching_progress' AND table_schema = 'public') THEN
    CREATE TABLE public.stretching_progress (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users NOT NULL,
      total_sessions INTEGER NOT NULL DEFAULT 0,
      total_minutes INTEGER NOT NULL DEFAULT 0,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_session_date DATE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      UNIQUE(user_id)
    );
  END IF;
END $$;

-- Create or replace the complete_stretching_session RPC function
CREATE OR REPLACE FUNCTION public.complete_stretching_session(
  user_id UUID,
  routine_id TEXT,
  routine_name TEXT,
  duration_minutes INTEGER,
  difficulty TEXT DEFAULT 'easy'
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
  -- Calculate base HP gain based on duration and difficulty
  base_hp := CASE 
    WHEN difficulty = 'easy' AND duration_minutes >= 10 THEN 8
    WHEN difficulty = 'easy' AND duration_minutes >= 5 THEN 5
    WHEN difficulty = 'medium' AND duration_minutes >= 15 THEN 12
    WHEN difficulty = 'medium' AND duration_minutes >= 8 THEN 8
    WHEN difficulty = 'hard' AND duration_minutes >= 20 THEN 15
    WHEN difficulty = 'hard' AND duration_minutes >= 10 THEN 10
    ELSE 3
  END;
  
  hp_gained := base_hp;
  
  -- Get or create stretching progress
  SELECT * INTO progress_record
  FROM public.stretching_progress
  WHERE user_id = complete_stretching_session.user_id;
  
  IF progress_record IS NULL THEN
    INSERT INTO public.stretching_progress (user_id, total_sessions, total_minutes, current_streak, longest_streak)
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
  
  -- Insert stretching session (assuming existing table structure)
  INSERT INTO public.stretching_sessions (user_id, routine_id, routine_name, duration_minutes, hp_gained, difficulty)
  VALUES (user_id, routine_id, routine_name, duration_minutes, hp_gained, difficulty)
  RETURNING * INTO session_record;
  
  -- Update progress
  UPDATE public.stretching_progress
  SET 
    total_sessions = total_sessions + 1,
    total_minutes = total_minutes + duration_minutes,
    current_streak = progress_record.current_streak,
    longest_streak = progress_record.longest_streak,
    last_session_date = CURRENT_DATE,
    updated_at = now()
  WHERE user_id = complete_stretching_session.user_id;
  
  -- Restore HP using existing function
  PERFORM public.restore_hp(
    user_id, 
    hp_gained, 
    'stretching', 
    'Stretching session: ' || routine_name || ' (' || duration_minutes || ' minutes)'
  );
  
  -- Get updated progress for return
  SELECT * INTO progress_record
  FROM public.stretching_progress
  WHERE user_id = complete_stretching_session.user_id;
  
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

-- Add stretching achievements one by one to avoid conflicts
DO $$
BEGIN
  -- Insert each achievement individually with existence check
  IF NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Flexibility First') THEN
    INSERT INTO public.achievements (name, description, category, tier, requirement_type, requirement_value, reward_xp, reward_tokens, reward_premium_tokens)
    VALUES ('Flexibility First', 'Complete your first stretching session', 'stretching', 'bronze', 'stretching_sessions', 1, 25, 10, 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Stretch Master') THEN
    INSERT INTO public.achievements (name, description, category, tier, requirement_type, requirement_value, reward_xp, reward_tokens, reward_premium_tokens)
    VALUES ('Stretch Master', 'Complete 10 stretching sessions', 'stretching', 'silver', 'stretching_sessions', 10, 75, 25, 5);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Flexibility Expert') THEN
    INSERT INTO public.achievements (name, description, category, tier, requirement_type, requirement_value, reward_xp, reward_tokens, reward_premium_tokens)
    VALUES ('Flexibility Expert', 'Complete 50 stretching sessions', 'stretching', 'gold', 'stretching_sessions', 50, 200, 75, 15);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Time to Stretch') THEN
    INSERT INTO public.achievements (name, description, category, tier, requirement_type, requirement_value, reward_xp, reward_tokens, reward_premium_tokens)
    VALUES ('Time to Stretch', 'Stretch for 60 total minutes', 'stretching', 'bronze', 'stretching_minutes', 60, 50, 20, 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Hour of Flexibility') THEN
    INSERT INTO public.achievements (name, description, category, tier, requirement_type, requirement_value, reward_xp, reward_tokens, reward_premium_tokens)
    VALUES ('Hour of Flexibility', 'Stretch for 300 total minutes (5 hours)', 'stretching', 'silver', 'stretching_minutes', 300, 100, 40, 5);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Stretch Streak') THEN
    INSERT INTO public.achievements (name, description, category, tier, requirement_type, requirement_value, reward_xp, reward_tokens, reward_premium_tokens)
    VALUES ('Stretch Streak', 'Maintain a 3-day stretching streak', 'stretching', 'bronze', 'stretching_streak', 3, 50, 15, 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Flexibility Habit') THEN
    INSERT INTO public.achievements (name, description, category, tier, requirement_type, requirement_value, reward_xp, reward_tokens, reward_premium_tokens)
    VALUES ('Flexibility Habit', 'Maintain a 7-day stretching streak', 'stretching', 'silver', 'stretching_streak', 7, 125, 40, 10);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Flexibility Champion') THEN
    INSERT INTO public.achievements (name, description, category, tier, requirement_type, requirement_value, reward_xp, reward_tokens, reward_premium_tokens)
    VALUES ('Flexibility Champion', 'Maintain a 30-day stretching streak', 'stretching', 'platinum', 'stretching_streak', 30, 500, 150, 50);
  END IF;
END $$;

-- Add RLS policies for stretching tables (only add if they don't exist)
DO $$
BEGIN
  -- Enable RLS on stretching_sessions if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE n.nspname = 'public' AND c.relname = 'stretching_sessions' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.stretching_sessions ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS on stretching_progress if table exists and RLS not enabled
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stretching_progress' AND table_schema = 'public') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c 
      JOIN pg_namespace n ON n.oid = c.relnamespace 
      WHERE n.nspname = 'public' AND c.relname = 'stretching_progress' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.stretching_progress ENABLE ROW LEVEL SECURITY;
    END IF;
  END IF;
END $$;

-- Create policies only if they don't exist
DO $$
BEGIN
  -- Stretching sessions policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stretching_sessions' AND policyname = 'Users can view their own stretching sessions') THEN
    CREATE POLICY "Users can view their own stretching sessions" 
      ON public.stretching_sessions 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stretching_sessions' AND policyname = 'Users can create their own stretching sessions') THEN
    CREATE POLICY "Users can create their own stretching sessions" 
      ON public.stretching_sessions 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Stretching progress policies (only if table exists)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stretching_progress' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stretching_progress' AND policyname = 'Users can view their own stretching progress') THEN
      CREATE POLICY "Users can view their own stretching progress" 
        ON public.stretching_progress 
        FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stretching_progress' AND policyname = 'Users can create their own stretching progress') THEN
      CREATE POLICY "Users can create their own stretching progress" 
        ON public.stretching_progress 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stretching_progress' AND policyname = 'Users can update their own stretching progress') THEN
      CREATE POLICY "Users can update their own stretching progress" 
        ON public.stretching_progress 
        FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
  END IF;
END $$;
