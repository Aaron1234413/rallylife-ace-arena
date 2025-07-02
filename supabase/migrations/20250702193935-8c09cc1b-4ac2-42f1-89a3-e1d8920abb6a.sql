-- Fix RLS policies and functions for sessions functionality

-- Clean up RLS policies for sessions table
DROP POLICY IF EXISTS "Users can view sessions they created or joined" ON public.sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.sessions;

-- Create simple, non-recursive RLS policies for sessions
CREATE POLICY "Users can view public sessions"
ON public.sessions
FOR SELECT
USING (is_private = false OR creator_id = auth.uid());

CREATE POLICY "Users can create sessions"
ON public.sessions
FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Session creators can update their sessions"
ON public.sessions
FOR UPDATE
USING (auth.uid() = creator_id);

CREATE POLICY "Session creators can delete their sessions"
ON public.sessions
FOR DELETE
USING (auth.uid() = creator_id);

-- Clean up RLS policies for session_participants table
DROP POLICY IF EXISTS "Users can join sessions" ON public.session_participants;
DROP POLICY IF EXISTS "Users can view session participants" ON public.session_participants;
DROP POLICY IF EXISTS "Users can update their participation" ON public.session_participants;
DROP POLICY IF EXISTS "Session creators can manage participants" ON public.session_participants;

-- Create simple, non-recursive RLS policies for session_participants
CREATE POLICY "Users can view session participants"
ON public.session_participants
FOR SELECT
USING (
  user_id = auth.uid() OR
  session_id IN (
    SELECT id FROM public.sessions WHERE creator_id = auth.uid()
  )
);

CREATE POLICY "Users can join sessions"
ON public.session_participants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
ON public.session_participants
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Session creators can manage participants"
ON public.session_participants
FOR ALL
USING (
  session_id IN (
    SELECT id FROM public.sessions WHERE creator_id = auth.uid()
  )
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'session_participants' 
                   AND column_name = 'left_at') THEN
        ALTER TABLE public.session_participants 
        ADD COLUMN left_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;