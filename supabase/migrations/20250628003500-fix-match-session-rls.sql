
-- Fix infinite recursion in RLS policies for match sessions
-- The issue is circular dependencies between policies

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Sessions: owner views own sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Sessions: participants view joined sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Participants: view own participation" ON public.match_participants;
DROP POLICY IF EXISTS "Participants: view session owner's participants" ON public.match_participants;
DROP POLICY IF EXISTS "Participants: join sessions" ON public.match_participants;
DROP POLICY IF EXISTS "Participants: session owner adds participants" ON public.match_participants;

-- Drop the helper functions that might cause recursion
DROP FUNCTION IF EXISTS public.user_owns_match_session(UUID);
DROP FUNCTION IF EXISTS public.user_participates_in_match_session(UUID);

-- Create simple, non-recursive policies for active_match_sessions
CREATE POLICY "Users can view their own match sessions"
  ON public.active_match_sessions FOR SELECT
  USING (player_id = auth.uid());

CREATE POLICY "Users can create their own match sessions"
  ON public.active_match_sessions FOR INSERT
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can update their own match sessions"
  ON public.active_match_sessions FOR UPDATE
  USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can delete their own match sessions"
  ON public.active_match_sessions FOR DELETE
  USING (player_id = auth.uid());

-- Create simple policies for match_participants
CREATE POLICY "Users can view match participants"
  ON public.match_participants FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can join match sessions as participants"
  ON public.match_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation"
  ON public.match_participants FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Ensure match_invitations policies are also simple
DROP POLICY IF EXISTS "Invitations: view own invitations" ON public.match_invitations;
DROP POLICY IF EXISTS "Invitations: send invitations" ON public.match_invitations;
DROP POLICY IF EXISTS "Invitations: respond to invitations" ON public.match_invitations;

CREATE POLICY "Users can view invitations involving them"
  ON public.match_invitations FOR SELECT
  USING (invitee_id = auth.uid() OR inviter_id = auth.uid());

CREATE POLICY "Users can send invitations"
  ON public.match_invitations FOR INSERT
  WITH CHECK (inviter_id = auth.uid());

CREATE POLICY "Users can update invitations they're involved in"
  ON public.match_invitations FOR UPDATE
  USING (invitee_id = auth.uid() OR inviter_id = auth.uid())
  WITH CHECK (invitee_id = auth.uid() OR inviter_id = auth.uid());
