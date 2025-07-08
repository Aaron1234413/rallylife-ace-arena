-- Add privacy field to clubs (default private)
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT true;

-- Update existing clubs to be private by default
UPDATE public.clubs SET is_private = true WHERE is_private IS NULL;

-- Enhance club_invitations table for seamless invite system
ALTER TABLE public.club_invitations ADD COLUMN IF NOT EXISTS uses_count INTEGER DEFAULT 0;
ALTER TABLE public.club_invitations ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT 1;
ALTER TABLE public.club_invitations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for faster invitation lookups
CREATE INDEX IF NOT EXISTS idx_club_invitations_code_active ON public.club_invitations(invitation_code, is_active, expires_at);

-- Function to auto-join club via invitation
CREATE OR REPLACE FUNCTION public.join_club_via_invitation(invitation_code_param TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record RECORD;
  result JSON;
BEGIN
  -- Get invitation details
  SELECT * INTO invitation_record
  FROM public.club_invitations
  WHERE invitation_code = invitation_code_param
    AND is_active = true
    AND expires_at > now()
    AND (max_uses IS NULL OR uses_count < max_uses);
  
  IF invitation_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation code');
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