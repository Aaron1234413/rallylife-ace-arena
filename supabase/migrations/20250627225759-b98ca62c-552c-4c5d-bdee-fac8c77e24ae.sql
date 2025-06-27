
-- Create a security definer function to get user sessions without recursion
CREATE OR REPLACE FUNCTION public.get_user_match_sessions(user_id UUID)
RETURNS SETOF public.active_match_sessions
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT * FROM public.active_match_sessions 
  WHERE player_id = user_id;
$$;

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view sessions they created" ON active_match_sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON active_match_sessions;
DROP POLICY IF EXISTS "Users can update sessions they created" ON active_match_sessions;
DROP POLICY IF EXISTS "Users can delete sessions they created" ON active_match_sessions;
DROP POLICY IF EXISTS "Sessions: owner updates session" ON active_match_sessions;
DROP POLICY IF EXISTS "Sessions: view own or participated" ON active_match_sessions;

-- Create simple policies using direct column access (no subqueries)
CREATE POLICY "match_sessions_select" ON active_match_sessions
  FOR SELECT USING (player_id = auth.uid());

CREATE POLICY "match_sessions_insert" ON active_match_sessions
  FOR INSERT WITH CHECK (player_id = auth.uid());

CREATE POLICY "match_sessions_update" ON active_match_sessions
  FOR UPDATE USING (player_id = auth.uid()) WITH CHECK (player_id = auth.uid());

CREATE POLICY "match_sessions_delete" ON active_match_sessions
  FOR DELETE USING (player_id = auth.uid());
