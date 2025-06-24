
-- Create match_relationships table for tracking player match history
CREATE TABLE IF NOT EXISTS public.match_relationships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_1_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player_2_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_result text NOT NULL CHECK (match_result IN ('win', 'loss')),
  activity_log_id uuid REFERENCES public.activity_logs(id) ON DELETE SET NULL,
  match_type text NOT NULL CHECK (match_type IN ('singles', 'doubles')),
  created_at timestamp with time zone DEFAULT now(),
  
  -- Ensure we don't have duplicate relationships for the same match
  UNIQUE(player_1_id, player_2_id, activity_log_id)
);

-- Add RLS policies
ALTER TABLE public.match_relationships ENABLE ROW LEVEL SECURITY;

-- Players can view their own match relationships
CREATE POLICY "Users can view their own match relationships" ON public.match_relationships
  FOR SELECT USING (auth.uid() = player_1_id OR auth.uid() = player_2_id);

-- Players can insert their own match relationships
CREATE POLICY "Users can insert their own match relationships" ON public.match_relationships
  FOR INSERT WITH CHECK (auth.uid() = player_1_id);

-- Create indexes for performance
CREATE INDEX idx_match_relationships_player_1 ON public.match_relationships(player_1_id);
CREATE INDEX idx_match_relationships_player_2 ON public.match_relationships(player_2_id);
CREATE INDEX idx_match_relationships_activity_log ON public.match_relationships(activity_log_id);

-- Add columns to active_match_sessions for opponent IDs
ALTER TABLE public.active_match_sessions 
ADD COLUMN IF NOT EXISTS opponent_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS opponent_1_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS opponent_2_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
