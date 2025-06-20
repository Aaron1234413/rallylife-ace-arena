
-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view sessions they've created or participate in" ON public.social_play_sessions;
DROP POLICY IF EXISTS "Users can view participants in sessions they're involved in" ON public.social_play_participants;
DROP POLICY IF EXISTS "Session creators can add participants" ON public.social_play_participants;

-- Add the denormalized column
ALTER TABLE public.social_play_participants 
ADD COLUMN IF NOT EXISTS session_creator_id UUID REFERENCES public.profiles(id);

-- Backfill existing data
UPDATE public.social_play_participants 
SET session_creator_id = (
  SELECT created_by 
  FROM public.social_play_sessions 
  WHERE id = session_id
)
WHERE session_creator_id IS NULL;

-- Make it NOT NULL after backfill
ALTER TABLE public.social_play_participants 
ALTER COLUMN session_creator_id SET NOT NULL;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view sessions they created"
  ON public.social_play_sessions FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can view participants they're involved with"
  ON public.social_play_participants FOR SELECT
  USING (
    user_id = auth.uid() 
    OR session_creator_id = auth.uid()
  );

CREATE POLICY "Session creators can add participants"
  ON public.social_play_participants FOR INSERT
  WITH CHECK (session_creator_id = auth.uid());

-- Trigger to automatically set session_creator_id for new participants
CREATE OR REPLACE FUNCTION public.set_session_creator_id()
RETURNS TRIGGER AS $$
BEGIN
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
