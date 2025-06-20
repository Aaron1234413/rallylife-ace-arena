
-- Drop existing problematic policies and functions
DROP POLICY IF EXISTS "Users can view participants in sessions they're involved in" ON public.social_play_participants;
DROP POLICY IF EXISTS "Users can view sessions they created or participate in" ON public.social_play_sessions;

DROP FUNCTION IF EXISTS public.user_owns_session(UUID);
DROP FUNCTION IF EXISTS public.user_participates_in_session(UUID);
DROP FUNCTION IF EXISTS public.user_owns_or_participates_in_session(UUID);

-- Add session_creator_id to participants table for denormalization
ALTER TABLE public.social_play_participants 
ADD COLUMN IF NOT EXISTS session_creator_id UUID REFERENCES public.profiles(id);

-- Populate existing data with session creator IDs
UPDATE public.social_play_participants 
SET session_creator_id = (
  SELECT created_by 
  FROM public.social_play_sessions 
  WHERE id = session_id
)
WHERE session_creator_id IS NULL;

-- Make the column NOT NULL after populating data
ALTER TABLE public.social_play_participants 
ALTER COLUMN session_creator_id SET NOT NULL;

-- Create simple, non-recursive policies

-- Participants table: users can see records where they are the participant OR the session creator
CREATE POLICY "Users can view participants in their involvement"
  ON public.social_play_participants FOR SELECT
  USING (
    user_id = auth.uid() 
    OR session_creator_id = auth.uid()
  );

-- Sessions table: users can only see sessions they created
-- (participants will get session details through the participants table relationship)
CREATE POLICY "Users can view their own sessions"
  ON public.social_play_sessions FOR SELECT
  USING (created_by = auth.uid());

-- Allow users to create participant records for sessions they own
CREATE POLICY "Session creators can add participants"
  ON public.social_play_participants FOR INSERT
  WITH CHECK (session_creator_id = auth.uid());

-- Allow users to update their own participation status
CREATE POLICY "Users can update their own participation"
  ON public.social_play_participants FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create trigger to automatically set session_creator_id for new participants
CREATE OR REPLACE FUNCTION public.set_session_creator_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Set the session_creator_id from the corresponding session
  NEW.session_creator_id := (
    SELECT created_by 
    FROM public.social_play_sessions 
    WHERE id = NEW.session_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_session_creator_id_trigger
  BEFORE INSERT ON public.social_play_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.set_session_creator_id();
