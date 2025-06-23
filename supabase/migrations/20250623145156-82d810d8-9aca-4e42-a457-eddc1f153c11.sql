
-- Check if stretching_sessions table exists and create/update it with correct structure
DO $$
BEGIN
  -- Drop and recreate stretching_sessions table with correct structure
  DROP TABLE IF EXISTS public.stretching_sessions CASCADE;
  
  CREATE TABLE public.stretching_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    routine_id TEXT NOT NULL,
    routine_name TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'easy',
    hp_gained INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    notes TEXT DEFAULT '',
    completed_stretches JSONB DEFAULT '[]'::jsonb,
    completion_percentage INTEGER NOT NULL DEFAULT 100
  );

  -- Enable RLS
  ALTER TABLE public.stretching_sessions ENABLE ROW LEVEL SECURITY;

  -- Create policies
  CREATE POLICY "Users can view their own stretching sessions" 
    ON public.stretching_sessions 
    FOR SELECT 
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can create their own stretching sessions" 
    ON public.stretching_sessions 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
END $$;

-- Update the complete_stretching_session function to match the new table structure
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
  
  -- Insert stretching session with correct fields
  INSERT INTO public.stretching_sessions (
    user_id, 
    routine_id, 
    routine_name, 
    duration_minutes, 
    difficulty, 
    hp_gained,
    completed_at,
    notes,
    completed_stretches,
    completion_percentage
  )
  VALUES (
    user_id, 
    routine_id, 
    routine_name, 
    duration_minutes, 
    difficulty, 
    hp_gained,
    now(),
    'Completed via app',
    '[]'::jsonb,
    100
  )
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
