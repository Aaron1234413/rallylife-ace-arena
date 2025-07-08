-- Phase 1: Database Schema Updates for Club Session Integration

-- First, let's check if sessions table exists and add club association
DO $$ 
BEGIN
  -- Add club_id column to sessions table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'sessions' AND column_name = 'club_id') THEN
    ALTER TABLE public.sessions ADD COLUMN club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE;
  END IF;
  
  -- Add session_source column to distinguish session types
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'sessions' AND column_name = 'session_source') THEN
    ALTER TABLE public.sessions ADD COLUMN session_source TEXT NOT NULL DEFAULT 'member';
  END IF;
  
  -- Add constraint for session_source values
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                 WHERE constraint_name = 'sessions_session_source_check') THEN
    ALTER TABLE public.sessions ADD CONSTRAINT sessions_session_source_check 
    CHECK (session_source IN ('member', 'coach', 'club_service', 'organizer'));
  END IF;
END $$;

-- Create index for efficient club session queries
CREATE INDEX IF NOT EXISTS idx_sessions_club_id ON public.sessions(club_id);
CREATE INDEX IF NOT EXISTS idx_sessions_club_source ON public.sessions(club_id, session_source);

-- Update RLS policies for club session access
DROP POLICY IF EXISTS "Club members can view club sessions" ON public.sessions;
CREATE POLICY "Club members can view club sessions" 
ON public.sessions 
FOR SELECT 
USING (
  club_id IS NULL OR -- Allow viewing general sessions (non-club)
  club_id IN (
    SELECT club_id 
    FROM public.club_memberships 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Allow club members to create sessions in their clubs
DROP POLICY IF EXISTS "Club members can create club sessions" ON public.sessions;
CREATE POLICY "Club members can create club sessions"
ON public.sessions
FOR INSERT
WITH CHECK (
  (creator_id = auth.uid()) AND -- User creating their own session
  (
    club_id IS NULL OR -- General session (non-club)
    club_id IN (
      SELECT club_id 
      FROM public.club_memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  )
);

-- Allow session creators and club members to update club sessions
DROP POLICY IF EXISTS "Session creators and club members can update sessions" ON public.sessions;
CREATE POLICY "Session creators and club members can update sessions"
ON public.sessions
FOR UPDATE
USING (
  creator_id = auth.uid() OR -- Session creator
  (
    club_id IS NOT NULL AND 
    club_id IN (
      SELECT club_id 
      FROM public.club_memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active'
      AND role IN ('owner', 'admin', 'moderator')
    )
  )
)
WITH CHECK (
  creator_id = auth.uid() OR -- Session creator
  (
    club_id IS NOT NULL AND 
    club_id IN (
      SELECT club_id 
      FROM public.club_memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active'
      AND role IN ('owner', 'admin', 'moderator')
    )
  )
);

-- Add updated_at trigger for sessions table
CREATE OR REPLACE FUNCTION public.update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sessions_updated_at ON public.sessions;
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sessions_updated_at();