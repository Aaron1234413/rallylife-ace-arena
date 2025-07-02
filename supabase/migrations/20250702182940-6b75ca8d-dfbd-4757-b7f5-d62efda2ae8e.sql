-- Add more granular roles to club_memberships
ALTER TABLE public.club_memberships 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"can_invite": false, "can_manage_members": false, "can_edit_club": false}'::jsonb;

-- Update existing roles with appropriate permissions
UPDATE public.club_memberships 
SET permissions = CASE 
  WHEN role = 'owner' THEN '{"can_invite": true, "can_manage_members": true, "can_edit_club": true, "can_manage_courts": true}'::jsonb
  WHEN role = 'admin' THEN '{"can_invite": true, "can_manage_members": true, "can_edit_club": false, "can_manage_courts": true}'::jsonb
  WHEN role = 'moderator' THEN '{"can_invite": true, "can_manage_members": false, "can_edit_club": false, "can_manage_courts": false}'::jsonb
  ELSE '{"can_invite": false, "can_manage_members": false, "can_edit_club": false, "can_manage_courts": false}'::jsonb
END;

-- Create club_invitations table
CREATE TABLE public.club_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL,
  invitee_email TEXT NOT NULL,
  invitation_code TEXT NOT NULL DEFAULT UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(club_id, invitee_email)
);

-- Create club_activity_feed table
CREATE TABLE public.club_activity_feed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.club_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_activity_feed ENABLE ROW LEVEL SECURITY;

-- RLS policies for club_invitations
CREATE POLICY "Club members can view invitations for their clubs"
ON public.club_invitations
FOR SELECT
USING (
  club_id IN (
    SELECT club_id FROM public.club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Club members with invite permission can create invitations"
ON public.club_invitations
FOR INSERT
WITH CHECK (
  auth.uid() = inviter_id AND
  club_id IN (
    SELECT cm.club_id FROM public.club_memberships cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    AND (cm.permissions->>'can_invite')::boolean = true
  )
);

CREATE POLICY "Club invitations can be updated by inviter or invitee"
ON public.club_invitations
FOR UPDATE
USING (
  auth.uid() = inviter_id OR
  invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- RLS policies for club_activity_feed
CREATE POLICY "Club members can view activity feed"
ON public.club_activity_feed
FOR SELECT
USING (
  club_id IN (
    SELECT club_id FROM public.club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Club members can create activity feed entries"
ON public.club_activity_feed
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  club_id IN (
    SELECT club_id FROM public.club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Function to log club activities
CREATE OR REPLACE FUNCTION log_club_activity(
  p_club_id UUID,
  p_user_id UUID,
  p_activity_type TEXT,
  p_activity_data JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.club_activity_feed (club_id, user_id, activity_type, activity_data)
  VALUES (p_club_id, p_user_id, p_activity_type, p_activity_data);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept club invitation
CREATE OR REPLACE FUNCTION accept_club_invitation(invitation_code_param TEXT)
RETURNS JSON AS $$
DECLARE
  invitation_record RECORD;
  result JSON;
BEGIN
  -- Get invitation details
  SELECT * INTO invitation_record
  FROM public.club_invitations
  WHERE invitation_code = invitation_code_param
    AND status = 'pending'
    AND expires_at > now();
  
  IF invitation_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation code');
  END IF;
  
  -- Check if user email matches invitation
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = invitation_record.invitee_email
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Invitation email does not match your account');
  END IF;
  
  -- Update invitation status
  UPDATE public.club_invitations
  SET 
    status = 'accepted',
    accepted_at = now(),
    updated_at = now()
  WHERE id = invitation_record.id;
  
  -- Add user to club
  INSERT INTO public.club_memberships (club_id, user_id, role, status)
  VALUES (invitation_record.club_id, auth.uid(), 'member', 'active')
  ON CONFLICT (club_id, user_id) DO UPDATE SET
    status = 'active',
    updated_at = now();
  
  -- Log activity
  PERFORM log_club_activity(
    invitation_record.club_id,
    auth.uid(),
    'member_joined',
    json_build_object('invited_by', invitation_record.inviter_id)
  );
  
  result := json_build_object(
    'success', true,
    'club_id', invitation_record.club_id,
    'message', 'Successfully joined club!'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update club creation trigger to log activity
CREATE OR REPLACE FUNCTION initialize_club_owner_membership()
RETURNS TRIGGER AS $$
BEGIN
  -- Add owner as member
  INSERT INTO public.club_memberships (club_id, user_id, role, status, permissions)
  VALUES (
    NEW.id, 
    NEW.owner_id, 
    'owner', 
    'active',
    '{"can_invite": true, "can_manage_members": true, "can_edit_club": true, "can_manage_courts": true}'::jsonb
  );
  
  -- Log club creation activity
  PERFORM log_club_activity(
    NEW.id,
    NEW.owner_id,
    'club_created',
    json_build_object('club_name', NEW.name)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX idx_club_invitations_club_id ON public.club_invitations(club_id);
CREATE INDEX idx_club_invitations_invitee_email ON public.club_invitations(invitee_email);
CREATE INDEX idx_club_invitations_status ON public.club_invitations(status);
CREATE INDEX idx_club_activity_feed_club_id ON public.club_activity_feed(club_id);
CREATE INDEX idx_club_activity_feed_created_at ON public.club_activity_feed(created_at DESC);