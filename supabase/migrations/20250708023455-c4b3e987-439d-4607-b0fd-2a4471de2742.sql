-- Phase 5: Mobile-First Club Social Features Database Schema (Part 1)
-- Only create tables that don't exist yet

-- Table for tracking member online status and play availability
CREATE TABLE IF NOT EXISTS public.member_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  club_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'looking_to_play', 'in_session', 'offline')),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  looking_for_skill_level INTEGER,
  availability_message TEXT,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, club_id)
);

-- Table for club activity stream (real-time feed)
CREATE TABLE IF NOT EXISTS public.club_activity_stream (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'member_joined', 'session_created', 'session_joined', 'looking_to_play', 
    'court_booked', 'achievement_unlocked', 'match_completed', 'coaching_session'
  )),
  activity_data JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.member_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_activity_stream ENABLE ROW LEVEL SECURITY;

-- RLS Policies for member_status
CREATE POLICY "Club members can view member status"
ON public.member_status FOR SELECT
USING (
  club_id IN (
    SELECT club_id FROM club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can manage their own status"
ON public.member_status FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for club_activity_stream
CREATE POLICY "Club members can view activity stream"
ON public.club_activity_stream FOR SELECT
USING (
  club_id IN (
    SELECT club_id FROM club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ) AND is_public = true
);

CREATE POLICY "Users can create activity entries"
ON public.club_activity_stream FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  club_id IN (
    SELECT club_id FROM club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_member_status_club_user ON public.member_status(club_id, user_id);
CREATE INDEX IF NOT EXISTS idx_member_status_looking ON public.member_status(club_id, status) WHERE status = 'looking_to_play';
CREATE INDEX IF NOT EXISTS idx_club_activity_stream_club_recent ON public.club_activity_stream(club_id, created_at DESC);