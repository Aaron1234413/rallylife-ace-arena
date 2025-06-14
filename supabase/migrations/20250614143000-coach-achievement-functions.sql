
-- Function to check and update coach achievement progress
CREATE OR REPLACE FUNCTION public.check_coach_achievement_progress(
  user_id UUID,
  achievement_id UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_record RECORD;
  progress_record RECORD;
  coach_cxp_record RECORD;
  coach_tokens_record RECORD;
  current_value INTEGER := 0;
  is_unlocked BOOLEAN := false;
  result JSON;
BEGIN
  -- Get achievement details
  SELECT * INTO achievement_record
  FROM public.coach_achievements
  WHERE id = achievement_id AND is_active = true;
  
  IF achievement_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Achievement not found');
  END IF;
  
  -- Check if already unlocked
  IF EXISTS (SELECT 1 FROM public.coach_achievements_unlocked WHERE coach_id = user_id AND achievement_id = achievement_id) THEN
    RETURN json_build_object('success', false, 'error', 'Achievement already unlocked');
  END IF;
  
  -- Determine current progress based on requirement type
  CASE achievement_record.requirement_type
    WHEN 'cxp_total' THEN
      SELECT total_cxp_earned INTO current_value
      FROM public.coach_cxp
      WHERE coach_id = user_id;
    WHEN 'level_reached' THEN
      SELECT current_level INTO current_value
      FROM public.coach_cxp
      WHERE coach_id = user_id;
    WHEN 'tokens_earned' THEN
      SELECT lifetime_earned INTO current_value
      FROM public.coach_tokens
      WHERE coach_id = user_id;
    WHEN 'crp_total' THEN
      SELECT total_crp_earned INTO current_value
      FROM public.coach_crp
      WHERE coach_id = user_id;
    ELSE
      current_value := 0;
  END CASE;
  
  current_value := COALESCE(current_value, 0);
  
  -- Update progress
  INSERT INTO public.coach_achievement_progress (coach_id, achievement_id, current_progress)
  VALUES (user_id, achievement_id, current_value)
  ON CONFLICT (coach_id, achievement_id) 
  DO UPDATE SET 
    current_progress = current_value,
    last_updated = now();
  
  -- Check if achievement is unlocked
  IF current_value >= achievement_record.requirement_value THEN
    is_unlocked := true;
    
    -- Add to unlocked achievements
    INSERT INTO public.coach_achievements_unlocked (coach_id, achievement_id)
    VALUES (user_id, achievement_id);
  END IF;
  
  result := json_build_object(
    'success', true,
    'unlocked', is_unlocked,
    'current_progress', current_value,
    'required_progress', achievement_record.requirement_value,
    'achievement_name', achievement_record.name,
    'achievement_tier', achievement_record.tier
  );
  
  RETURN result;
END;
$$;

-- Function to claim achievement rewards
CREATE OR REPLACE FUNCTION public.claim_coach_achievement_reward(
  user_id UUID,
  achievement_id UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_record RECORD;
  unlocked_record RECORD;
  result JSON;
  cxp_result JSON;
  token_result JSON;
BEGIN
  -- Get achievement and unlocked records
  SELECT a.*, ua.is_claimed, ua.unlocked_at
  INTO achievement_record
  FROM public.coach_achievements a
  JOIN public.coach_achievements_unlocked ua ON a.id = ua.achievement_id
  WHERE a.id = achievement_id AND ua.coach_id = user_id;
  
  IF achievement_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Achievement not found or not unlocked');
  END IF;
  
  IF achievement_record.is_claimed THEN
    RETURN json_build_object('success', false, 'error', 'Rewards already claimed');
  END IF;
  
  -- Grant CXP reward
  IF achievement_record.reward_cxp > 0 THEN
    SELECT public.add_cxp(
      user_id, 
      achievement_record.reward_cxp, 
      'achievement',
      'Achievement reward: ' || achievement_record.name
    ) INTO cxp_result;
  END IF;
  
  -- Grant token rewards
  IF achievement_record.reward_tokens > 0 THEN
    SELECT public.add_coach_tokens(
      user_id, 
      achievement_record.reward_tokens, 
      'achievement',
      'Achievement reward: ' || achievement_record.name
    ) INTO token_result;
  END IF;
  
  -- Mark as claimed
  UPDATE public.coach_achievements_unlocked
  SET is_claimed = true, claimed_at = now()
  WHERE coach_id = user_id AND achievement_id = achievement_id;
  
  result := json_build_object(
    'success', true,
    'achievement_name', achievement_record.name,
    'cxp_earned', COALESCE(achievement_record.reward_cxp, 0),
    'tokens_earned', COALESCE(achievement_record.reward_tokens, 0),
    'special_reward', achievement_record.reward_special
  );
  
  RETURN result;
END;
$$;

-- Function to check all coach achievements for a user
CREATE OR REPLACE FUNCTION public.check_all_coach_achievements(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_record RECORD;
  check_result JSON;
  results JSON[] := '{}';
  unlocked_count INTEGER := 0;
BEGIN
  -- Check each active achievement
  FOR achievement_record IN 
    SELECT id FROM public.coach_achievements WHERE is_active = true
  LOOP
    SELECT public.check_coach_achievement_progress(user_id, achievement_record.id) INTO check_result;
    results := array_append(results, check_result);
    
    IF (check_result->>'unlocked')::boolean THEN
      unlocked_count := unlocked_count + 1;
    END IF;
  END LOOP;
  
  RETURN json_build_object(
    'success', true,
    'total_checked', array_length(results, 1),
    'newly_unlocked', unlocked_count,
    'results', results
  );
END;
$$;

-- Insert some default coach achievements
INSERT INTO public.coach_achievements (name, description, category, tier, requirement_type, requirement_value, reward_cxp, reward_tokens) VALUES
  ('Coaching Rookie', 'Reach CXP level 2', 'progression', 'bronze', 'level_reached', 2, 50, 25),
  ('Skilled Coach', 'Reach CXP level 5', 'progression', 'silver', 'level_reached', 5, 100, 50),
  ('Expert Coach', 'Reach CXP level 10', 'progression', 'gold', 'level_reached', 10, 200, 100),
  ('Master Coach', 'Reach CXP level 20', 'progression', 'platinum', 'level_reached', 20, 500, 250),
  ('CXP Collector', 'Earn 1000 total CXP', 'progression', 'bronze', 'cxp_total', 1000, 75, 40),
  ('CXP Master', 'Earn 5000 total CXP', 'progression', 'silver', 'cxp_total', 5000, 150, 75),
  ('Token Earner', 'Earn 500 CTK lifetime', 'progression', 'bronze', 'tokens_earned', 500, 100, 0),
  ('Token Collector', 'Earn 2000 CTK lifetime', 'progression', 'silver', 'tokens_earned', 2000, 200, 0),
  ('Reputation Builder', 'Earn 500 total CRP', 'coaching', 'bronze', 'crp_total', 500, 75, 30),
  ('Respected Coach', 'Earn 2000 total CRP', 'coaching', 'silver', 'crp_total', 2000, 150, 75)
ON CONFLICT DO NOTHING;
