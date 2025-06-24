
-- Create active_match_sessions table for persistent match tracking
CREATE TABLE IF NOT EXISTS public.active_match_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Match setup data
  opponent_name text NOT NULL,
  is_doubles boolean DEFAULT false,
  partner_name text,
  opponent_1_name text,
  opponent_2_name text,
  match_type text NOT NULL CHECK (match_type IN ('singles', 'doubles')),
  
  -- Session state
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  current_set integer NOT NULL DEFAULT 0,
  sets jsonb NOT NULL DEFAULT '[]'::jsonb,
  
  -- Timing
  start_time timestamp with time zone NOT NULL,
  pause_start_time timestamp with time zone,
  total_paused_duration integer DEFAULT 0, -- in seconds
  completed_at timestamp with time zone,
  
  -- Mid-match data
  mid_match_mood text,
  mid_match_notes text,
  
  -- Final match data (filled when completed)
  final_score text,
  end_mood text,
  match_notes text,
  result text CHECK (result IN ('win', 'loss') OR result IS NULL),
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.active_match_sessions ENABLE ROW LEVEL SECURITY;

-- Players can only see their own match sessions
CREATE POLICY "Users can view their own match sessions" ON public.active_match_sessions
  FOR SELECT USING (auth.uid() = player_id);

-- Players can insert their own match sessions
CREATE POLICY "Users can insert their own match sessions" ON public.active_match_sessions
  FOR INSERT WITH CHECK (auth.uid() = player_id);

-- Players can update their own match sessions
CREATE POLICY "Users can update their own match sessions" ON public.active_match_sessions
  FOR UPDATE USING (auth.uid() = player_id);

-- Players can delete their own match sessions
CREATE POLICY "Users can delete their own match sessions" ON public.active_match_sessions
  FOR DELETE USING (auth.uid() = player_id);

-- Create indexes for performance
CREATE INDEX idx_active_match_sessions_player_id ON public.active_match_sessions(player_id);
CREATE INDEX idx_active_match_sessions_status ON public.active_match_sessions(status);
CREATE INDEX idx_active_match_sessions_start_time ON public.active_match_sessions(start_time);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_active_match_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_active_match_sessions_updated_at
  BEFORE UPDATE ON public.active_match_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_active_match_sessions_updated_at();
