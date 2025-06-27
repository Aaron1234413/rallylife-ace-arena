
-- Fix the infinite recursion in active_match_sessions RLS policies
-- Drop existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view their own active sessions" ON active_match_sessions;
DROP POLICY IF EXISTS "Users can create their own sessions" ON active_match_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON active_match_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON active_match_sessions;
DROP POLICY IF EXISTS "Sessions: owner updates session" ON active_match_sessions;
DROP POLICY IF EXISTS "Sessions: view own or participated" ON active_match_sessions;

-- Create simple, non-recursive policies using the correct column name
CREATE POLICY "Users can view sessions they created" 
  ON active_match_sessions 
  FOR SELECT 
  USING (auth.uid() = player_id);

CREATE POLICY "Users can create sessions" 
  ON active_match_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can update sessions they created" 
  ON active_match_sessions 
  FOR UPDATE 
  USING (auth.uid() = player_id);

CREATE POLICY "Users can delete sessions they created" 
  ON active_match_sessions 
  FOR DELETE 
  USING (auth.uid() = player_id);
