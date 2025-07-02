-- Phase 1: Create sessions table with wellbeing session type support

-- Create session_type enum with wellbeing included
CREATE TYPE session_type AS ENUM ('match', 'social_play', 'training', 'wellbeing');

-- Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  session_type session_type NOT NULL,
  format TEXT CHECK (format IN ('singles', 'doubles')),
  max_players INTEGER NOT NULL DEFAULT 2,
  stakes_amount INTEGER NOT NULL DEFAULT 0,
  location TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
  is_private BOOLEAN NOT NULL DEFAULT false,
  invitation_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session_participants table
CREATE TABLE IF NOT EXISTS public.session_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'joined' CHECK (status IN ('joined', 'left', 'kicked')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for sessions
CREATE POLICY "Anyone can view public sessions" ON public.sessions
  FOR SELECT USING (NOT is_private OR creator_id = auth.uid());

CREATE POLICY "Users can create sessions" ON public.sessions
  FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update their sessions" ON public.sessions
  FOR UPDATE USING (creator_id = auth.uid());

CREATE POLICY "Creators can delete their sessions" ON public.sessions
  FOR DELETE USING (creator_id = auth.uid());

-- RLS policies for session_participants
CREATE POLICY "Users can view participants in sessions they have access to" ON public.session_participants
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM public.sessions 
      WHERE NOT is_private OR creator_id = auth.uid() OR id IN (
        SELECT session_id FROM public.session_participants WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can join sessions" ON public.session_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation" ON public.session_participants
  FOR UPDATE USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_sessions_session_type ON public.sessions(session_type);
CREATE INDEX idx_sessions_status ON public.sessions(status);
CREATE INDEX idx_sessions_creator_id ON public.sessions(creator_id);
CREATE INDEX idx_session_participants_session_id ON public.session_participants(session_id);
CREATE INDEX idx_session_participants_user_id ON public.session_participants(user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_participants_updated_at
  BEFORE UPDATE ON public.session_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();