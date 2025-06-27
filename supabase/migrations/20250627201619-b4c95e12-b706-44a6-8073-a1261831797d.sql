
-- Phase 1: Enhanced Match Relationships & Shared Matches

-- Create match_invitations table for invitation flow
CREATE TABLE IF NOT EXISTS public.match_invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  match_session_id uuid NOT NULL REFERENCES public.active_match_sessions(id) ON DELETE CASCADE,
  inviter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE, -- null for external players
  invitee_name text NOT NULL, -- name regardless of internal/external
  invitee_email text, -- optional for external players
  invitation_type text NOT NULL CHECK (invitation_type IN ('singles_opponent', 'doubles_partner', 'doubles_opponent_1', 'doubles_opponent_2')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  message text,
  expires_at timestamp with time zone DEFAULT (now() + INTERVAL '24 hours'),
  responded_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create match_participants table to track all players in a match
CREATE TABLE IF NOT EXISTS public.match_participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  match_session_id uuid NOT NULL REFERENCES public.active_match_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE, -- null for external players
  participant_name text NOT NULL,
  participant_role text NOT NULL CHECK (participant_role IN ('creator', 'opponent', 'partner', 'opponent_1', 'opponent_2')),
  is_external boolean DEFAULT false, -- true for non-app users
  can_edit_score boolean DEFAULT false, -- permission to edit match scores
  joined_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for match_invitations
ALTER TABLE public.match_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invitations sent to them or by them" ON public.match_invitations
  FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

CREATE POLICY "Users can insert their own invitations" ON public.match_invitations
  FOR INSERT WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update invitations sent to them" ON public.match_invitations
  FOR UPDATE USING (auth.uid() = invitee_id);

-- Add RLS policies for match_participants
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;

-- Users can view participants in matches they're part of
CREATE POLICY "Users can view participants in their matches" ON public.match_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.match_participants mp2 
      WHERE mp2.match_session_id = match_participants.match_session_id 
      AND mp2.user_id = auth.uid()
    )
  );

CREATE POLICY "Match creators can insert participants" ON public.match_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.active_match_sessions ams 
      WHERE ams.id = match_session_id 
      AND ams.player_id = auth.uid()
    )
  );

-- Update active_match_sessions RLS to allow participants to view
CREATE POLICY "Match participants can view sessions" ON public.active_match_sessions
  FOR SELECT USING (
    player_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.match_participants mp 
      WHERE mp.match_session_id = id 
      AND mp.user_id = auth.uid()
    )
  );

-- Allow participants to update match sessions (with restrictions)
CREATE POLICY "Match participants can update sessions" ON public.active_match_sessions
  FOR UPDATE USING (
    player_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.match_participants mp 
      WHERE mp.match_session_id = id 
      AND mp.user_id = auth.uid() 
      AND mp.can_edit_score = true
    )
  );

-- Create indexes for performance
CREATE INDEX idx_match_invitations_invitee ON public.match_invitations(invitee_id);
CREATE INDEX idx_match_invitations_inviter ON public.match_invitations(inviter_id);
CREATE INDEX idx_match_invitations_match_session ON public.match_invitations(match_session_id);
CREATE INDEX idx_match_participants_user ON public.match_participants(user_id);
CREATE INDEX idx_match_participants_match_session ON public.match_participants(match_session_id);

-- Add updated_at trigger for match_invitations
CREATE OR REPLACE FUNCTION update_match_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_match_invitations_updated_at
  BEFORE UPDATE ON public.match_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_match_invitations_updated_at();
