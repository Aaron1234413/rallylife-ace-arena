
-- Phase 1: Database Foundation & Missing Tables
-- This migration adds all missing database components for full clubs functionality

-- First, let's add missing RPC functions for shareable links management
CREATE OR REPLACE FUNCTION public.create_shareable_club_link(
  club_id_param uuid,
  max_uses_param integer DEFAULT NULL,
  expires_days integer DEFAULT 30
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  link_slug text;
  invitation_id uuid;
  expires_at timestamptz;
  result json;
BEGIN
  -- Check if user has permission to create invitations
  IF NOT EXISTS (
    SELECT 1 FROM public.club_memberships cm
    WHERE cm.club_id = club_id_param 
      AND cm.user_id = auth.uid() 
      AND cm.status = 'active'
      AND (
        cm.role IN ('owner', 'admin') OR
        (cm.permissions->>'can_invite')::boolean = true
      )
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient permissions');
  END IF;

  -- Generate unique link slug
  link_slug := lower(substring(gen_random_uuid()::text, 1, 12));
  expires_at := now() + (expires_days || ' days')::interval;

  -- Create shareable invitation
  INSERT INTO public.club_invitations (
    club_id, inviter_id, invitee_email, is_shareable_link,
    link_slug, max_uses, expires_at
  )
  VALUES (
    club_id_param, auth.uid(), '', true,
    link_slug, max_uses_param, expires_at
  )
  RETURNING id INTO invitation_id;

  result := json_build_object(
    'success', true,
    'link_slug', link_slug,
    'invitation_id', invitation_id,
    'expires_at', expires_at,
    'max_uses', max_uses_param
  );

  RETURN result;
END;
$$;

-- Function to join club via shareable link
CREATE OR REPLACE FUNCTION public.join_club_via_link(
  link_slug_param text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record RECORD;
  result json;
BEGIN
  -- Get invitation details
  SELECT * INTO invitation_record
  FROM public.club_invitations
  WHERE link_slug = link_slug_param
    AND is_shareable_link = true
    AND is_active = true
    AND expires_at > now()
    AND (max_uses IS NULL OR uses_count < max_uses);

  IF invitation_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation link');
  END IF;

  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM public.club_memberships 
    WHERE club_id = invitation_record.club_id 
      AND user_id = auth.uid() 
      AND status = 'active'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'You are already a member of this club');
  END IF;

  -- Add user to club
  INSERT INTO public.club_memberships (club_id, user_id, role, status)
  VALUES (invitation_record.club_id, auth.uid(), 'member', 'active');

  -- Increment usage count
  UPDATE public.club_invitations
  SET uses_count = COALESCE(uses_count, 0) + 1,
      updated_at = now()
  WHERE id = invitation_record.id;

  -- Deactivate if max uses reached
  IF invitation_record.max_uses IS NOT NULL AND 
     COALESCE(invitation_record.uses_count, 0) + 1 >= invitation_record.max_uses THEN
    UPDATE public.club_invitations
    SET is_active = false
    WHERE id = invitation_record.id;
  END IF;

  result := json_build_object(
    'success', true,
    'club_id', invitation_record.club_id,
    'message', 'Successfully joined the club!'
  );

  RETURN result;
END;
$$;

-- Function to get club's shareable links
CREATE OR REPLACE FUNCTION public.get_club_shareable_links(
  club_id_param uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  links_data json;
BEGIN
  -- Check if user has permission to view invitations
  IF NOT EXISTS (
    SELECT 1 FROM public.club_memberships cm
    WHERE cm.club_id = club_id_param 
      AND cm.user_id = auth.uid() 
      AND cm.status = 'active'
      AND cm.role IN ('owner', 'admin')
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient permissions');
  END IF;

  -- Get all active shareable links for the club
  SELECT json_agg(
    json_build_object(
      'id', ci.id,
      'link_slug', ci.link_slug,
      'max_uses', ci.max_uses,
      'uses_count', COALESCE(ci.uses_count, 0),
      'expires_at', ci.expires_at,
      'created_at', ci.created_at,
      'is_active', ci.is_active
    )
  ) INTO links_data
  FROM public.club_invitations ci
  WHERE ci.club_id = club_id_param
    AND ci.is_shareable_link = true
    AND ci.is_active = true;

  RETURN json_build_object(
    'success', true,
    'links', COALESCE(links_data, '[]'::json)
  );
END;
$$;

-- Function to promote/demote club members
CREATE OR REPLACE FUNCTION public.update_member_role(
  club_id_param uuid,
  user_id_param uuid,
  new_role text,
  new_permissions jsonb DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role text;
  target_user_role text;
  result json;
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role
  FROM public.club_memberships
  WHERE club_id = club_id_param AND user_id = auth.uid() AND status = 'active';

  -- Get target user's current role
  SELECT role INTO target_user_role
  FROM public.club_memberships
  WHERE club_id = club_id_param AND user_id = user_id_param AND status = 'active';

  -- Check permissions
  IF current_user_role != 'owner' AND 
     NOT (current_user_role = 'admin' AND target_user_role = 'member') THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient permissions');
  END IF;

  -- Prevent changing owner role
  IF target_user_role = 'owner' OR new_role = 'owner' THEN
    RETURN json_build_object('success', false, 'error', 'Cannot change owner role');
  END IF;

  -- Set default permissions based on role
  IF new_permissions IS NULL THEN
    new_permissions := CASE new_role
      WHEN 'admin' THEN '{"can_invite": true, "can_manage_members": true, "can_edit_club": true, "can_manage_courts": true}'::jsonb
      WHEN 'moderator' THEN '{"can_invite": true, "can_manage_members": false, "can_edit_club": false, "can_manage_courts": false}'::jsonb
      ELSE '{"can_invite": false, "can_manage_members": false, "can_edit_club": false, "can_manage_courts": false}'::jsonb
    END;
  END IF;

  -- Update member role and permissions
  UPDATE public.club_memberships
  SET role = new_role,
      permissions = new_permissions,
      updated_at = now()
  WHERE club_id = club_id_param AND user_id = user_id_param;

  result := json_build_object(
    'success', true,
    'message', 'Member role updated successfully',
    'user_id', user_id_param,
    'new_role', new_role
  );

  RETURN result;
END;
$$;

-- Function to remove club member
CREATE OR REPLACE FUNCTION public.remove_club_member(
  club_id_param uuid,
  user_id_param uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role text;
  target_user_role text;
  result json;
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role
  FROM public.club_memberships
  WHERE club_id = club_id_param AND user_id = auth.uid() AND status = 'active';

  -- Get target user's current role
  SELECT role INTO target_user_role
  FROM public.club_memberships
  WHERE club_id = club_id_param AND user_id = user_id_param AND status = 'active';

  -- Check permissions
  IF current_user_role NOT IN ('owner', 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient permissions');
  END IF;

  -- Prevent removing owner
  IF target_user_role = 'owner' THEN
    RETURN json_build_object('success', false, 'error', 'Cannot remove club owner');
  END IF;

  -- Only owners can remove admins
  IF target_user_role = 'admin' AND current_user_role != 'owner' THEN
    RETURN json_build_object('success', false, 'error', 'Only owners can remove admins');
  END IF;

  -- Remove member
  UPDATE public.club_memberships
  SET status = 'removed',
      updated_at = now()
  WHERE club_id = club_id_param AND user_id = user_id_param;

  result := json_build_object(
    'success', true,
    'message', 'Member removed successfully',
    'user_id', user_id_param
  );

  RETURN result;
END;
$$;

-- Function to transfer club ownership
CREATE OR REPLACE FUNCTION public.transfer_club_ownership(
  club_id_param uuid,
  new_owner_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_owner_id uuid;
  result json;
BEGIN
  -- Get current owner
  SELECT owner_id INTO current_owner_id
  FROM public.clubs
  WHERE id = club_id_param;

  -- Check if current user is the owner
  IF current_owner_id != auth.uid() THEN
    RETURN json_build_object('success', false, 'error', 'Only the current owner can transfer ownership');
  END IF;

  -- Check if new owner is a member
  IF NOT EXISTS (
    SELECT 1 FROM public.club_memberships
    WHERE club_id = club_id_param AND user_id = new_owner_id AND status = 'active'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'New owner must be an active club member');
  END IF;

  -- Transfer ownership
  UPDATE public.clubs
  SET owner_id = new_owner_id,
      updated_at = now()
  WHERE id = club_id_param;

  -- Update old owner to admin
  UPDATE public.club_memberships
  SET role = 'admin',
      permissions = '{"can_invite": true, "can_manage_members": true, "can_edit_club": true, "can_manage_courts": true}'::jsonb,
      updated_at = now()
  WHERE club_id = club_id_param AND user_id = current_owner_id;

  -- Update new owner role
  UPDATE public.club_memberships
  SET role = 'owner',
      permissions = '{"can_invite": true, "can_manage_members": true, "can_edit_club": true, "can_manage_courts": true}'::jsonb,
      updated_at = now()
  WHERE club_id = club_id_param AND user_id = new_owner_id;

  result := json_build_object(
    'success', true,
    'message', 'Club ownership transferred successfully',
    'new_owner_id', new_owner_id,
    'previous_owner_id', current_owner_id
  );

  RETURN result;
END;
$$;

-- Create club analytics table for tracking statistics
CREATE TABLE IF NOT EXISTS public.club_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  active_members_count integer DEFAULT 0,
  new_members_count integer DEFAULT 0,
  total_sessions integer DEFAULT 0,
  court_bookings integer DEFAULT 0,
  tokens_used integer DEFAULT 0,
  revenue_generated numeric DEFAULT 0.00,
  member_activity_score numeric DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(club_id, date)
);

-- Enable RLS on club_analytics
ALTER TABLE public.club_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for club_analytics
CREATE POLICY "Club members can view analytics"
ON public.club_analytics
FOR SELECT
USING (
  club_id IN (
    SELECT club_id FROM public.club_memberships
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Club owners can manage analytics"
ON public.club_analytics
FOR ALL
USING (
  club_id IN (
    SELECT id FROM public.clubs
    WHERE owner_id = auth.uid()
  )
);

-- Function to update club analytics
CREATE OR REPLACE FUNCTION public.update_club_analytics(
  club_id_param uuid,
  analytics_date date DEFAULT CURRENT_DATE
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_members integer;
  new_members integer;
  court_bookings integer;
  result json;
BEGIN
  -- Calculate active members
  SELECT COUNT(*) INTO active_members
  FROM public.club_memberships
  WHERE club_id = club_id_param AND status = 'active';

  -- Calculate new members for the date
  SELECT COUNT(*) INTO new_members
  FROM public.club_memberships
  WHERE club_id = club_id_param 
    AND status = 'active'
    AND DATE(joined_at) = analytics_date;

  -- Calculate court bookings for the date
  SELECT COUNT(*) INTO court_bookings
  FROM public.club_court_bookings
  WHERE club_id = club_id_param
    AND booking_date = analytics_date;

  -- Update or insert analytics
  INSERT INTO public.club_analytics (
    club_id, date, active_members_count, new_members_count, court_bookings
  )
  VALUES (
    club_id_param, analytics_date, active_members, new_members, court_bookings
  )
  ON CONFLICT (club_id, date)
  DO UPDATE SET
    active_members_count = EXCLUDED.active_members_count,
    new_members_count = EXCLUDED.new_members_count,
    court_bookings = EXCLUDED.court_bookings,
    updated_at = now();

  result := json_build_object(
    'success', true,
    'date', analytics_date,
    'active_members', active_members,
    'new_members', new_members,
    'court_bookings', court_bookings
  );

  RETURN result;
END;
$$;

-- Create member status tracking table for real-time presence
CREATE TABLE IF NOT EXISTS public.member_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away')),
  last_seen timestamptz DEFAULT now(),
  activity_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, club_id)
);

-- Enable RLS on member_status
ALTER TABLE public.member_status ENABLE ROW LEVEL SECURITY;

-- RLS policies for member_status
CREATE POLICY "Club members can view member status"
ON public.member_status
FOR SELECT
USING (
  club_id IN (
    SELECT club_id FROM public.club_memberships
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can update their own status"
ON public.member_status
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Function to update member status
CREATE OR REPLACE FUNCTION public.update_member_status(
  club_id_param uuid,
  status_param text DEFAULT 'online',
  activity_data_param jsonb DEFAULT '{}'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Verify user is a club member
  IF NOT EXISTS (
    SELECT 1 FROM public.club_memberships
    WHERE club_id = club_id_param AND user_id = auth.uid() AND status = 'active'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Not a club member');
  END IF;

  -- Update or insert member status
  INSERT INTO public.member_status (user_id, club_id, status, activity_data)
  VALUES (auth.uid(), club_id_param, status_param, activity_data_param)
  ON CONFLICT (user_id, club_id)
  DO UPDATE SET
    status = EXCLUDED.status,
    activity_data = EXCLUDED.activity_data,
    last_seen = now(),
    updated_at = now();

  result := json_build_object(
    'success', true,
    'status', status_param,
    'last_seen', now()
  );

  RETURN result;
END;
$$;

-- Add triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to tables
DROP TRIGGER IF EXISTS update_club_analytics_updated_at ON public.club_analytics;
CREATE TRIGGER update_club_analytics_updated_at
  BEFORE UPDATE ON public.club_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_member_status_updated_at ON public.member_status;
CREATE TRIGGER update_member_status_updated_at
  BEFORE UPDATE ON public.member_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add some indexes for better performance
CREATE INDEX IF NOT EXISTS idx_club_analytics_club_date ON public.club_analytics(club_id, date);
CREATE INDEX IF NOT EXISTS idx_member_status_club_status ON public.member_status(club_id, status);
CREATE INDEX IF NOT EXISTS idx_club_invitations_link_slug ON public.club_invitations(link_slug) WHERE is_shareable_link = true;
