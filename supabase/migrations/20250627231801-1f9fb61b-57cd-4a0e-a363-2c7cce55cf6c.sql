
-- Create match invitations table
CREATE TABLE IF NOT EXISTS public.match_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_session_id UUID REFERENCES public.active_match_sessions(id) ON DELETE CASCADE,
  inviter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_email TEXT,
  invitee_name TEXT NOT NULL,
  invitation_type TEXT NOT NULL DEFAULT 'match',
  message TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create match participants table (for tracking who joins matches)
CREATE TABLE IF NOT EXISTS public.match_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_session_id UUID REFERENCES public.active_match_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_name TEXT,
  participant_role TEXT DEFAULT 'player',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(match_session_id, user_id)
);

-- Add RLS policies
ALTER TABLE public.match_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;

-- Match invitations policies
CREATE POLICY "match_invitations_select" ON public.match_invitations
  FOR SELECT USING (inviter_id = auth.uid() OR invitee_id = auth.uid());

CREATE POLICY "match_invitations_insert" ON public.match_invitations
  FOR INSERT WITH CHECK (inviter_id = auth.uid());

CREATE POLICY "match_invitations_update" ON public.match_invitations
  FOR UPDATE USING (inviter_id = auth.uid() OR invitee_id = auth.uid());

-- Match participants policies
CREATE POLICY "match_participants_select" ON public.match_participants
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.active_match_sessions WHERE id = match_session_id AND player_id = auth.uid())
  );

CREATE POLICY "match_participants_insert" ON public.match_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_match_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER match_invitations_updated_at
  BEFORE UPDATE ON public.match_invitations
  FOR EACH ROW EXECUTE FUNCTION update_match_invitations_updated_at();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_match_invitations_invitee ON public.match_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_match_invitations_status ON public.match_invitations(status);
CREATE INDEX IF NOT EXISTS idx_match_participants_session ON public.match_participants(match_session_id);
