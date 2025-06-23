
-- Create meditation_sessions table
CREATE TABLE public.meditation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  hp_gained INTEGER NOT NULL DEFAULT 0,
  session_type TEXT NOT NULL DEFAULT 'guided',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meditation_progress table for streak tracking
CREATE TABLE public.meditation_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_minutes INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_session_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stretching_routines table (master data)
CREATE TABLE public.stretching_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'post_match', 'morning', 'pre_match'
  duration_minutes INTEGER NOT NULL,
  hp_reward INTEGER NOT NULL DEFAULT 5,
  stretches_data JSONB NOT NULL, -- Array of stretch objects with name, duration, instructions
  difficulty_level TEXT NOT NULL DEFAULT 'beginner',
  focus_areas TEXT[] NOT NULL DEFAULT '{}', -- ['shoulders', 'wrists', 'legs', etc.]
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stretching_sessions table
CREATE TABLE public.stretching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  routine_id UUID NOT NULL REFERENCES public.stretching_routines(id),
  completed_stretches JSONB NOT NULL DEFAULT '[]', -- Array of completed stretch IDs
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  hp_gained INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert pre-built stretching routines
INSERT INTO public.stretching_routines (name, description, category, duration_minutes, hp_reward, stretches_data, difficulty_level, focus_areas) VALUES
(
  'Post-Match Recovery',
  'Essential stretches to help your body recover after an intense tennis match',
  'post_match',
  15,
  8,
  '[
    {"id": "shoulder_circles", "name": "Shoulder Circles", "duration": 60, "instructions": "Slowly roll shoulders forward 10 times, then backward 10 times"},
    {"id": "wrist_stretches", "name": "Wrist Stretches", "duration": 90, "instructions": "Extend arm forward, pull fingers back gently for 30 seconds each hand"},
    {"id": "hip_flexors", "name": "Hip Flexor Stretch", "duration": 120, "instructions": "Step into lunge position, hold for 60 seconds each leg"},
    {"id": "calf_stretch", "name": "Calf Stretch", "duration": 90, "instructions": "Against wall, step back and stretch each calf for 45 seconds"},
    {"id": "quad_stretch", "name": "Quad Stretch", "duration": 90, "instructions": "Pull heel to glute, hold for 45 seconds each leg"},
    {"id": "spinal_twist", "name": "Seated Spinal Twist", "duration": 90, "instructions": "Sit and twist spine gently, hold 45 seconds each side"}
  ]'::jsonb,
  'beginner',
  '{"shoulders", "wrists", "hips", "legs", "spine"}'
),
(
  'Morning Mobility',
  'Wake up your body with this gentle full-body mobility routine',
  'morning',
  10,
  6,
  '[
    {"id": "neck_rolls", "name": "Neck Rolls", "duration": 45, "instructions": "Slowly roll head in circles, 5 each direction"},
    {"id": "arm_circles", "name": "Arm Circles", "duration": 60, "instructions": "Large arm circles forward and backward, 10 each direction"},
    {"id": "torso_twist", "name": "Standing Torso Twist", "duration": 60, "instructions": "Hands on hips, twist gently side to side"},
    {"id": "leg_swings", "name": "Leg Swings", "duration": 90, "instructions": "Hold wall, swing each leg forward/back and side to side"},
    {"id": "ankle_circles", "name": "Ankle Circles", "duration": 45, "instructions": "Rotate ankles clockwise and counterclockwise"}
  ]'::jsonb,
  'beginner', 
  '{"neck", "shoulders", "torso", "legs", "ankles"}'
),
(
  'Court Prep',
  'Dynamic warm-up stretches to prepare your body for tennis',
  'pre_match',
  8,
  5,
  '[
    {"id": "dynamic_lunges", "name": "Dynamic Lunges", "duration": 90, "instructions": "Step forward into lunge, alternate legs continuously"},
    {"id": "leg_kicks", "name": "High Leg Kicks", "duration": 60, "instructions": "Kick legs up toward hands, alternate legs"},
    {"id": "arm_swings", "name": "Cross-body Arm Swings", "duration": 60, "instructions": "Swing arms across body to warm shoulders"},
    {"id": "side_shuffles", "name": "Side Shuffle Stretch", "duration": 90, "instructions": "Side shuffle with reaching stretch overhead"},
    {"id": "tennis_swings", "name": "Shadow Tennis Swings", "duration": 60, "instructions": "Practice forehand and backhand motions slowly"}
  ]'::jsonb,
  'intermediate',
  '{"legs", "shoulders", "core", "tennis_specific"}'
);

-- Create RPC function for completing meditation sessions
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
  hp_gained INTEGER;
  progress_record RECORD;
  new_streak INTEGER := 0;
  is_new_day BOOLEAN := false;
  session_id UUID;
  result JSON;
BEGIN
  -- Calculate HP based on duration
  hp_gained := CASE 
    WHEN duration_minutes <= 5 THEN 5
    WHEN duration_minutes <= 10 THEN 8
    WHEN duration_minutes <= 15 THEN 12
    ELSE 15
  END;
  
  -- Insert meditation session
  INSERT INTO public.meditation_sessions (user_id, duration_minutes, hp_gained, session_type)
  VALUES (user_id, duration_minutes, hp_gained, session_type)
  RETURNING id INTO session_id;
  
  -- Get or create meditation progress
  SELECT * INTO progress_record
  FROM public.meditation_progress
  WHERE meditation_progress.user_id = complete_meditation_session.user_id;
  
  IF progress_record IS NULL THEN
    INSERT INTO public.meditation_progress (user_id, total_sessions, total_minutes, current_streak, longest_streak, last_session_date)
    VALUES (user_id, 0, 0, 0, 0, NULL)
    RETURNING * INTO progress_record;
  END IF;
  
  -- Check if this is a new day for streak calculation
  IF progress_record.last_session_date IS NULL OR progress_record.last_session_date < CURRENT_DATE THEN
    is_new_day := true;
    
    -- Calculate streak
    IF progress_record.last_session_date = CURRENT_DATE - INTERVAL '1 day' THEN
      new_streak := progress_record.current_streak + 1;
    ELSE
      new_streak := 1;
    END IF;
  ELSE
    new_streak := progress_record.current_streak;
  END IF;
  
  -- Update meditation progress
  UPDATE public.meditation_progress
  SET 
    total_sessions = total_sessions + 1,
    total_minutes = total_minutes + duration_minutes,
    current_streak = new_streak,
    longest_streak = GREATEST(longest_streak, new_streak),
    last_session_date = CASE WHEN is_new_day THEN CURRENT_DATE ELSE last_session_date END,
    updated_at = now()
  WHERE meditation_progress.user_id = complete_meditation_session.user_id;
  
  -- Apply HP gain with streak multiplier
  IF new_streak >= 7 THEN
    hp_gained := ROUND(hp_gained * 1.5); -- 50% bonus for 7+ day streak
  ELSIF new_streak >= 3 THEN
    hp_gained := ROUND(hp_gained * 1.2); -- 20% bonus for 3+ day streak
  END IF;
  
  -- Restore HP
  PERFORM public.restore_hp(user_id, hp_gained, 'meditation', 
    'Meditation session (' || duration_minutes || ' minutes)');
  
  -- Return result
  result := json_build_object(
    'success', true,
    'session_id', session_id,
    'hp_gained', hp_gained,
    'total_sessions', progress_record.total_sessions + 1,
    'total_minutes', progress_record.total_minutes + duration_minutes,
    'current_streak', new_streak,
    'longest_streak', GREATEST(progress_record.longest_streak, new_streak),
    'streak_bonus_applied', new_streak >= 3
  );
  
  RETURN result;
END;
$$;

-- Create RPC function for completing stretching sessions
CREATE OR REPLACE FUNCTION public.complete_stretching_session(
  user_id UUID,
  routine_id UUID,
  completed_stretches JSONB,
  notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  routine_record RECORD;
  total_stretches INTEGER;
  completed_count INTEGER;
  completion_percentage INTEGER;
  hp_gained INTEGER;
  session_id UUID;
  result JSON;
BEGIN
  -- Get routine details
  SELECT * INTO routine_record
  FROM public.stretching_routines
  WHERE id = routine_id AND is_active = true;
  
  IF routine_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Routine not found');
  END IF;
  
  -- Calculate completion percentage
  total_stretches := jsonb_array_length(routine_record.stretches_data);
  completed_count := jsonb_array_length(completed_stretches);
  completion_percentage := ROUND((completed_count::DECIMAL / total_stretches) * 100);
  
  -- Calculate HP gained based on completion percentage
  hp_gained := ROUND((routine_record.hp_reward * completion_percentage) / 100.0);
  
  -- Insert stretching session
  INSERT INTO public.stretching_sessions (
    user_id, routine_id, completed_stretches, completion_percentage, hp_gained, notes
  )
  VALUES (user_id, routine_id, completed_stretches, completion_percentage, hp_gained, notes)
  RETURNING id INTO session_id;
  
  -- Restore HP if any gained
  IF hp_gained > 0 THEN
    PERFORM public.restore_hp(user_id, hp_gained, 'stretching', 
      'Stretching: ' || routine_record.name || ' (' || completion_percentage || '% complete)');
  END IF;
  
  -- Return result
  result := json_build_object(
    'success', true,
    'session_id', session_id,
    'routine_name', routine_record.name,
    'completion_percentage', completion_percentage,
    'hp_gained', hp_gained,
    'total_stretches', total_stretches,
    'completed_stretches', completed_count
  );
  
  RETURN result;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_meditation_sessions_user_date ON public.meditation_sessions(user_id, completed_at);
CREATE INDEX idx_meditation_progress_user ON public.meditation_progress(user_id);
CREATE INDEX idx_stretching_sessions_user_date ON public.stretching_sessions(user_id, completed_at);
CREATE INDEX idx_stretching_sessions_routine ON public.stretching_sessions(routine_id);

-- Add RLS policies
ALTER TABLE public.meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meditation_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stretching_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stretching_sessions ENABLE ROW LEVEL SECURITY;

-- Meditation sessions policies
CREATE POLICY "Users can view own meditation sessions" ON public.meditation_sessions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own meditation sessions" ON public.meditation_sessions  
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Meditation progress policies
CREATE POLICY "Users can view own meditation progress" ON public.meditation_progress
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own meditation progress" ON public.meditation_progress
  FOR ALL USING (user_id = auth.uid());

-- Stretching routines policies (public read)
CREATE POLICY "Anyone can view active stretching routines" ON public.stretching_routines
  FOR SELECT USING (is_active = true);

-- Stretching sessions policies  
CREATE POLICY "Users can view own stretching sessions" ON public.stretching_sessions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own stretching sessions" ON public.stretching_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());
