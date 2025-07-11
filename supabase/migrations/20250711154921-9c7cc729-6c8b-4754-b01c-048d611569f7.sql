-- Fix court booking relationships and invitation constraints

-- Add foreign key relationship for club_court_bookings to profiles
ALTER TABLE public.club_court_bookings 
ADD CONSTRAINT fk_club_court_bookings_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update club_invitations to allow multiple pending invitations for same email
-- but only one accepted invitation per club-email combination
DROP INDEX IF EXISTS club_invitations_club_id_invitee_email_key;

-- Create a partial unique index that only applies to accepted invitations
CREATE UNIQUE INDEX club_invitations_club_email_accepted_unique 
ON public.club_invitations (club_id, invitee_email) 
WHERE status = 'accepted';

-- Allow multiple pending invitations but prevent spam
CREATE UNIQUE INDEX club_invitations_club_email_pending_unique 
ON public.club_invitations (club_id, invitee_email) 
WHERE status = 'pending' AND is_active = true;