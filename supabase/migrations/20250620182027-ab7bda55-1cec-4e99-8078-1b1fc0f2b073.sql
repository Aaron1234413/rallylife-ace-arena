
-- Drop existing SELECT policies on social_play_participants
DROP POLICY IF EXISTS "Users can view participants in sessions they're involved in" ON public.social_play_participants;
DROP POLICY IF EXISTS "Users can view participants in their sessions" ON public.social_play_participants;

-- Drop existing SELECT policies on social_play_sessions  
DROP POLICY IF EXISTS "Users can view sessions they created or participate in" ON public.social_play_sessions;
DROP POLICY IF EXISTS "Users can view sessions they participate in" ON public.social_play_sessions;

-- Create new SELECT policy on social_play_participants
CREATE POLICY "Users can view participants in sessions they own or participate in"
  ON public.social_play_participants FOR SELECT
  USING (
    user_id = auth.uid()
    OR session_id IN (
      SELECT id
      FROM public.social_play_sessions
      WHERE created_by = auth.uid()
    )
  );

-- Create new SELECT policy on social_play_sessions
CREATE POLICY "Users can view sessions they created or participate in"
  ON public.social_play_sessions FOR SELECT
  USING (
    created_by = auth.uid()
    OR id IN (
      SELECT session_id
      FROM public.social_play_participants
      WHERE user_id = auth.uid()
    )
  );
