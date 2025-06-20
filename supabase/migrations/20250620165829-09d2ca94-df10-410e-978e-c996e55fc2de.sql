
-- Create security definer function to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing policies on social_play_sessions
DROP POLICY IF EXISTS "Users can view sessions they participate in" ON public.social_play_sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON public.social_play_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.social_play_sessions;
DROP POLICY IF EXISTS "Session creators can update sessions" ON public.social_play_sessions;
DROP POLICY IF EXISTS "Users can view sessions they created or participate in" ON public.social_play_sessions;

-- Drop existing policies on social_play_participants
DROP POLICY IF EXISTS "Users can view participants in their sessions" ON public.social_play_participants;
DROP POLICY IF EXISTS "Users can join sessions" ON public.social_play_participants;
DROP POLICY IF EXISTS "Users can update their participation status" ON public.social_play_participants;
DROP POLICY IF EXISTS "Session creators can add participants" ON public.social_play_participants;
DROP POLICY IF EXISTS "Users can view participants in sessions they're involved in" ON public.social_play_participants;
DROP POLICY IF EXISTS "Users can update their own participation status" ON public.social_play_participants;

-- Social Play Sessions Policies
CREATE POLICY "Users can view sessions they created or participate in"
  ON public.social_play_sessions FOR SELECT
  USING (
    created_by = public.get_current_user_id() OR
    id IN (
      SELECT session_id 
      FROM public.social_play_participants 
      WHERE user_id = public.get_current_user_id()
    )
  );

CREATE POLICY "Users can create sessions"
  ON public.social_play_sessions FOR INSERT
  WITH CHECK (created_by = public.get_current_user_id());

CREATE POLICY "Session creators can update their sessions"
  ON public.social_play_sessions FOR UPDATE
  USING (created_by = public.get_current_user_id())
  WITH CHECK (created_by = public.get_current_user_id());

-- Social Play Participants Policies
CREATE POLICY "Users can view participants in sessions they're involved in"
  ON public.social_play_participants FOR SELECT
  USING (
    user_id = public.get_current_user_id() OR
    session_id IN (
      SELECT id FROM public.social_play_sessions 
      WHERE created_by = public.get_current_user_id()
    ) OR
    session_id IN (
      SELECT session_id FROM public.social_play_participants 
      WHERE user_id = public.get_current_user_id()
    )
  );

CREATE POLICY "Session creators can add participants"
  ON public.social_play_participants FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.social_play_sessions 
      WHERE created_by = public.get_current_user_id()
    )
  );

CREATE POLICY "Users can update their own participation status"
  ON public.social_play_participants FOR UPDATE
  USING (user_id = public.get_current_user_id())
  WITH CHECK (user_id = public.get_current_user_id());
