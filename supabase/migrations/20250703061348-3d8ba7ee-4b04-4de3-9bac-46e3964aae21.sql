-- Enhanced Academy Progress with Check-ins and Streak Bonuses

-- Add new columns to academy_progress table for check-ins and knowledge points
ALTER TABLE public.academy_progress 
ADD COLUMN IF NOT EXISTS last_check_in_date DATE,
ADD COLUMN IF NOT EXISTS consecutive_check_ins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS knowledge_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS knowledge_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_check_ins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_bonus_claimed_for_day INTEGER DEFAULT 0;

-- Create academy check-ins history table
CREATE TABLE IF NOT EXISTS public.academy_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tokens_earned INTEGER DEFAULT 5,
  bonus_tokens INTEGER DEFAULT 0,
  streak_day INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(player_id, check_in_date)
);

-- Enable RLS on academy_check_ins
ALTER TABLE public.academy_check_ins ENABLE ROW LEVEL SECURITY;

-- RLS policies for academy_check_ins
CREATE POLICY "Players can view their own check-ins" 
ON public.academy_check_ins 
FOR SELECT 
USING (player_id = auth.uid());

CREATE POLICY "Players can insert their own check-ins" 
ON public.academy_check_ins 
FOR INSERT 
WITH CHECK (player_id = auth.uid());

-- Create academy milestones table
CREATE TABLE IF NOT EXISTS public.academy_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL,
  milestone_type TEXT NOT NULL,
  milestone_name TEXT NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  tokens_earned INTEGER DEFAULT 0,
  knowledge_points_earned INTEGER DEFAULT 0,
  
  UNIQUE(player_id, milestone_type)
);

-- Enable RLS on academy_milestones
ALTER TABLE public.academy_milestones ENABLE ROW LEVEL SECURITY;

-- RLS policies for academy_milestones
CREATE POLICY "Players can view their own milestones" 
ON public.academy_milestones 
FOR SELECT 
USING (player_id = auth.uid());

CREATE POLICY "Players can insert their own milestones" 
ON public.academy_milestones 
FOR INSERT 
WITH CHECK (player_id = auth.uid());

-- Function to perform daily check-in
CREATE OR REPLACE FUNCTION public.academy_daily_check_in(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  progress_record RECORD;
  check_in_exists BOOLEAN;
  current_streak INTEGER;
  bonus_tokens INTEGER := 0;
  base_tokens INTEGER := 5;
  total_tokens INTEGER;
  knowledge_points INTEGER := 10;
  result JSON;
BEGIN
  -- Check if user already checked in today
  SELECT EXISTS(
    SELECT 1 FROM public.academy_check_ins 
    WHERE player_id = user_id AND check_in_date = CURRENT_DATE
  ) INTO check_in_exists;
  
  IF check_in_exists THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Already checked in today'
    );
  END IF;
  
  -- Get current progress
  SELECT * INTO progress_record
  FROM public.academy_progress
  WHERE player_id = user_id;
  
  -- Calculate current streak
  IF progress_record.last_check_in_date = CURRENT_DATE - INTERVAL '1 day' THEN
    current_streak := progress_record.consecutive_check_ins + 1;
  ELSE
    current_streak := 1;
  END IF;
  
  -- Calculate bonus tokens based on streak
  IF current_streak >= 30 THEN
    bonus_tokens := 25;
  ELSIF current_streak >= 14 THEN
    bonus_tokens := 10;
  ELSIF current_streak >= 7 THEN
    bonus_tokens := 5;
  ELSIF current_streak >= 3 THEN
    bonus_tokens := 2;
  END IF;
  
  total_tokens := base_tokens + bonus_tokens;
  
  -- Insert check-in record
  INSERT INTO public.academy_check_ins (
    player_id, check_in_date, tokens_earned, bonus_tokens, streak_day
  ) VALUES (
    user_id, CURRENT_DATE, base_tokens, bonus_tokens, current_streak
  );
  
  -- Update academy progress
  UPDATE public.academy_progress
  SET 
    last_check_in_date = CURRENT_DATE,
    consecutive_check_ins = current_streak,
    total_check_ins = COALESCE(total_check_ins, 0) + 1,
    knowledge_points = COALESCE(knowledge_points, 0) + knowledge_points,
    knowledge_level = LEAST(20, (COALESCE(knowledge_points, 0) + knowledge_points) / 100 + 1),
    updated_at = now()
  WHERE player_id = user_id;
  
  -- Add tokens to player's main balance
  PERFORM public.add_tokens(
    user_id, 
    total_tokens, 
    'regular', 
    'academy_check_in',
    'Daily Academy check-in reward'
  );
  
  -- Check for milestone achievements
  PERFORM public.check_academy_milestones(user_id);
  
  result := json_build_object(
    'success', true,
    'tokens_earned', total_tokens,
    'base_tokens', base_tokens,
    'bonus_tokens', bonus_tokens,
    'streak_day', current_streak,
    'knowledge_points_earned', knowledge_points
  );
  
  RETURN result;
END;
$$;

-- Function to check and award academy milestones
CREATE OR REPLACE FUNCTION public.check_academy_milestones(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  progress_record RECORD;
  milestone_tokens INTEGER;
  milestone_kp INTEGER;
BEGIN
  -- Get current progress
  SELECT * INTO progress_record
  FROM public.academy_progress
  WHERE player_id = user_id;
  
  -- Check First Quiz milestone
  IF progress_record.quizzes_completed >= 1 THEN
    INSERT INTO public.academy_milestones (
      player_id, milestone_type, milestone_name, tokens_earned, knowledge_points_earned
    ) VALUES (
      user_id, 'first_quiz', 'First Quiz', 10, 25
    ) ON CONFLICT (player_id, milestone_type) DO NOTHING;
    
    IF FOUND THEN
      PERFORM public.add_tokens(user_id, 10, 'regular', 'academy_milestone', 'First Quiz milestone');
      UPDATE public.academy_progress 
      SET knowledge_points = knowledge_points + 25 
      WHERE player_id = user_id;
    END IF;
  END IF;
  
  -- Check Getting Started milestone (5 quizzes)
  IF progress_record.quizzes_completed >= 5 THEN
    INSERT INTO public.academy_milestones (
      player_id, milestone_type, milestone_name, tokens_earned, knowledge_points_earned
    ) VALUES (
      user_id, 'getting_started', 'Getting Started', 25, 50
    ) ON CONFLICT (player_id, milestone_type) DO NOTHING;
    
    IF FOUND THEN
      PERFORM public.add_tokens(user_id, 25, 'regular', 'academy_milestone', 'Getting Started milestone');
      UPDATE public.academy_progress 
      SET knowledge_points = knowledge_points + 50 
      WHERE player_id = user_id;
    END IF;
  END IF;
  
  -- Check Dedicated Learner milestone (10 quizzes)
  IF progress_record.quizzes_completed >= 10 THEN
    INSERT INTO public.academy_milestones (
      player_id, milestone_type, milestone_name, tokens_earned, knowledge_points_earned
    ) VALUES (
      user_id, 'dedicated_learner', 'Dedicated Learner', 50, 100
    ) ON CONFLICT (player_id, milestone_type) DO NOTHING;
    
    IF FOUND THEN
      PERFORM public.add_tokens(user_id, 50, 'regular', 'academy_milestone', 'Dedicated Learner milestone');
      UPDATE public.academy_progress 
      SET knowledge_points = knowledge_points + 100 
      WHERE player_id = user_id;
    END IF;
  END IF;
  
  -- Check Streak Master milestone (7-day streak)
  IF progress_record.consecutive_check_ins >= 7 THEN
    INSERT INTO public.academy_milestones (
      player_id, milestone_type, milestone_name, tokens_earned, knowledge_points_earned
    ) VALUES (
      user_id, 'streak_master', 'Streak Master', 75, 150
    ) ON CONFLICT (player_id, milestone_type) DO NOTHING;
    
    IF FOUND THEN
      PERFORM public.add_tokens(user_id, 75, 'regular', 'academy_milestone', 'Streak Master milestone');
      UPDATE public.academy_progress 
      SET knowledge_points = knowledge_points + 150 
      WHERE player_id = user_id;
    END IF;
  END IF;
END;
$$;

-- Update the existing update_academy_progress function to also check milestones
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
  old_level INTEGER;
  level_up BOOLEAN := false;
  result JSON;
BEGIN
  -- Get current progress
  SELECT * INTO progress_record
  FROM public.academy_progress
  WHERE player_id = user_id;
  
  IF progress_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Progress record not found');
  END IF;
  
  old_level := progress_record.level;
  
  -- Calculate new level based on total XP
  new_level := LEAST(20, (progress_record.total_xp + xp_gained) / 100 + 1);
  
  IF new_level > old_level THEN
    level_up := true;
  END IF;
  
  -- Update progress
  UPDATE public.academy_progress
  SET 
    total_xp = total_xp + xp_gained,
    level = new_level,
    level_name = CASE
      WHEN new_level >= 20 THEN 'Grand Master'
      WHEN new_level >= 15 THEN 'Master'
      WHEN new_level >= 10 THEN 'Expert'
      WHEN new_level >= 5 THEN 'Advanced'
      ELSE 'Beginner'
    END,
    quizzes_completed = CASE WHEN quiz_completed THEN quizzes_completed + 1 ELSE quizzes_completed END,
    knowledge_points = knowledge_points + (xp_gained / 2), -- Knowledge points = half of XP gained
    knowledge_level = LEAST(20, (knowledge_points + (xp_gained / 2)) / 100 + 1),
    updated_at = now()
  WHERE player_id = user_id;
  
  -- Add tokens to main balance if any
  IF tokens_gained > 0 THEN
    PERFORM public.add_tokens(
      user_id, 
      tokens_gained, 
      'regular', 
      'academy_quiz',
      'Academy quiz completion reward'
    );
  END IF;
  
  -- Check for milestone achievements
  PERFORM public.check_academy_milestones(user_id);
  
  result := json_build_object(
    'success', true,
    'level_up', level_up,
    'new_level', new_level,
    'old_level', old_level,
    'xp_gained', xp_gained,
    'tokens_gained', tokens_gained
  );
  
  RETURN result;
END;
$$;