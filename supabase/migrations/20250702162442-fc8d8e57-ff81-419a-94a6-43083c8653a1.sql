-- Phase 1: Database Schema Updates for Wellbeing Sessions
-- Add "wellbeing" to session_type enum and migrate existing "recovery" sessions

-- First, add "wellbeing" to the existing session_type enum
ALTER TYPE session_type ADD VALUE 'wellbeing';

-- Migrate existing "recovery" sessions to "wellbeing" type
UPDATE public.sessions 
SET session_type = 'wellbeing' 
WHERE session_type = 'recovery';

-- Add a comment to document the change
COMMENT ON TYPE session_type IS 'Session types: match, social_play, training, wellbeing (formerly recovery)';

-- Create index on session_type for better query performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_sessions_session_type ON public.sessions(session_type);

-- Update any existing RLS policies or constraints that might reference "recovery"
-- Note: "recovery" type is kept in enum for backward compatibility during transition