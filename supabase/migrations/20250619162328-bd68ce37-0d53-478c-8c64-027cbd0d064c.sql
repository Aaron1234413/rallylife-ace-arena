
-- Create friends/connections table for user relationships
CREATE TABLE public.user_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id) NOT NULL,
  addressee_id UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- Create social play sessions table
CREATE TABLE public.social_play_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('singles', 'doubles')),
  competitive_level TEXT NOT NULL DEFAULT 'medium' CHECK (competitive_level IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'cancelled')),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  paused_duration INTEGER DEFAULT 0, -- Total paused time in seconds
  location TEXT,
  notes TEXT,
  final_score TEXT,
  mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session participants table
CREATE TABLE public.social_play_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.social_play_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'joined')),
  joined_at TIMESTAMP WITH TIME ZONE,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Create session check-ins table for mid-session mood updates
CREATE TABLE public.social_play_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.social_play_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  mood_emoji TEXT NOT NULL,
  notes TEXT,
  checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_play_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_play_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_play_checkins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_connections
CREATE POLICY "Users can view their own connections" 
  ON public.user_connections 
  FOR SELECT 
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create connection requests" 
  ON public.user_connections 
  FOR INSERT 
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their connection status" 
  ON public.user_connections 
  FOR UPDATE 
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- RLS Policies for social_play_sessions
CREATE POLICY "Users can view sessions they're involved in" 
  ON public.social_play_sessions 
  FOR SELECT 
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM public.social_play_participants 
      WHERE session_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own sessions" 
  ON public.social_play_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Session creators and participants can update sessions" 
  ON public.social_play_sessions 
  FOR UPDATE 
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM public.social_play_participants 
      WHERE session_id = id AND user_id = auth.uid() AND status = 'joined'
    )
  );

-- RLS Policies for social_play_participants
CREATE POLICY "Users can view participants of sessions they're involved in" 
  ON public.social_play_participants 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.social_play_sessions s 
      WHERE s.id = session_id AND (
        s.created_by = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.social_play_participants p2 
          WHERE p2.session_id = s.id AND p2.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Session creators can add participants" 
  ON public.social_play_participants 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.social_play_sessions 
      WHERE id = session_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their own participant status" 
  ON public.social_play_participants 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for social_play_checkins
CREATE POLICY "Users can view check-ins for sessions they're in" 
  ON public.social_play_checkins 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.social_play_participants 
      WHERE session_id = social_play_checkins.session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can create check-ins" 
  ON public.social_play_checkins 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.social_play_participants 
      WHERE session_id = social_play_checkins.session_id AND user_id = auth.uid() AND status = 'joined'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_user_connections_requester ON public.user_connections(requester_id);
CREATE INDEX idx_user_connections_addressee ON public.user_connections(addressee_id);
CREATE INDEX idx_social_play_sessions_created_by ON public.social_play_sessions(created_by);
CREATE INDEX idx_social_play_participants_session ON public.social_play_participants(session_id);
CREATE INDEX idx_social_play_participants_user ON public.social_play_participants(user_id);
CREATE INDEX idx_social_play_checkins_session ON public.social_play_checkins(session_id);
