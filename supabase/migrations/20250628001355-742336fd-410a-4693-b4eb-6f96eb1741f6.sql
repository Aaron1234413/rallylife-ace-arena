
-- Update RLS policies for match invitations to support the simplified flow
-- This ensures invitations work properly with the dashboard integration

-- First, let's make sure the existing policies are comprehensive
-- Drop any conflicting policies that might interfere
DROP POLICY IF EXISTS "match_invitations_select" ON public.match_invitations;
DROP POLICY IF EXISTS "match_invitations_insert" ON public.match_invitations;
DROP POLICY IF EXISTS "match_invitations_update" ON public.match_invitations;

-- Create comprehensive policies for match invitations
CREATE POLICY "Invitations: view own invitations"
  ON public.match_invitations FOR SELECT
  USING (invitee_id = auth.uid() OR inviter_id = auth.uid());

CREATE POLICY "Invitations: send invitations"
  ON public.match_invitations FOR INSERT
  WITH CHECK (inviter_id = auth.uid());

CREATE POLICY "Invitations: respond to invitations"
  ON public.match_invitations FOR UPDATE
  USING (invitee_id = auth.uid() OR inviter_id = auth.uid())
  WITH CHECK (invitee_id = auth.uid() OR inviter_id = auth.uid());

-- Ensure match participants policies allow invitation acceptance
DROP POLICY IF EXISTS "Participants: join sessions" ON public.match_participants;
DROP POLICY IF EXISTS "Participants: session owner adds participants" ON public.match_participants;

-- Create unified participant policy
CREATE POLICY "Participants: manage participation"
  ON public.match_participants FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR 
    public.user_owns_match_session(match_session_id)
  );

-- Add a function to help with invitation acceptance workflow
CREATE OR REPLACE FUNCTION public.accept_match_invitation(invitation_id UUID)
RETURNS JSON AS $$
DECLARE
  invitation_record RECORD;
  user_name TEXT;
  result JSON;
BEGIN
  -- Get the invitation
  SELECT * INTO invitation_record
  FROM public.match_invitations
  WHERE id = invitation_id AND invitee_id = auth.uid() AND status = 'pending';
  
  IF invitation_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invitation not found or already processed');
  END IF;
  
  -- Check if expired
  IF invitation_record.expires_at < now() THEN
    RETURN json_build_object('success', false, 'error', 'Invitation has expired');
  END IF;
  
  -- Get user's name
  SELECT full_name INTO user_name
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- Add user as participant to the match session
  INSERT INTO public.match_participants (
    match_session_id,
    user_id,
    participant_name,
    participant_role
  )
  VALUES (
    invitation_record.match_session_id,
    auth.uid(),
    COALESCE(user_name, 'Unknown Player'),
    'player'
  )
  ON CONFLICT (match_session_id, user_id) DO NOTHING;
  
  -- Update invitation status
  UPDATE public.match_invitations
  SET 
    status = 'accepted',
    responded_at = now(),
    updated_at = now()
  WHERE id = invitation_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Invitation accepted successfully',
    'session_id', invitation_record.match_session_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a function to decline invitations
CREATE OR REPLACE FUNCTION public.decline_match_invitation(invitation_id UUID)
RETURNS JSON AS $$
DECLARE
  invitation_record RECORD;
  result JSON;
BEGIN
  -- Get the invitation
  SELECT * INTO invitation_record
  FROM public.match_invitations
  WHERE id = invitation_id AND invitee_id = auth.uid() AND status = 'pending';
  
  IF invitation_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invitation not found or already processed');
  END IF;
  
  -- Update invitation status
  UPDATE public.match_invitations
  SET 
    status = 'declined',
    responded_at = now(),
    updated_at = now()
  WHERE id = invitation_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Invitation declined'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
