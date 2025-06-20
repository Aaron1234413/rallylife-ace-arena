
-- Drop all existing social play policies and functions
DROP POLICY IF EXISTS "Users can view participants in their involvement" ON public.social_play_participants;
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.social_play_sessions;
DROP POLICY IF EXISTS "Session creators can add participants" ON public.social_play_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.social_play_participants;

DROP TRIGGER IF EXISTS set_session_creator_id_trigger ON public.social_play_participants;
DROP FUNCTION IF EXISTS public.set_session_creator_id();

-- Remove the session_creator_id column we just added (it's causing issues)
ALTER TABLE public.social_play_participants DROP COLUMN IF EXISTS session_creator_id;

-- Create a simple access control table
CREATE TABLE IF NOT EXISTS public.social_play_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  session_id UUID NOT NULL REFERENCES public.social_play_sessions(id),
  access_type TEXT NOT NULL CHECK (access_type IN ('owner', 'participant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, session_id)
);

-- Enable RLS on the access table
ALTER TABLE public.social_play_access ENABLE ROW LEVEL SECURITY;

-- Simple policy: users can only see their own access records
CREATE POLICY "Users can view their own access records"
  ON public.social_play_access FOR SELECT
  USING (user_id = auth.uid());

-- Now create simple policies using only the access table
CREATE POLICY "Users can view sessions they have access to"
  ON public.social_play_sessions FOR SELECT
  USING (
    id IN (
      SELECT session_id 
      FROM public.social_play_access 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view participants for sessions they have access to"
  ON public.social_play_participants FOR SELECT
  USING (
    session_id IN (
      SELECT session_id 
      FROM public.social_play_access 
      WHERE user_id = auth.uid()
    )
  );

-- Allow session owners to create sessions
CREATE POLICY "Users can create their own sessions"
  ON public.social_play_sessions FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Allow session owners to add participants
CREATE POLICY "Users can add participants to sessions they own"
  ON public.social_play_participants FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT session_id 
      FROM public.social_play_access 
      WHERE user_id = auth.uid() AND access_type = 'owner'
    )
  );

-- Allow users to update their own participation
CREATE POLICY "Users can update their own participation"
  ON public.social_play_participants FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to automatically create access records when sessions or participants are created
CREATE OR REPLACE FUNCTION public.create_social_play_access()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'social_play_sessions' THEN
    -- Give the session creator owner access
    INSERT INTO public.social_play_access (user_id, session_id, access_type)
    VALUES (NEW.created_by, NEW.id, 'owner')
    ON CONFLICT (user_id, session_id) DO NOTHING;
    
  ELSIF TG_TABLE_NAME = 'social_play_participants' THEN
    -- Give the participant access
    INSERT INTO public.social_play_access (user_id, session_id, access_type)
    VALUES (NEW.user_id, NEW.session_id, 'participant')
    ON CONFLICT (user_id, session_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic access record creation
CREATE TRIGGER social_play_sessions_access_trigger
  AFTER INSERT ON public.social_play_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_social_play_access();

CREATE TRIGGER social_play_participants_access_trigger
  AFTER INSERT ON public.social_play_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.create_social_play_access();

-- Populate existing access records
INSERT INTO public.social_play_access (user_id, session_id, access_type)
SELECT DISTINCT created_by, id, 'owner'
FROM public.social_play_sessions
ON CONFLICT (user_id, session_id) DO NOTHING;

INSERT INTO public.social_play_access (user_id, session_id, access_type)
SELECT DISTINCT user_id, session_id, 'participant'
FROM public.social_play_participants
ON CONFLICT (user_id, session_id) DO NOTHING;
