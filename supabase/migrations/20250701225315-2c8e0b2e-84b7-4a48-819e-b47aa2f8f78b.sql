-- Phase 1: Foundation & Database Alignment Migration (Fixed)
-- Fix database schema inconsistencies and create unified invitation system

-- 1. Add missing 'role' column to social_play_participants table
ALTER TABLE public.social_play_participants 
ADD COLUMN role text DEFAULT 'player';

-- 2. Add missing foreign key relationships for data integrity
-- Foreign key from match_invitations to active_match_sessions (nullable, as sessions are created on acceptance)
ALTER TABLE public.match_invitations 
ADD CONSTRAINT fk_match_invitations_session 
FOREIGN KEY (match_session_id) REFERENCES public.active_match_sessions(id) ON DELETE SET NULL;

-- Foreign key from social_play_participants to social_play_sessions
ALTER TABLE public.social_play_participants 
ADD CONSTRAINT fk_social_participants_session 
FOREIGN KEY (session_id) REFERENCES public.social_play_sessions(id) ON DELETE CASCADE;

-- 3. Create indexes for better performance on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_match_invitations_invitee_status 
ON public.match_invitations(invitee_id, status);

CREATE INDEX IF NOT EXISTS idx_match_invitations_inviter_status 
ON public.match_invitations(inviter_id, status);

CREATE INDEX IF NOT EXISTS idx_match_invitations_category_status 
ON public.match_invitations(invitation_category, status);

CREATE INDEX IF NOT EXISTS idx_social_play_participants_session_user 
ON public.social_play_participants(session_id, user_id);

CREATE INDEX IF NOT EXISTS idx_social_play_sessions_creator_status 
ON public.social_play_sessions(created_by, status);

-- 4. Add proper constraints to ensure data consistency
-- Ensure invitation_category is properly constrained
ALTER TABLE public.match_invitations 
ADD CONSTRAINT chk_invitation_category 
CHECK (invitation_category IN ('match', 'social_play'));

-- Ensure social_play_participants status is constrained
ALTER TABLE public.social_play_participants 
ADD CONSTRAINT chk_participant_status 
CHECK (status IN ('invited', 'joined', 'declined', 'removed'));

-- Ensure social_play_participants role is constrained
ALTER TABLE public.social_play_participants 
ADD CONSTRAINT chk_participant_role 
CHECK (role IN ('creator', 'player', 'invited_player', 'partner', 'opponent'));

-- 5. Update RLS policies to ensure proper cross-table access
-- Drop and recreate policies for social_play_participants to allow proper access

DROP POLICY IF EXISTS "Users can access social play participants" ON public.social_play_participants;

-- Allow users to view participants in sessions they're part of
CREATE POLICY "Users can view social play participants" 
ON public.social_play_participants FOR SELECT
USING (
  user_id = auth.uid() OR 
  session_creator_id = auth.uid() OR 
  session_id IN (
    SELECT session_id 
    FROM public.social_play_participants 
    WHERE user_id = auth.uid()
  )
);

-- Allow users to insert themselves as participants
CREATE POLICY "Users can insert themselves as participants" 
ON public.social_play_participants FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Allow session creators and participants to update participant status
CREATE POLICY "Users can update social play participants" 
ON public.social_play_participants FOR UPDATE
USING (
  user_id = auth.uid() OR 
  session_creator_id = auth.uid()
);

-- 6. Clean up any orphaned data (optional safety measure)
-- Remove any match_invitations that reference non-existent sessions
DELETE FROM public.match_invitations 
WHERE match_session_id IS NOT NULL 
AND match_session_id NOT IN (
  SELECT id FROM public.active_match_sessions
  UNION 
  SELECT id FROM public.social_play_sessions
);

-- 7. Add helpful comments for future reference
COMMENT ON TABLE public.match_invitations IS 'Unified invitation system for both match and social play invitations. Uses invitation_category to distinguish types and match_session_id can reference either active_match_sessions or social_play_sessions.';

COMMENT ON COLUMN public.match_invitations.match_session_id IS 'Polymorphic reference: points to active_match_sessions.id when invitation_category=match, or social_play_sessions.id when invitation_category=social_play';

COMMENT ON COLUMN public.social_play_participants.role IS 'Participant role in social play session: creator, player, invited_player, partner, opponent';