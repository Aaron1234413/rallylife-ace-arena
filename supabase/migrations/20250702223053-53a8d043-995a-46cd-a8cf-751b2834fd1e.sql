-- Update HP activities constraint to include wellbeing_session type
ALTER TABLE public.hp_activities 
DROP CONSTRAINT IF EXISTS valid_activity_type;

ALTER TABLE public.hp_activities 
ADD CONSTRAINT valid_activity_type 
CHECK (activity_type IN (
  'training_session', 
  'match_session', 
  'social_play_session', 
  'wellbeing_session',
  'decay', 
  'meditation', 
  'recovery_activity',
  'manual_adjustment'
));