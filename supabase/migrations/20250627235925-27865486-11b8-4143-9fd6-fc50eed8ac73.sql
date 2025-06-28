
-- Fix infinite recursion in RLS policies by removing circular dependencies
-- and using security definer functions instead

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Sessions: view own or participated" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Participants: view own or owned session" ON public.match_participants;
DROP POLICY IF EXISTS "Participants: owner adds participants" ON public.match_participants;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.user_owns_match_session(session_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.active_match_sessions 
    WHERE id = session_id AND player_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.user_participates_in_match_session(session_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.match_participants 
    WHERE match_session_id = session_id AND user_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create new non-recursive policies using the security definer functions
CREATE POLICY "Sessions: owner views own sessions"
  ON public.active_match_sessions FOR SELECT
  USING (player_id = auth.uid());

CREATE POLICY "Sessions: participants view joined sessions"
  ON public.active_match_sessions FOR SELECT
  USING (public.user_participates_in_match_session(id));

CREATE POLICY "Participants: view own participation"
  ON public.match_participants FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Participants: view session owner's participants"
  ON public.match_participants FOR SELECT
  USING (public.user_owns_match_session(match_session_id));

CREATE POLICY "Participants: join sessions"
  ON public.match_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Participants: session owner adds participants"
  ON public.match_participants FOR INSERT
  WITH CHECK (public.user_owns_match_session(match_session_id));
