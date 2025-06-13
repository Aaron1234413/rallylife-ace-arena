
-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'gameplay', 'social', 'progression', 'special'
  tier TEXT NOT NULL DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  icon_url TEXT,
  requirement_type TEXT NOT NULL, -- 'xp_total', 'level_reached', 'tokens_earned', 'hp_restored', 'custom'
  requirement_value INTEGER, -- Target value for the requirement
  requirement_data JSONB, -- Additional requirement data for complex achievements
  reward_xp INTEGER DEFAULT 0,
  reward_tokens INTEGER DEFAULT 0,
  reward_premium_tokens INTEGER DEFAULT 0,
  reward_avatar_item_id UUID REFERENCES public.avatar_items(id),
  is_hidden BOOLEAN DEFAULT false, -- Hidden until unlocked
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create player achievements table (tracks unlocked achievements)
CREATE TABLE public.player_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress_value INTEGER DEFAULT 0, -- Current progress towards achievement
  is_claimed BOOLEAN DEFAULT false, -- Whether rewards have been claimed
  claimed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(player_id, achievement_id)
);

-- Create achievement progress tracking table
CREATE TABLE public.achievement_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  current_progress INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(player_id, achievement_id)
);

-- Enable RLS on all achievement tables
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for achievements (publicly readable)
CREATE POLICY "Achievements are viewable by everyone" 
  ON public.achievements 
  FOR SELECT 
  USING (is_active = true);

-- RLS policies for player_achievements
CREATE POLICY "Players can view their own achievements" 
  ON public.player_achievements 
  FOR SELECT 
  USING (player_id = auth.uid());

CREATE POLICY "Players can insert their own achievements" 
  ON public.player_achievements 
  FOR INSERT 
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Players can update their own achievements" 
  ON public.player_achievements 
  FOR UPDATE 
  USING (player_id = auth.uid());

-- RLS policies for achievement_progress
CREATE POLICY "Players can view their own progress" 
  ON public.achievement_progress 
  FOR SELECT 
  USING (player_id = auth.uid());

CREATE POLICY "Players can insert their own progress" 
  ON public.achievement_progress 
  FOR INSERT 
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Players can update their own progress" 
  ON public.achievement_progress 
  FOR UPDATE 
  USING (player_id = auth.uid());

-- Function to check and unlock achievements
CREATE OR REPLACE FUNCTION public.check_achievement_unlock(
  user_id UUID,
  achievement_id UUID
) RETURNS JSON
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
  FROM public.achievements
  WHERE id = achievement_id AND is_active = true;
  
  IF achievement_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Achievement not found');
  END IF;
  
  -- Check if already unlocked
  IF EXISTS (SELECT 1 FROM public.player_achievements WHERE player_id = user_id AND achievement_id = achievement_id) THEN
    RETURN json_build_object('success', false, 'error', 'Achievement already unlocked');
  END IF;
  
  -- Determine current progress based on requirement type
  CASE achievement_record.requirement_type
    WHEN 'xp_total' THEN
      SELECT total_xp_earned INTO current_value
      FROM public.player_xp
      WHERE player_id = user_id;
    WHEN 'level_reached' THEN
      SELECT current_level INTO current_value
      FROM public.player_xp
      WHERE player_id = user_id;
    WHEN 'tokens_earned' THEN
      SELECT lifetime_earned INTO current_value
      FROM public.token_balances
      WHERE player_id = user_id;
    WHEN 'hp_restored' THEN
      SELECT COUNT(*)::INTEGER INTO current_value
      FROM public.hp_activities
      WHERE player_id = user_id AND activity_type = 'restore';
    ELSE
      current_value := 0;
  END CASE;
  
  -- Update progress
  INSERT INTO public.achievement_progress (player_id, achievement_id, current_progress)
  VALUES (user_id, achievement_id, current_value)
  ON CONFLICT (player_id, achievement_id) 
  DO UPDATE SET 
    current_progress = current_value,
    last_updated = now();
  
  -- Check if achievement is unlocked
  IF current_value >= achievement_record.requirement_value THEN
    is_unlocked := true;
    
    -- Add to player achievements
    INSERT INTO public.player_achievements (player_id, achievement_id, progress_value)
    VALUES (user_id, achievement_id, current_value);
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
CREATE OR REPLACE FUNCTION public.claim_achievement_reward(
  user_id UUID,
  achievement_id UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_record RECORD;
  player_achievement_record RECORD;
  result JSON;
  xp_result JSON;
  token_result JSON;
  avatar_result JSON;
BEGIN
  -- Get achievement and player achievement records
  SELECT a.*, pa.is_claimed, pa.unlocked_at
  INTO achievement_record
  FROM public.achievements a
  JOIN public.player_achievements pa ON a.id = pa.achievement_id
  WHERE a.id = achievement_id AND pa.player_id = user_id;
  
  IF achievement_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Achievement not found or not unlocked');
  END IF;
  
  IF achievement_record.is_claimed THEN
    RETURN json_build_object('success', false, 'error', 'Rewards already claimed');
  END IF;
  
  -- Grant XP reward
  IF achievement_record.reward_xp > 0 THEN
    SELECT public.add_xp(user_id, achievement_record.reward_xp, 'achievement', 
                        'Achievement reward: ' || achievement_record.name) INTO xp_result;
  END IF;
  
  -- Grant token rewards
  IF achievement_record.reward_tokens > 0 THEN
    SELECT public.add_tokens(user_id, achievement_record.reward_tokens, 'regular', 'achievement',
                           'Achievement reward: ' || achievement_record.name) INTO token_result;
  END IF;
  
  IF achievement_record.reward_premium_tokens > 0 THEN
    SELECT public.add_tokens(user_id, achievement_record.reward_premium_tokens, 'premium', 'achievement',
                           'Achievement reward: ' || achievement_record.name) INTO token_result;
  END IF;
  
  -- Grant avatar item reward
  IF achievement_record.reward_avatar_item_id IS NOT NULL THEN
    SELECT public.unlock_avatar_item(user_id, achievement_record.reward_avatar_item_id, 'achievement') INTO avatar_result;
  END IF;
  
  -- Mark as claimed
  UPDATE public.player_achievements
  SET is_claimed = true, claimed_at = now()
  WHERE player_id = user_id AND achievement_id = achievement_id;
  
  result := json_build_object(
    'success', true,
    'achievement_name', achievement_record.name,
    'xp_earned', COALESCE(achievement_record.reward_xp, 0),
    'tokens_earned', COALESCE(achievement_record.reward_tokens, 0),
    'premium_tokens_earned', COALESCE(achievement_record.reward_premium_tokens, 0),
    'avatar_item_unlocked', achievement_record.reward_avatar_item_id IS NOT NULL
  );
  
  RETURN result;
END;
$$;

-- Function to initialize default achievements
CREATE OR REPLACE FUNCTION public.initialize_default_achievements()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert default achievements if they don't exist
  INSERT INTO public.achievements (name, description, category, tier, requirement_type, requirement_value, reward_xp, reward_tokens)
  VALUES 
    ('First Steps', 'Reach level 2', 'progression', 'bronze', 'level_reached', 2, 50, 25),
    ('Rising Star', 'Reach level 5', 'progression', 'silver', 'level_reached', 5, 100, 50),
    ('Tennis Pro', 'Reach level 10', 'progression', 'gold', 'level_reached', 10, 200, 100),
    ('Champion', 'Reach level 20', 'progression', 'platinum', 'level_reached', 20, 500, 250),
    ('XP Collector', 'Earn 1000 total XP', 'progression', 'bronze', 'xp_total', 1000, 75, 40),
    ('XP Master', 'Earn 5000 total XP', 'progression', 'silver', 'xp_total', 5000, 150, 75),
    ('Token Collector', 'Earn 500 tokens lifetime', 'progression', 'bronze', 'tokens_earned', 500, 100, 0),
    ('Token Hoarder', 'Earn 2000 tokens lifetime', 'progression', 'silver', 'tokens_earned', 2000, 200, 0),
    ('Recovery Expert', 'Restore HP 10 times', 'gameplay', 'bronze', 'hp_restored', 10, 75, 30),
    ('Endurance Master', 'Restore HP 50 times', 'gameplay', 'silver', 'hp_restored', 50, 150, 75)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Initialize default achievements
SELECT public.initialize_default_achievements();
