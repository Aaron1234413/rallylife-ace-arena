
-- Fix the ambiguous column reference in check_achievement_unlock function
CREATE OR REPLACE FUNCTION public.check_achievement_unlock(user_id UUID, achievement_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_record RECORD;
  progress_record RECORD;
  player_xp_record RECORD;
  player_tokens_record RECORD;
  player_hp_record RECORD;
  current_value INTEGER := 0;
  is_unlocked BOOLEAN := false;
  result JSON;
BEGIN
  -- Get achievement details
  SELECT * INTO achievement_record
  FROM public.achievements a
  WHERE a.id = check_achievement_unlock.achievement_id AND a.is_active = true;
  
  IF achievement_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Achievement not found');
  END IF;
  
  -- Check if already unlocked
  IF EXISTS (SELECT 1 FROM public.player_achievements pa WHERE pa.player_id = check_achievement_unlock.user_id AND pa.achievement_id = check_achievement_unlock.achievement_id) THEN
    RETURN json_build_object('success', false, 'error', 'Achievement already unlocked');
  END IF;
  
  -- Determine current progress based on requirement type
  CASE achievement_record.requirement_type
    WHEN 'xp_total' THEN
      SELECT total_xp_earned INTO current_value
      FROM public.player_xp
      WHERE player_id = check_achievement_unlock.user_id;
    WHEN 'level_reached' THEN
      SELECT current_level INTO current_value
      FROM public.player_xp
      WHERE player_id = check_achievement_unlock.user_id;
    WHEN 'tokens_earned' THEN
      SELECT lifetime_earned INTO current_value
      FROM public.token_balances
      WHERE player_id = check_achievement_unlock.user_id;
    WHEN 'hp_restored' THEN
      SELECT COUNT(*)::INTEGER INTO current_value
      FROM public.hp_activities
      WHERE player_id = check_achievement_unlock.user_id AND activity_type = 'restore';
    WHEN 'meditation_sessions' THEN
      SELECT total_sessions INTO current_value
      FROM public.meditation_progress
      WHERE user_id = check_achievement_unlock.user_id;
    WHEN 'meditation_minutes' THEN
      SELECT total_minutes INTO current_value
      FROM public.meditation_progress
      WHERE user_id = check_achievement_unlock.user_id;
    WHEN 'meditation_streak' THEN
      SELECT current_streak INTO current_value
      FROM public.meditation_progress
      WHERE user_id = check_achievement_unlock.user_id;
    ELSE
      current_value := 0;
  END CASE;
  
  -- Update progress
  INSERT INTO public.achievement_progress (player_id, achievement_id, current_progress)
  VALUES (check_achievement_unlock.user_id, check_achievement_unlock.achievement_id, current_value)
  ON CONFLICT (player_id, achievement_id) 
  DO UPDATE SET 
    current_progress = current_value,
    last_updated = now();
  
  -- Check if achievement is unlocked
  IF current_value >= achievement_record.requirement_value THEN
    is_unlocked := true;
    
    -- Add to player achievements
    INSERT INTO public.player_achievements (player_id, achievement_id, progress_value)
    VALUES (check_achievement_unlock.user_id, check_achievement_unlock.achievement_id, current_value);
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
