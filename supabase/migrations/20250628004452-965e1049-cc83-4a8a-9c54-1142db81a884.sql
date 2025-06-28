
-- First, let's ensure all necessary tables exist and have proper RLS policies

-- Check if player_profiles table exists, if not create it
CREATE TABLE IF NOT EXISTS public.player_profiles (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_level text CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  playing_style text,
  location text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on player_profiles
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for player_profiles
DROP POLICY IF EXISTS "Users can view player profiles" ON public.player_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.player_profiles;

CREATE POLICY "Users can view player profiles"
  ON public.player_profiles FOR SELECT
  USING (true); -- Allow all authenticated users to view player profiles

CREATE POLICY "Users can update their own profile"
  ON public.player_profiles FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Ensure player_xp table has proper RLS policies
DROP POLICY IF EXISTS "Users can view player XP" ON public.player_xp;
CREATE POLICY "Users can view player XP"
  ON public.player_xp FOR SELECT
  USING (true); -- Allow viewing XP for match analysis

-- Add a policy to allow users to manage their own XP
DROP POLICY IF EXISTS "Users can manage their own XP" ON public.player_xp;
CREATE POLICY "Users can manage their own XP"
  ON public.player_xp FOR ALL
  USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

-- Double-check that active_match_sessions policies are working
-- Sometimes there can be lingering issues
DROP POLICY IF EXISTS "Users can view their own match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can create their own match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can update their own match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can delete their own match sessions" ON public.active_match_sessions;

-- Recreate active_match_sessions policies
CREATE POLICY "Users can view their own match sessions"
  ON public.active_match_sessions FOR SELECT
  USING (player_id = auth.uid());

CREATE POLICY "Users can create their own match sessions"
  ON public.active_match_sessions FOR INSERT
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can update their own match sessions"
  ON public.active_match_sessions FOR UPDATE
  USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can delete their own match sessions"
  ON public.active_match_sessions FOR DELETE
  USING (player_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_player_profiles_id ON public.player_profiles(id);
CREATE INDEX IF NOT EXISTS idx_active_match_sessions_player_id ON public.active_match_sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_player_xp_player_id ON public.player_xp(player_id);
