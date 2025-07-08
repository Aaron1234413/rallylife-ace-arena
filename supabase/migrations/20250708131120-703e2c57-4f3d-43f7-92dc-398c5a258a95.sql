-- Phase 1: Backend Foundation & Fixes

-- 1.1 Fix/Create Member Presence RPC Functions
CREATE OR REPLACE FUNCTION public.set_play_availability(
  club_id_param uuid,
  message_param text DEFAULT NULL,
  session_type_param text DEFAULT 'casual',
  available_until_param timestamptz DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Insert or update member status
  INSERT INTO public.member_status (user_id, club_id, status, availability_message, last_seen)
  VALUES (auth.uid(), club_id_param, 'looking_to_play', message_param, now())
  ON CONFLICT (user_id, club_id) 
  DO UPDATE SET 
    status = 'looking_to_play',
    availability_message = message_param,
    last_seen = now(),
    updated_at = now();

  result := json_build_object(
    'success', true,
    'message', 'You are now looking to play!'
  );

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.stop_looking_to_play(
  club_id_param uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Update member status to online
  UPDATE public.member_status
  SET 
    status = 'online',
    availability_message = NULL,
    last_seen = now(),
    updated_at = now()
  WHERE user_id = auth.uid() AND club_id = club_id_param;

  result := json_build_object(
    'success', true,
    'message', 'You are no longer looking to play'
  );

  RETURN result;
END;
$$;

-- 1.2 Auto-Join Link System
-- Add fields to support shareable links
ALTER TABLE public.club_invitations 
ADD COLUMN IF NOT EXISTS is_shareable_link boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS link_slug text;

-- Create unique constraint for link slugs
CREATE UNIQUE INDEX IF NOT EXISTS idx_club_invitations_link_slug 
ON public.club_invitations(link_slug) 
WHERE link_slug IS NOT NULL;

-- Function to create shareable club link
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
  link_slug_value text;
  invitation_record RECORD;
  result json;
BEGIN
  -- Check if user has permission to create invitations
  IF NOT EXISTS (
    SELECT 1 FROM public.club_memberships 
    WHERE club_id = club_id_param 
    AND user_id = auth.uid() 
    AND status = 'active'
    AND (
      role IN ('owner', 'admin') OR 
      ((permissions ->> 'can_invite')::boolean = true)
    )
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Permission denied'
    );
  END IF;

  -- Generate unique slug
  link_slug_value := UPPER(SUBSTRING(gen_random_uuid()::text, 1, 12));
  
  -- Create shareable invitation
  INSERT INTO public.club_invitations (
    club_id, inviter_id, invitee_email, is_shareable_link, 
    link_slug, max_uses, expires_at, is_active
  )
  VALUES (
    club_id_param, auth.uid(), 'shareable@link.com', true,
    link_slug_value, max_uses_param, 
    now() + (expires_days || ' days')::interval, true
  )
  RETURNING * INTO invitation_record;

  result := json_build_object(
    'success', true,
    'link_slug', link_slug_value,
    'invitation_id', invitation_record.id,
    'expires_at', invitation_record.expires_at,
    'share_url', '/join-club/' || link_slug_value
  );

  RETURN result;
END;
$$;

-- Function for auto-joining via link
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
    RETURN json_build_object(
      'success', false, 
      'error', 'Invalid or expired invitation link'
    );
  END IF;
  
  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM public.club_memberships 
    WHERE club_id = invitation_record.club_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  ) THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'You are already a member of this club'
    );
  END IF;
  
  -- Add user to club
  INSERT INTO public.club_memberships (club_id, user_id, role, status)
  VALUES (invitation_record.club_id, auth.uid(), 'member', 'active');
  
  -- Increment usage count
  UPDATE public.club_invitations
  SET uses_count = uses_count + 1,
      updated_at = now()
  WHERE id = invitation_record.id;
  
  -- Deactivate if max uses reached
  IF invitation_record.max_uses IS NOT NULL AND 
     invitation_record.uses_count + 1 >= invitation_record.max_uses THEN
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

-- 1.3 Update Club Defaults & Subscription Tiers
-- Remove 'Free' tier and ensure 'Community' is the default
DELETE FROM public.subscription_tiers WHERE id = 'free';

-- Update Community tier to be the default free tier
UPDATE public.subscription_tiers 
SET 
  name = 'Community',
  price_monthly = 0,
  token_allocation = 5000,
  features = ARRAY[
    'Basic club features',
    '5,000 tokens per month', 
    'Up to 50 members',
    '1 coach slot',
    'Community support',
    'Private club option'
  ]
WHERE id = 'community';

-- Update existing clubs that had 'free' tier
UPDATE public.clubs 
SET subscription_tier = 'community' 
WHERE subscription_tier = 'free' OR subscription_tier IS NULL;

-- Create function to get club invitation link info
CREATE OR REPLACE FUNCTION public.get_club_shareable_links(
  club_id_param uuid
)
RETURNS TABLE (
  id uuid,
  link_slug text,
  uses_count integer,
  max_uses integer,
  expires_at timestamptz,
  is_active boolean,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    ci.id,
    ci.link_slug,
    ci.uses_count,
    ci.max_uses,
    ci.expires_at,
    ci.is_active,
    ci.created_at
  FROM public.club_invitations ci
  WHERE ci.club_id = club_id_param
    AND ci.is_shareable_link = true
    AND ci.inviter_id = auth.uid()
  ORDER BY ci.created_at DESC;
$$;