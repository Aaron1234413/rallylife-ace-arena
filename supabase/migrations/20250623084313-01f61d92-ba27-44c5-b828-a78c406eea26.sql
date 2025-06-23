
-- Add meditation-focused achievements to the database
INSERT INTO public.achievements (
  name, 
  description, 
  category, 
  tier, 
  requirement_type, 
  requirement_value, 
  reward_xp, 
  reward_tokens,
  reward_premium_tokens
) VALUES 
  ('Zen Novice', 'Complete your first meditation session', 'meditation', 'bronze', 'meditation_sessions', 1, 25, 15, 0),
  ('Mindful Beginner', 'Complete 5 meditation sessions', 'meditation', 'bronze', 'meditation_sessions', 5, 50, 25, 0),
  ('Inner Peace Seeker', 'Complete 15 meditation sessions', 'meditation', 'silver', 'meditation_sessions', 15, 100, 50, 5),
  ('Meditation Enthusiast', 'Complete 50 meditation sessions', 'meditation', 'gold', 'meditation_sessions', 50, 200, 100, 10),
  ('Mindful Master', 'Complete 100 meditation sessions', 'meditation', 'platinum', 'meditation_sessions', 100, 500, 250, 25),
  
  ('Time Keeper', 'Meditate for 60 total minutes', 'meditation', 'bronze', 'meditation_minutes', 60, 40, 20, 0),
  ('Hour of Zen', 'Meditate for 300 total minutes (5 hours)', 'meditation', 'silver', 'meditation_minutes', 300, 80, 40, 5),
  ('Meditation Marathon', 'Meditate for 1200 total minutes (20 hours)', 'meditation', 'gold', 'meditation_minutes', 1200, 150, 75, 10),
  ('Enlightened Soul', 'Meditate for 3000 total minutes (50 hours)', 'meditation', 'platinum', 'meditation_minutes', 3000, 400, 200, 20),
  
  ('Daily Meditator', 'Maintain a 7-day meditation streak', 'meditation', 'silver', 'meditation_streak', 7, 75, 50, 5),
  ('Consistent Mind', 'Maintain a 14-day meditation streak', 'meditation', 'gold', 'meditation_streak', 14, 150, 100, 10),
  ('Zen Warrior', 'Maintain a 30-day meditation streak', 'meditation', 'platinum', 'meditation_streak', 30, 300, 200, 20),
  ('Meditation Sage', 'Maintain a 60-day meditation streak', 'meditation', 'platinum', 'meditation_streak', 60, 600, 400, 50);
