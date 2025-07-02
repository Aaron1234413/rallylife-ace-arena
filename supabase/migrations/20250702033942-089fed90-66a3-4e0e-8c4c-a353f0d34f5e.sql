-- Clean up RLS policies on match_invitations table to fix invitation persistence and accept/decline issues

-- Drop all existing conflicting policies on match_invitations
DROP POLICY IF EXISTS "Allow authenticated users to create invitations" ON public.match_invitations;
DROP POLICY IF EXISTS "Allow invitees to decline their invitations" ON public.match_invitations;
DROP POLICY IF EXISTS "Allow invitees to see their own invitations" ON public.match_invitations;
DROP POLICY IF EXISTS "Allow invitees to update invitation status" ON public.match_invitations;
DROP POLICY IF EXISTS "Allow inviters to see the invitations they sent" ON public.match_invitations;
DROP POLICY IF EXISTS "Insert invitations (session owner)" ON public.match_invitations;
DROP POLICY IF EXISTS "Invitations: participants or creators can view" ON public.match_invitations;
DROP POLICY IF EXISTS "Invitations: respond to invites" ON public.match_invitations;
DROP POLICY IF EXISTS "Invitations: send own invites" ON public.match_invitations;
DROP POLICY IF EXISTS "Select invitations (owner or invitee)" ON public.match_invitations;
DROP POLICY IF EXISTS "Update invitations (invitee)" ON public.match_invitations;
DROP POLICY IF EXISTS "Users can insert their own invitations" ON public.match_invitations;
DROP POLICY IF EXISTS "Users can send invitations" ON public.match_invitations;
DROP POLICY IF EXISTS "Users can update invitations sent to them" ON public.match_invitations;
DROP POLICY IF EXISTS "Users can update invitations they're involved in" ON public.match_invitations;
DROP POLICY IF EXISTS "Users can view invitations involving them" ON public.match_invitations;
DROP POLICY IF EXISTS "Users can view invitations sent to them or by them" ON public.match_invitations;
DROP POLICY IF EXISTS "insert_invitations" ON public.match_invitations;
DROP POLICY IF EXISTS "select_invitations" ON public.match_invitations;
DROP POLICY IF EXISTS "update_invitations" ON public.match_invitations;

-- Create 4 clean, simple RLS policies

-- 1. SELECT: Users can view invitations they sent or received
CREATE POLICY "Users can view invitations they are involved in"
ON public.match_invitations
FOR SELECT
USING (
  auth.uid() = inviter_id OR auth.uid() = invitee_id
);

-- 2. INSERT: Users can send invitations
CREATE POLICY "Users can send invitations"
ON public.match_invitations
FOR INSERT
WITH CHECK (
  auth.uid() = inviter_id
);

-- 3. UPDATE: Users can accept/decline invitations they're involved in
CREATE POLICY "Users can update invitations they are involved in"
ON public.match_invitations
FOR UPDATE
USING (
  auth.uid() = inviter_id OR auth.uid() = invitee_id
)
WITH CHECK (
  auth.uid() = inviter_id OR auth.uid() = invitee_id
);

-- 4. DELETE: Users can delete invitations they received
CREATE POLICY "Users can delete invitations they received"
ON public.match_invitations
FOR DELETE
USING (
  auth.uid() = invitee_id
);