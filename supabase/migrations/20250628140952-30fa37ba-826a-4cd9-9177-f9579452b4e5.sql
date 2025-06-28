
-- Enable RLS on match_invitations table (if not already enabled)
ALTER TABLE public.match_invitations ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow invitees to see invitations sent TO them
-- This makes MatchInvitationCard appear for the opponent
CREATE POLICY "Allow invitees to see their own invitations"
ON public.match_invitations
FOR SELECT
USING ( auth.uid() = invitee_id );

-- Policy 2: Allow inviters to see invitations THEY sent
-- This makes PendingInvitationCard appear for the challenger
CREATE POLICY "Allow inviters to see the invitations they sent"
ON public.match_invitations
FOR SELECT
USING ( auth.uid() = inviter_id );

-- Policy 3: Allow authenticated users to create invitations
CREATE POLICY "Allow authenticated users to create invitations"
ON public.match_invitations
FOR INSERT
WITH CHECK ( auth.role() = 'authenticated' );

-- Policy 4: Allow invitees to decline their invitations
-- Supports the declineInvitation function's DELETE operation
CREATE POLICY "Allow invitees to decline their invitations"
ON public.match_invitations
FOR DELETE
USING ( auth.uid() = invitee_id );

-- Policy 5: Allow invitees to update invitation status (for accept/decline)
-- This supports both accept and decline operations that update the status
CREATE POLICY "Allow invitees to update invitation status"
ON public.match_invitations
FOR UPDATE
USING ( auth.uid() = invitee_id );
