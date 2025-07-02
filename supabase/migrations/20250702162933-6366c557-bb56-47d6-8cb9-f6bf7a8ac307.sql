-- Phase 1: Add wellbeing session type support and migrate existing recovery sessions

-- Update any existing "recovery" sessions to "wellbeing" type
UPDATE public.sessions 
SET session_type = 'wellbeing' 
WHERE session_type = 'recovery';

-- Add or update check constraint to include 'wellbeing' session type
-- First drop existing constraint if it exists
ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS sessions_session_type_check;

-- Add new constraint that includes 'wellbeing'
ALTER TABLE public.sessions 
ADD CONSTRAINT sessions_session_type_check 
CHECK (session_type IN ('match', 'social_play', 'training', 'wellbeing', 'recovery'));

-- Create index on session_type if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_sessions_session_type ON public.sessions(session_type);

-- Log the migration
INSERT INTO public.sessions (creator_id, session_type, max_players, stakes_amount, notes, status) 
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid,
  'wellbeing',
  1,
  0,
  'Migration test - wellbeing session type added successfully',
  'completed'
WHERE NOT EXISTS (SELECT 1 FROM public.sessions WHERE session_type = 'wellbeing' AND notes LIKE '%Migration test%');

-- Clean up test record immediately
DELETE FROM public.sessions 
WHERE notes = 'Migration test - wellbeing session type added successfully';