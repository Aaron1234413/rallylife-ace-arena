-- Phase 1: Critical Database & Function Fixes (Part 1 - Tables and basic functions)

-- Create academy_progress table
CREATE TABLE public.academy_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL UNIQUE,
  level INTEGER NOT NULL DEFAULT 1,
  total_xp INTEGER NOT NULL DEFAULT 0,
  quizzes_completed INTEGER NOT NULL DEFAULT 0,
  daily_streak INTEGER NOT NULL DEFAULT 0,
  daily_tokens_earned INTEGER NOT NULL DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  level_name TEXT NOT NULL DEFAULT 'Beginner',
  is_onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  placement_quiz_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_attempts table
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
  category TEXT NOT NULL,
  quiz_type TEXT NOT NULL DEFAULT 'practice',
  questions_total INTEGER NOT NULL,
  questions_correct INTEGER NOT NULL DEFAULT 0,
  score_percentage NUMERIC NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER,
  tokens_earned INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  hints_used INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_results table  
CREATE TABLE public.quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  selected_answer INTEGER,
  correct_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds INTEGER,
  hints_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hint_purchases table
CREATE TABLE public.hint_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
  question_id TEXT NOT NULL,
  hint_type TEXT NOT NULL,
  cost_tokens INTEGER NOT NULL DEFAULT 1,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.academy_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hint_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for academy_progress
CREATE POLICY "Players can view their own academy progress" 
ON public.academy_progress FOR SELECT 
USING (player_id = auth.uid());

CREATE POLICY "Players can insert their own academy progress" 
ON public.academy_progress FOR INSERT 
WITH CHECK (player_id = auth.uid());

CREATE POLICY "Players can update their own academy progress" 
ON public.academy_progress FOR UPDATE 
USING (player_id = auth.uid());

-- RLS Policies for quiz_attempts
CREATE POLICY "Players can view their own quiz attempts" 
ON public.quiz_attempts FOR SELECT 
USING (player_id = auth.uid());

CREATE POLICY "Players can insert their own quiz attempts" 
ON public.quiz_attempts FOR INSERT 
WITH CHECK (player_id = auth.uid());

-- RLS Policies for quiz_results
CREATE POLICY "Players can view their own quiz results" 
ON public.quiz_results FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.quiz_attempts qa 
  WHERE qa.id = quiz_results.attempt_id AND qa.player_id = auth.uid()
));

CREATE POLICY "Players can insert their own quiz results" 
ON public.quiz_results FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.quiz_attempts qa 
  WHERE qa.id = quiz_results.attempt_id AND qa.player_id = auth.uid()
));

-- RLS Policies for hint_purchases
CREATE POLICY "Players can view their own hint purchases" 
ON public.hint_purchases FOR SELECT 
USING (player_id = auth.uid());

CREATE POLICY "Players can insert their own hint purchases" 
ON public.hint_purchases FOR INSERT 
WITH CHECK (player_id = auth.uid());