
-- Create training_plans table for coaches to create reusable training plans
CREATE TABLE public.training_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT NOT NULL DEFAULT 'intermediate',
  estimated_duration_minutes INTEGER,
  skills_focus TEXT[],
  equipment_needed TEXT[],
  instructions JSONB,
  is_template BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create player_training_assignments table for assigning training plans to players
CREATE TABLE public.player_training_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  training_plan_id UUID NOT NULL REFERENCES public.training_plans(id) ON DELETE CASCADE,
  assigned_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'assigned',
  completion_percentage INTEGER DEFAULT 0,
  coach_notes TEXT,
  player_feedback TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coaching_challenges table for coach-assigned challenges
CREATE TABLE public.coaching_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_value INTEGER,
  current_progress INTEGER DEFAULT 0,
  reward_xp INTEGER DEFAULT 0,
  reward_tokens INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  assigned_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  coach_notes TEXT,
  player_notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lesson_sessions table for scheduling and tracking lessons
CREATE TABLE public.lesson_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT NOT NULL DEFAULT 'private',
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  hourly_rate NUMERIC,
  total_cost NUMERIC,
  skills_focus TEXT[],
  lesson_plan JSONB,
  coach_notes TEXT,
  player_feedback TEXT,
  rating INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coaching_requests table for players to request coaching
CREATE TABLE public.coaching_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  preferred_date TIMESTAMP WITH TIME ZONE,
  budget_range TEXT,
  skills_focus TEXT[],
  urgency_level TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  response_message TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create progress_reports table for player progress reporting
CREATE TABLE public.progress_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  related_assignment_id UUID,
  related_challenge_id UUID,
  related_session_id UUID,
  metrics JSONB,
  attachments TEXT[],
  coach_response TEXT,
  coach_responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_training_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for training_plans
CREATE POLICY "Coaches can manage their own training plans" ON public.training_plans
  FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "Players can view training plans assigned to them" ON public.training_plans
  FOR SELECT USING (id IN (
    SELECT training_plan_id FROM public.player_training_assignments 
    WHERE player_id = auth.uid()
  ));

-- RLS policies for player_training_assignments
CREATE POLICY "Coaches can manage assignments for their players" ON public.player_training_assignments
  FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "Players can view and update their own assignments" ON public.player_training_assignments
  FOR ALL USING (player_id = auth.uid());

-- RLS policies for coaching_challenges
CREATE POLICY "Coaches can manage challenges for their players" ON public.coaching_challenges
  FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "Players can view and update their own challenges" ON public.coaching_challenges
  FOR ALL USING (player_id = auth.uid());

-- RLS policies for lesson_sessions
CREATE POLICY "Coaches can manage their lesson sessions" ON public.lesson_sessions
  FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "Players can view and update their own lesson sessions" ON public.lesson_sessions
  FOR ALL USING (player_id = auth.uid());

-- RLS policies for coaching_requests
CREATE POLICY "Players can manage their own coaching requests" ON public.coaching_requests
  FOR ALL USING (player_id = auth.uid());
CREATE POLICY "Coaches can view and respond to requests" ON public.coaching_requests
  FOR SELECT USING (coach_id = auth.uid() OR coach_id IS NULL);
CREATE POLICY "Coaches can update requests directed to them" ON public.coaching_requests
  FOR UPDATE USING (coach_id = auth.uid());

-- RLS policies for progress_reports
CREATE POLICY "Players can manage their own progress reports" ON public.progress_reports
  FOR ALL USING (player_id = auth.uid());
CREATE POLICY "Coaches can view and respond to reports from their players" ON public.progress_reports
  FOR ALL USING (coach_id = auth.uid());

-- Function to assign training plan to player
CREATE OR REPLACE FUNCTION public.assign_training_plan(
  player_user_id UUID,
  training_plan_id UUID,
  due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  coach_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  coach_user_id UUID;
  assignment_id UUID;
  result JSON;
BEGIN
  coach_user_id := auth.uid();
  
  -- Verify the training plan belongs to the coach
  IF NOT EXISTS (
    SELECT 1 FROM public.training_plans 
    WHERE id = training_plan_id AND coach_id = coach_user_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Training plan not found or not owned by coach');
  END IF;
  
  -- Create assignment
  INSERT INTO public.player_training_assignments (
    coach_id, player_id, training_plan_id, due_date, coach_notes
  )
  VALUES (coach_user_id, player_user_id, training_plan_id, due_date, coach_notes)
  RETURNING id INTO assignment_id;
  
  -- Award coach CXP for assigning training
  PERFORM public.add_cxp(
    coach_user_id, 
    10, 
    'training_assignment',
    'Assigned training plan to player',
    player_user_id,
    json_build_object('assignment_id', assignment_id)
  );
  
  result := json_build_object(
    'success', true,
    'assignment_id', assignment_id,
    'message', 'Training plan assigned successfully'
  );
  
  RETURN result;
END;
$$;

-- Function to complete training assignment
CREATE OR REPLACE FUNCTION public.complete_training_assignment(
  assignment_id UUID,
  player_feedback TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  assignment_record RECORD;
  training_plan_record RECORD;
  xp_reward INTEGER;
  token_reward INTEGER;
  crp_reward INTEGER;
  result JSON;
BEGIN
  -- Get assignment details
  SELECT * INTO assignment_record
  FROM public.player_training_assignments
  WHERE id = assignment_id AND player_id = auth.uid();
  
  IF assignment_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Assignment not found');
  END IF;
  
  IF assignment_record.status = 'completed' THEN
    RETURN json_build_object('success', false, 'error', 'Assignment already completed');
  END IF;
  
  -- Get training plan details for rewards
  SELECT * INTO training_plan_record
  FROM public.training_plans
  WHERE id = assignment_record.training_plan_id;
  
  -- Calculate rewards based on difficulty and duration
  xp_reward := CASE training_plan_record.difficulty_level
    WHEN 'beginner' THEN 30
    WHEN 'intermediate' THEN 50
    WHEN 'advanced' THEN 75
    WHEN 'expert' THEN 100
    ELSE 40
  END;
  
  token_reward := xp_reward / 2;
  crp_reward := 15; -- Coach gets CRP for successful completion
  
  -- Update assignment
  UPDATE public.player_training_assignments
  SET 
    status = 'completed',
    completion_percentage = 100,
    player_feedback = complete_training_assignment.player_feedback,
    completed_at = now(),
    updated_at = now()
  WHERE id = assignment_id;
  
  -- Award player XP and tokens
  PERFORM public.add_xp(
    assignment_record.player_id,
    xp_reward,
    'training_completion',
    'Completed training: ' || training_plan_record.name
  );
  
  PERFORM public.add_tokens(
    assignment_record.player_id,
    token_reward,
    'regular',
    'training_completion',
    'Training completion reward'
  );
  
  -- Award coach CRP for successful training completion
  PERFORM public.add_crp(
    assignment_record.coach_id,
    crp_reward,
    'training_completion',
    'Player completed training successfully',
    assignment_record.player_id,
    json_build_object('assignment_id', assignment_id)
  );
  
  result := json_build_object(
    'success', true,
    'xp_earned', xp_reward,
    'tokens_earned', token_reward,
    'coach_crp_earned', crp_reward
  );
  
  RETURN result;
END;
$$;

-- Function to create coaching challenge
CREATE OR REPLACE FUNCTION public.create_coaching_challenge(
  player_user_id UUID,
  challenge_type TEXT,
  title TEXT,
  description TEXT,
  target_value INTEGER,
  due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  reward_xp INTEGER DEFAULT 50,
  reward_tokens INTEGER DEFAULT 25
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  coach_user_id UUID;
  challenge_id UUID;
  result JSON;
BEGIN
  coach_user_id := auth.uid();
  
  -- Create challenge
  INSERT INTO public.coaching_challenges (
    coach_id, player_id, challenge_type, title, description,
    target_value, due_date, reward_xp, reward_tokens
  )
  VALUES (
    coach_user_id, player_user_id, challenge_type, title, description,
    target_value, due_date, reward_xp, reward_tokens
  )
  RETURNING id INTO challenge_id;
  
  -- Award coach CXP for creating challenge
  PERFORM public.add_cxp(
    coach_user_id,
    5,
    'challenge_creation',
    'Created challenge for player',
    player_user_id,
    json_build_object('challenge_id', challenge_id)
  );
  
  result := json_build_object(
    'success', true,
    'challenge_id', challenge_id,
    'message', 'Challenge created successfully'
  );
  
  RETURN result;
END;
$$;

-- Function to submit progress report
CREATE OR REPLACE FUNCTION public.submit_progress_report(
  coach_user_id UUID,
  report_type TEXT,
  title TEXT,
  content TEXT,
  related_assignment_id UUID DEFAULT NULL,
  related_challenge_id UUID DEFAULT NULL,
  related_session_id UUID DEFAULT NULL,
  metrics JSONB DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  player_user_id UUID;
  report_id UUID;
  result JSON;
BEGIN
  player_user_id := auth.uid();
  
  -- Create progress report
  INSERT INTO public.progress_reports (
    player_id, coach_id, report_type, title, content,
    related_assignment_id, related_challenge_id, related_session_id, metrics
  )
  VALUES (
    player_user_id, coach_user_id, report_type, title, content,
    related_assignment_id, related_challenge_id, related_session_id, metrics
  )
  RETURNING id INTO report_id;
  
  -- Award player tokens for reporting progress
  PERFORM public.add_tokens(
    player_user_id,
    10,
    'regular',
    'progress_report',
    'Progress report submission reward'
  );
  
  result := json_build_object(
    'success', true,
    'report_id', report_id,
    'tokens_earned', 10
  );
  
  RETURN result;
END;
$$;
