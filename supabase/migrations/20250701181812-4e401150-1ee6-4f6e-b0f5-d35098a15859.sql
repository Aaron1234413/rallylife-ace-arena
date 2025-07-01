-- Phase 1: Critical Database & Function Fixes

-- Create academy_progress table
CREATE TABLE public.academy_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
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

-- Create missing RPC functions

-- Initialize academy progress for new users
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

-- Coach CRP functions
CREATE OR REPLACE FUNCTION public.initialize_coach_crp(coach_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.coach_crp (coach_id)
  VALUES (coach_id)
  ON CONFLICT (coach_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_crp(
  coach_id UUID,
  amount INTEGER,
  activity_type TEXT,
  description TEXT DEFAULT NULL,
  source_player_id UUID DEFAULT NULL,
  metadata JSONB DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  crp_record RECORD;
  new_crp INTEGER;
  new_level TEXT;
  result JSON;
BEGIN
  -- Get current CRP
  SELECT * INTO crp_record
  FROM public.coach_crp
  WHERE coach_crp.coach_id = add_crp.coach_id;
  
  -- If no record exists, initialize it
  IF crp_record IS NULL THEN
    PERFORM public.initialize_coach_crp(add_crp.coach_id);
    SELECT * INTO crp_record
    FROM public.coach_crp
    WHERE coach_crp.coach_id = add_crp.coach_id;
  END IF;
  
  -- Calculate new CRP
  new_crp := crp_record.current_crp + amount;
  
  -- Determine reputation level
  new_level := CASE
    WHEN new_crp >= 1000 THEN 'platinum'
    WHEN new_crp >= 500 THEN 'gold'
    WHEN new_crp >= 250 THEN 'silver'
    ELSE 'bronze'
  END;
  
  -- Update CRP
  UPDATE public.coach_crp
  SET 
    current_crp = new_crp,
    total_crp_earned = total_crp_earned + amount,
    reputation_level = new_level,
    updated_at = now()
  WHERE coach_crp.coach_id = add_crp.coach_id;
  
  -- Log the activity
  INSERT INTO public.crp_activities (
    coach_id, activity_type, crp_change, crp_before, crp_after, 
    description, source_player_id, metadata
  )
  VALUES (
    add_crp.coach_id, activity_type, amount, crp_record.current_crp, new_crp,
    description, source_player_id, metadata
  );
  
  result := json_build_object(
    'crp_added', amount,
    'new_crp', new_crp,
    'new_level', new_level
  );
  
  RETURN result;
END;
$$;

-- Coach CXP functions
CREATE OR REPLACE FUNCTION public.initialize_coach_cxp(coach_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.coach_cxp (coach_id)
  VALUES (coach_id)
  ON CONFLICT (coach_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_cxp(
  coach_id UUID,
  amount INTEGER,
  activity_type TEXT,
  description TEXT DEFAULT NULL,
  source_player_id UUID DEFAULT NULL,
  metadata JSONB DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cxp_record RECORD;
  new_total_cxp INTEGER;
  new_level INTEGER;
  new_tier TEXT;
  level_up BOOLEAN := false;
  result JSON;
BEGIN
  -- Get current CXP
  SELECT * INTO cxp_record
  FROM public.coach_cxp
  WHERE coach_cxp.coach_id = add_cxp.coach_id;
  
  -- If no record exists, initialize it
  IF cxp_record IS NULL THEN
    PERFORM public.initialize_coach_cxp(add_cxp.coach_id);
    SELECT * INTO cxp_record
    FROM public.coach_cxp
    WHERE coach_cxp.coach_id = add_cxp.coach_id;
  END IF;
  
  -- Calculate new totals
  new_total_cxp := cxp_record.total_cxp_earned + amount;
  new_level := FLOOR(new_total_cxp / 100) + 1;
  
  IF new_level > cxp_record.current_level THEN
    level_up := true;
  END IF;
  
  -- Determine coaching tier
  new_tier := CASE
    WHEN new_level >= 20 THEN 'master'
    WHEN new_level >= 15 THEN 'expert'
    WHEN new_level >= 10 THEN 'professional'
    WHEN new_level >= 5 THEN 'intermediate'
    ELSE 'novice'
  END;
  
  -- Update CXP
  UPDATE public.coach_cxp
  SET 
    current_cxp = (new_total_cxp % 100),
    total_cxp_earned = new_total_cxp,
    current_level = new_level,
    cxp_to_next_level = 100 - (new_total_cxp % 100),
    coaching_tier = new_tier,
    commission_rate = LEAST(0.30, 0.15 + (new_level - 1) * 0.01),
    updated_at = now()
  WHERE coach_cxp.coach_id = add_cxp.coach_id;
  
  -- Log the activity
  INSERT INTO public.cxp_activities (
    coach_id, activity_type, cxp_earned, description, source_player_id, metadata
  )
  VALUES (
    add_cxp.coach_id, activity_type, amount, description, source_player_id, metadata
  );
  
  result := json_build_object(
    'cxp_earned', amount,
    'new_total_cxp', new_total_cxp,
    'new_level', new_level,
    'level_up', level_up,
    'new_tier', new_tier
  );
  
  RETURN result;
END;
$$;

-- Coach token functions
CREATE OR REPLACE FUNCTION public.initialize_coach_tokens(coach_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.coach_tokens (coach_id, current_tokens, lifetime_earned)
  VALUES (coach_id, 50, 0) -- Start coaches with 50 tokens
  ON CONFLICT (coach_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_coach_tokens(
  coach_id UUID,
  amount INTEGER,
  source TEXT DEFAULT 'manual',
  description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_record RECORD;
  new_balance INTEGER;
  new_lifetime INTEGER;
  result JSON;
BEGIN
  -- Get current balance
  SELECT * INTO token_record
  FROM public.coach_tokens
  WHERE coach_tokens.coach_id = add_coach_tokens.coach_id;
  
  -- If no record exists, initialize it
  IF token_record IS NULL THEN
    PERFORM public.initialize_coach_tokens(add_coach_tokens.coach_id);
    SELECT * INTO token_record
    FROM public.coach_tokens
    WHERE coach_tokens.coach_id = add_coach_tokens.coach_id;
  END IF;
  
  -- Calculate new balances
  new_balance := token_record.current_tokens + amount;
  new_lifetime := token_record.lifetime_earned + amount;
  
  -- Update tokens
  UPDATE public.coach_tokens
  SET 
    current_tokens = new_balance,
    lifetime_earned = new_lifetime,
    updated_at = now()
  WHERE coach_tokens.coach_id = add_coach_tokens.coach_id;
  
  -- Log transaction
  INSERT INTO public.coach_token_transactions (
    coach_id, transaction_type, amount, balance_before, balance_after, source, description
  )
  VALUES (
    add_coach_tokens.coach_id, 'earn', amount, token_record.current_tokens, new_balance, source, description
  );
  
  result := json_build_object(
    'tokens_added', amount,
    'new_balance', new_balance,
    'lifetime_earned', new_lifetime
  );
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.spend_coach_tokens(
  coach_id UUID,
  amount INTEGER,
  source TEXT DEFAULT 'purchase',
  description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_record RECORD;
  new_balance INTEGER;
  result JSON;
BEGIN
  -- Get current balance
  SELECT * INTO token_record
  FROM public.coach_tokens
  WHERE coach_tokens.coach_id = spend_coach_tokens.coach_id;
  
  -- Check if user has enough tokens
  IF token_record.current_tokens < amount THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient tokens',
      'current_balance', token_record.current_tokens,
      'required', amount
    );
  END IF;
  
  -- Calculate new balance
  new_balance := token_record.current_tokens - amount;
  
  -- Update balance
  UPDATE public.coach_tokens
  SET 
    current_tokens = new_balance,
    updated_at = now()
  WHERE coach_tokens.coach_id = spend_coach_tokens.coach_id;
  
  -- Log transaction
  INSERT INTO public.coach_token_transactions (
    coach_id, transaction_type, amount, balance_before, balance_after, source, description
  )
  VALUES (
    spend_coach_tokens.coach_id, 'spend', amount, token_record.current_tokens, new_balance, source, description
  );
  
  result := json_build_object(
    'success', true,
    'tokens_spent', amount,
    'new_balance', new_balance
  );
  
  RETURN result;
END;
$$;