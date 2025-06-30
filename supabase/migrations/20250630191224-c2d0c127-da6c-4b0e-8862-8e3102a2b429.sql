
-- Add new columns to match_invitations table for unified invitation system
ALTER TABLE public.match_invitations 
ADD COLUMN invitation_category text NOT NULL DEFAULT 'match',
ADD COLUMN session_data jsonb DEFAULT '{}';

-- Add check constraint for invitation_category
ALTER TABLE public.match_invitations 
ADD CONSTRAINT match_invitations_category_check 
CHECK (invitation_category IN ('match', 'social_play'));

-- Update existing match invitations to have the 'match' category
UPDATE public.match_invitations 
SET invitation_category = 'match' 
WHERE invitation_category IS NULL;

-- Add index for better performance on category filtering
CREATE INDEX idx_match_invitations_category ON public.match_invitations(invitation_category);
CREATE INDEX idx_match_invitations_invitee_category ON public.match_invitations(invitee_id, invitation_category);
CREATE INDEX idx_match_invitations_inviter_category ON public.match_invitations(inviter_id, invitation_category);

-- Update RLS policies to handle both invitation categories
-- The existing policies already work for both categories since they filter by user ID
-- But let's add comments to clarify they handle both types

COMMENT ON POLICY "Allow invitees to see their own invitations" ON public.match_invitations IS 
'Allows users to see invitations sent TO them (both match and social_play categories)';

COMMENT ON POLICY "Allow inviters to see the invitations they sent" ON public.match_invitations IS 
'Allows users to see invitations THEY sent (both match and social_play categories)';

COMMENT ON POLICY "Allow authenticated users to create invitations" ON public.match_invitations IS 
'Allows authenticated users to create invitations (both match and social_play categories)';

-- Add comment to the table explaining the unified system
COMMENT ON TABLE public.match_invitations IS 
'Unified invitations table handling both tennis match invitations and social play event invitations';

COMMENT ON COLUMN public.match_invitations.invitation_category IS 
'Type of invitation: match (1v1 tennis match) or social_play (group tennis event)';

COMMENT ON COLUMN public.match_invitations.session_data IS 
'Flexible JSON data for storing invitation-specific information like event details, participants, etc.';
