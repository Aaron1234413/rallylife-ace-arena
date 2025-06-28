
-- Fix the foreign key constraint issue that's preventing invitation creation
-- Make match_session_id nullable so invitations can be created before sessions exist

ALTER TABLE public.match_invitations 
ALTER COLUMN match_session_id DROP NOT NULL;

-- Add a comment to document this design decision
COMMENT ON COLUMN public.match_invitations.match_session_id IS 
'Optional reference to match session. NULL during invitation phase, populated after acceptance.';
