-- Create open_sessions table for club sessions
CREATE TABLE public.open_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  club_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT NOT NULL DEFAULT 'casual',
  skill_level TEXT,
  max_participants INTEGER DEFAULT 4,
  current_participants INTEGER DEFAULT 1,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.open_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for open_sessions
CREATE POLICY "Club members can view open sessions"
ON public.open_sessions FOR SELECT
USING (
  club_id IN (
    SELECT club_id FROM club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Club members can create sessions"
ON public.open_sessions FOR INSERT
WITH CHECK (
  creator_id = auth.uid() AND
  club_id IN (
    SELECT club_id FROM club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Session creators can update their sessions"
ON public.open_sessions FOR UPDATE
USING (creator_id = auth.uid());

CREATE POLICY "Session creators can delete their sessions"
ON public.open_sessions FOR DELETE
USING (creator_id = auth.uid());