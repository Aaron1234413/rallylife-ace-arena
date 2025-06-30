
-- Performance boosters catalog
CREATE TABLE performance_boosters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  token_price INTEGER NOT NULL,
  effect_type TEXT NOT NULL CHECK (effect_type IN ('match', 'training', 'social', 'recovery', 'coaching')),
  effect_data JSONB NOT NULL,
  cooldown_hours INTEGER DEFAULT 24,
  icon_name TEXT NOT NULL, -- Lucide icon name
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Track user's purchased boosters
CREATE TABLE user_performance_boosters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  booster_id UUID REFERENCES performance_boosters(id),
  purchased_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  effect_applied BOOLEAN DEFAULT false
);

-- Booster cooldown tracking
CREATE TABLE booster_cooldowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  booster_id UUID REFERENCES performance_boosters(id),
  last_purchased_at TIMESTAMPTZ NOT NULL,
  cooldown_expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE performance_boosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_performance_boosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE booster_cooldowns ENABLE ROW LEVEL SECURITY;

-- Performance boosters are public (everyone can see catalog)
CREATE POLICY "performance_boosters_public" ON performance_boosters FOR SELECT USING (true);

-- Users can only see their own booster inventory
CREATE POLICY "user_boosters_own" ON user_performance_boosters FOR ALL USING (user_id = auth.uid());

-- Users can only see their own cooldowns
CREATE POLICY "booster_cooldowns_own" ON booster_cooldowns FOR ALL USING (user_id = auth.uid());

-- Insert initial performance boosters
INSERT INTO performance_boosters (name, description, token_price, effect_type, effect_data, icon_name, rarity) VALUES
-- Match Enhancement
('Match Stamina Pack', 'Reduce HP loss by 50% for your next competitive match', 50, 'match', '{"hp_reduction": 0.5, "duration": "next_match"}', 'Zap', 'common'),
('Ace Multiplier', 'Double XP gain for your next competitive match', 75, 'match', '{"xp_multiplier": 2.0, "duration": "next_match"}', 'Target', 'rare'),
('Comeback Boost', 'Bonus XP if you win after being down a set', 30, 'match', '{"comeback_xp_bonus": 50, "duration": "next_match"}', 'TrendingUp', 'common'),

-- Training Optimization
('Focus Enhancer', 'Reduce HP loss during training by 25%', 40, 'training', '{"hp_reduction": 0.25, "duration": "next_training"}', 'Brain', 'common'),
('Skill Accelerator', '50% bonus XP for your next 3 training sessions', 60, 'training', '{"xp_multiplier": 1.5, "duration": "3_sessions"}', 'BookOpen', 'rare'),
('Endurance Booster', 'Train 25% longer without extra HP loss', 35, 'training', '{"duration_bonus": 0.25, "duration": "next_training"}', 'Activity', 'common'),

-- Social Play Benefits
('Social Catalyst', 'Bonus tokens for hosting social play sessions', 25, 'social', '{"token_bonus": 10, "duration": "next_session"}', 'Users', 'common'),
('Group Energy', 'All participants get +5 HP during social play', 45, 'social', '{"group_hp_bonus": 5, "duration": "next_session"}', 'Heart', 'rare'),
('Friend Finder', 'Get matched with similar skill level players', 20, 'social', '{"matching_bonus": true, "duration": "24_hours"}', 'Search', 'common'),

-- Recovery & Rest
('Premium Recovery Pack', 'Restore 100 HP instantly', 80, 'recovery', '{"hp_restore": 100, "instant": true}', 'Plus', 'epic'),
('Sleep Optimizer', 'Passive HP regeneration +2/hour for 24 hours', 50, 'recovery', '{"hp_regen_rate": 2, "duration": "24_hours"}', 'Moon', 'rare'),
('Meditation Multiplier', 'Double HP gain from your next meditation session', 30, 'recovery', '{"meditation_multiplier": 2.0, "duration": "next_session"}', 'Sparkles', 'common'),

-- Coaching Session Boosts
('Lesson Enhancer', 'Extra 25 XP from your next coaching session', 70, 'coaching', '{"xp_bonus": 25, "duration": "next_lesson"}', 'GraduationCap', 'rare'),
('Progress Tracker', 'Detailed analytics for your next 3 lessons', 40, 'coaching', '{"analytics_boost": true, "duration": "3_lessons"}', 'BarChart3', 'common'),
('Coach Appreciation', 'Small tip for your coach (+5 tokens)', 25, 'coaching', '{"coach_tip": 5, "duration": "next_lesson"}', 'Gift', 'common');
