-- First remove the constraint completely, then add the correct one
ALTER TABLE public.hp_activities 
DROP CONSTRAINT IF EXISTS valid_activity_type;

-- Check existing activity types and add constraint with all current values
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
  'manual_adjustment',
  'training_completion',
  'match_completion',
  'social_play_completion'
));