
-- Enable RLS on the tables
ALTER TABLE public.active_match_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;

-- CREATE SELECT policy on match_invitations so invitees and inviters can see their rows
CREATE POLICY "Invitations: participants or creators can view"
  ON public.match_invitations FOR SELECT
  USING (
    invitee_id = auth.uid() OR
    inviter_id = auth.uid()
  );

-- CREATE INSERT policy on match_invitations so only authenticated users may send invites
CREATE POLICY "Invitations: send own invites"
  ON public.match_invitations FOR INSERT
  WITH CHECK (inviter_id = auth.uid());

-- CREATE UPDATE policy on match_invitations to let invitees accept/decline
CREATE POLICY "Invitations: respond to invites"
  ON public.match_invitations FOR UPDATE
  USING (invitee_id = auth.uid())
  WITH CHECK (invitee_id = auth.uid());

-- CREATE SELECT policy on match_participants so session owners or participants can view
CREATE POLICY "Participants: view own or owned session"
  ON public.match_participants FOR SELECT
  USING (
    user_id = auth.uid()
    OR match_session_id IN (
      SELECT id FROM public.active_match_sessions WHERE player_id = auth.uid()
    )
  );

-- CREATE INSERT policy on match_participants so only session owners can add
CREATE POLICY "Participants: owner adds participants"
  ON public.match_participants FOR INSERT
  WITH CHECK (
    match_session_id IN (
      SELECT id FROM public.active_match_sessions WHERE player_id = auth.uid()
    )
  );

-- CREATE UPDATE policy on active_match_sessions so only session owner may change status
CREATE POLICY "Sessions: owner updates session"
  ON public.active_match_sessions FOR UPDATE
  USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

-- CREATE SELECT policy on active_match_sessions so owners and participants can list
CREATE POLICY "Sessions: view own or participated"
  ON public.active_match_sessions FOR SELECT
  USING (
    player_id = auth.uid()
    OR id IN (
      SELECT match_session_id FROM public.match_participants WHERE user_id = auth.uid()
    )
  );
