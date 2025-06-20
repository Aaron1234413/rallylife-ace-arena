
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view participants in sessions they own or participate in" ON public.social_play_participants;
DROP POLICY IF EXISTS "Users can view sessions they created or participate in" ON public.social_play_sessions;

-- Create security definer functions to check permissions without triggering RLS
CREATE OR REPLACE FUNCTION public.user_owns_session(session_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.social_play_sessions 
    WHERE id = session_id AND created_by = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.user_participates_in_session(session_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.social_play_participants 
    WHERE session_id = session_id AND user_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.user_owns_or_participates_in_session(session_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.social_play_sessions 
    WHERE id = session_id AND created_by = auth.uid()
  ) OR EXISTS(
    SELECT 1 FROM public.social_play_participants 
    WHERE session_id = session_id AND user_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create new non-recursive policies using the security definer functions
CREATE POLICY "Users can view participants in sessions they're involved in"
  ON public.social_play_participants FOR SELECT
  USING (
    user_id = auth.uid() 
    OR public.user_owns_session(session_id)
  );

CREATE POLICY "Users can view sessions they created or participate in"
  ON public.social_play_sessions FOR SELECT
  USING (
    created_by = auth.uid() 
    OR public.user_participates_in_session(id)
  );
