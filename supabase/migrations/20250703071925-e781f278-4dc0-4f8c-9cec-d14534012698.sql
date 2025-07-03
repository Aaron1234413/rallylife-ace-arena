-- Phase 4 Database Updates: Enhanced Quiz System with Level-Based Difficulty and Percentage Token Rewards

-- Create or replace the academy quiz completion function with enhanced logic
CREATE OR REPLACE FUNCTION public.complete_academy_quiz(
  user_id_param UUID,
  correct_answers INTEGER,
  total_questions INTEGER DEFAULT 10,
  player_level INTEGER DEFAULT 1
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tokens_earned INTEGER;
  xp_earned INTEGER;
  percentage NUMERIC;
  daily_limit INTEGER := 10;
  current_daily_tokens INTEGER;
  result JSON;
BEGIN
  -- Validate input
  IF user_id_param IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not authenticated');
  END IF;
  
  IF correct_answers < 0 OR correct_answers > total_questions THEN
    RETURN json_build_object('success', false, 'error', 'Invalid quiz results');
  END IF;
  
  -- Get current daily tokens earned
  SELECT daily_tokens_earned INTO current_daily_tokens
  FROM public.academy_progress
  WHERE player_id = user_id_param;
  
  -- Check if daily limit reached
  IF current_daily_tokens >= daily_limit THEN
    RETURN json_build_object('success', false, 'error', 'Daily token limit reached');
  END IF;
  
  -- Calculate percentage and tokens using the new formula: Math.ceil((correct/10) * 5)
  percentage := correct_answers::NUMERIC / total_questions::NUMERIC;
  tokens_earned := LEAST(CEILING(percentage * 5), 5); -- Cap at 5 tokens
  xp_earned := correct_answers * 10; -- 10 XP per correct answer
  
  -- Ensure we don't exceed daily limit
  tokens_earned := LEAST(tokens_earned, daily_limit - current_daily_tokens);
  
  -- Award tokens
  PERFORM public.add_tokens(
    user_id_param,
    tokens_earned,
    'regular',
    'academy_quiz',
    'Quiz completed: ' || correct_answers || '/' || total_questions || ' correct (' || ROUND(percentage * 100) || '%)'
  );
  
  -- Award XP
  PERFORM public.add_xp(
    user_id_param,
    xp_earned,
    'academy_quiz',
    'Quiz XP reward'
  );
  
  -- Update academy progress
  UPDATE public.academy_progress
  SET 
    daily_tokens_earned = daily_tokens_earned + tokens_earned,
    quizzes_completed = quizzes_completed + 1,
    total_xp = total_xp + xp_earned,
    last_activity = now(),
    updated_at = now()
  WHERE player_id = user_id_param;
  
  result := json_build_object(
    'success', true,
    'tokens_earned', tokens_earned,
    'xp_earned', xp_earned,
    'percentage', ROUND(percentage * 100),
    'correct_answers', correct_answers,
    'total_questions', total_questions,
    'player_level', player_level
  );
  
  RETURN result;
END;
$$;

-- Create function to get level-appropriate quiz difficulty
CREATE OR REPLACE FUNCTION public.get_quiz_difficulty_for_level(player_level INTEGER)
RETURNS TEXT[]
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Level-based difficulty selection
  IF player_level >= 7 THEN
    RETURN ARRAY['medium', 'hard']; -- Advanced
  ELSIF player_level >= 4 THEN
    RETURN ARRAY['easy', 'medium', 'hard']; -- Intermediate  
  ELSE
    RETURN ARRAY['easy', 'medium']; -- Beginner (levels 1-3)
  END IF;
END;
$$;

-- Create function to start academy quiz with level-based difficulty
CREATE OR REPLACE FUNCTION public.start_academy_quiz(
  user_id_param UUID,
  topic_id TEXT DEFAULT 'general'
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  player_level INTEGER;
  difficulty_levels TEXT[];
  daily_tokens INTEGER;
  daily_limit INTEGER := 10;
  result JSON;
BEGIN
  -- Get player's current level and daily tokens
  SELECT level, daily_tokens_earned INTO player_level, daily_tokens
  FROM public.academy_progress
  WHERE player_id = user_id_param;
  
  -- Check if daily limit reached
  IF daily_tokens >= daily_limit THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Daily quiz limit reached',
      'daily_tokens', daily_tokens,
      'daily_limit', daily_limit
    );
  END IF;
  
  -- Get appropriate difficulty levels for player
  difficulty_levels := public.get_quiz_difficulty_for_level(player_level);
  
  result := json_build_object(
    'success', true,
    'player_level', player_level,
    'difficulty_levels', difficulty_levels,
    'topic_id', topic_id,
    'remaining_tokens', daily_limit - daily_tokens,
    'daily_tokens', daily_tokens
  );
  
  RETURN result;
END;
$$;