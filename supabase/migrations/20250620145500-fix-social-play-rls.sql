
-- Fix infinite recursion in social_play_participants RLS policies

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view participants in their sessions" ON public.social_play_participants;
DROP POLICY IF EXISTS "Users can insert participants" ON public.social_play_participants;
DROP POLICY IF EXISTS "Users can update their participation status" ON public.social_play_participants;
DROP POLICY IF EXISTS "Users can delete their participation" ON public.social_play_participants;

-- Create security definer function to check if user is session owner or participant
CREATE OR REPLACE FUNCTION public.user_can_access_session_participants(session_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Check if user is session creator
  IF EXISTS (
    SELECT 1 FROM public.social_play_sessions 
    WHERE id = session_id_param AND created_by = current_user_id
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user is a participant
  IF EXISTS (
    SELECT 1 FROM public.social_play_participants 
    WHERE session_id = session_id_param AND user_id = current_user_id
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create new RLS policies using the security definer function
CREATE POLICY "Users can view participants in accessible sessions"
  ON public.social_play_participants
  FOR SELECT
  USING (public.user_can_access_session_participants(session_id));

CREATE POLICY "Users can insert participants if they own the session"
  ON public.social_play_participants
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.social_play_sessions 
      WHERE id = session_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their own participation status"
  ON public.social_play_participants
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own participation"
  ON public.social_play_participants
  FOR DELETE
  USING (user_id = auth.uid());

-- Also ensure RLS is enabled
ALTER TABLE public.social_play_participants ENABLE ROW LEVEL SECURITY;

-- Add similar policies for social_play_sessions if needed
DROP POLICY IF EXISTS "Users can view their sessions" ON public.social_play_sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON public.social_play_sessions;
DROP POLICY IF EXISTS "Users can update their sessions" ON public.social_play_sessions;

CREATE POLICY "Users can view sessions they created or participate in"
  ON public.social_play_sessions
  FOR SELECT
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT session_id FROM public.social_play_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sessions"
  ON public.social_play_sessions
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update sessions they created"
  ON public.social_play_sessions
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

ALTER TABLE public.social_play_sessions ENABLE ROW LEVEL SECURITY;
