-- Phase 1: Update RLS policies to allow club discovery while keeping invitation-only membership

-- Drop the current restrictive club viewing policy
DROP POLICY IF EXISTS "Users can view clubs they have access to" ON public.clubs;

-- Create new policy that allows anyone to view clubs for discovery
CREATE POLICY "Anyone can view clubs for discovery"
ON public.clubs
FOR SELECT
TO authenticated
USING (true);

-- Keep the existing ownership policies for club management
-- (Users can still only update/delete clubs they own)

-- Update club memberships policy to be more explicit about invitation-only joining
DROP POLICY IF EXISTS "Users can insert their own memberships" ON public.club_memberships;

-- Create policy that prevents direct membership insertion (must go through invitation system)
CREATE POLICY "Memberships can only be created through invitations"
ON public.club_memberships
FOR INSERT
TO authenticated
WITH CHECK (false); -- This will be handled by the invitation acceptance function

-- Update club invitations to only allow club owners to create them
DROP POLICY IF EXISTS "Club members with invite permission can create invitations" ON public.club_invitations;

CREATE POLICY "Only club owners can create invitations"
ON public.club_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = inviter_id AND 
  club_id IN (
    SELECT id FROM public.clubs 
    WHERE owner_id = auth.uid()
  )
);

-- Allow system to manage memberships through invitation functions
CREATE POLICY "System can manage memberships for invitations"
ON public.club_memberships
FOR INSERT
TO authenticated
WITH CHECK (
  -- This will be used by the invitation acceptance function
  club_id IN (
    SELECT ci.club_id 
    FROM public.club_invitations ci 
    WHERE ci.invitee_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    ) 
    AND ci.status = 'pending' 
    AND ci.is_active = true 
    AND ci.expires_at > now()
  )
);