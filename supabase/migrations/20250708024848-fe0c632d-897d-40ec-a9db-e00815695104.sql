-- Create missing tables for club social features

-- Member status table for tracking who's online and looking to play
CREATE TABLE public.member_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  club_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'looking_to_play', 'in_session', 'offline')),
  location_lat DECIMAL,
  location_lng DECIMAL,
  looking_for_skill_level INTEGER,
  availability_message TEXT,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, club_id)
);

-- Open sessions table for club sessions
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
ALTER TABLE public.member_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for member_status
CREATE POLICY "Club members can view member status"
ON public.member_status FOR SELECT
USING (
  club_id IN (
    SELECT club_id FROM club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can insert their own status"
ON public.member_status FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own status"
ON public.member_status FOR UPDATE
USING (user_id = auth.uid());

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