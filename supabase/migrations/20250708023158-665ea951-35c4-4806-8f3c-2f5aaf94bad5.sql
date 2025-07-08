-- Phase 5: Mobile-First Club Social Features Database Schema

-- Table for tracking member online status and play availability
CREATE TABLE public.member_status (
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

-- Table for tracking when members mark themselves as available to play
CREATE TABLE public.play_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  club_id UUID NOT NULL,
  available_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  available_until TIMESTAMP WITH TIME ZONE,
  preferred_session_type TEXT DEFAULT 'casual' CHECK (preferred_session_type IN ('casual', 'practice', 'lesson', 'tournament')),
  skill_level_min INTEGER,
  skill_level_max INTEGER,
  max_distance_km INTEGER DEFAULT 10,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matched', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for club activity stream (real-time feed)
CREATE TABLE public.club_activity_stream (
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
ALTER TABLE public.play_availability ENABLE ROW LEVEL SECURITY;
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

-- RLS Policies for play_availability
CREATE POLICY "Club members can view play availability"
ON public.play_availability FOR SELECT
USING (
  club_id IN (
    SELECT club_id FROM club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can manage their own availability"
ON public.play_availability FOR ALL
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
CREATE INDEX idx_member_status_club_user ON public.member_status(club_id, user_id);
CREATE INDEX idx_member_status_looking ON public.member_status(club_id, status) WHERE status = 'looking_to_play';
CREATE INDEX idx_play_availability_club_active ON public.play_availability(club_id, status) WHERE status = 'active';
CREATE INDEX idx_club_activity_stream_club_recent ON public.club_activity_stream(club_id, created_at DESC);

-- Function to update member last_seen timestamp
CREATE OR REPLACE FUNCTION public.update_member_last_seen(club_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.member_status (user_id, club_id, status, last_seen)
  VALUES (auth.uid(), club_id_param, 'online', now())
  ON CONFLICT (user_id, club_id)
  DO UPDATE SET 
    last_seen = now(),
    updated_at = now();
END;
$$;

-- Function to set play availability
CREATE OR REPLACE FUNCTION public.set_play_availability(
  club_id_param UUID,
  available_until_param TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  message_param TEXT DEFAULT NULL,
  session_type_param TEXT DEFAULT 'casual'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  availability_id UUID;
  result JSON;
BEGIN
  -- Cancel any existing active availability
  UPDATE public.play_availability 
  SET status = 'cancelled', updated_at = now()
  WHERE user_id = auth.uid() AND club_id = club_id_param AND status = 'active';
  
  -- Create new availability
  INSERT INTO public.play_availability (
    user_id, club_id, available_until, message, preferred_session_type
  )
  VALUES (
    auth.uid(), club_id_param, available_until_param, message_param, session_type_param
  )
  RETURNING id INTO availability_id;
  
  -- Update member status
  INSERT INTO public.member_status (user_id, club_id, status, availability_message, last_seen)
  VALUES (auth.uid(), club_id_param, 'looking_to_play', message_param, now())
  ON CONFLICT (user_id, club_id)
  DO UPDATE SET 
    status = 'looking_to_play',
    availability_message = message_param,
    last_seen = now(),
    updated_at = now();
  
  -- Add to activity stream
  INSERT INTO public.club_activity_stream (club_id, user_id, activity_type, activity_data)
  VALUES (
    club_id_param, 
    auth.uid(), 
    'looking_to_play',
    jsonb_build_object(
      'message', message_param,
      'session_type', session_type_param,
      'available_until', available_until_param
    )
  );
  
  result := json_build_object(
    'success', true,
    'availability_id', availability_id,
    'message', 'Looking to play status updated'
  );
  
  RETURN result;
END;
$$;