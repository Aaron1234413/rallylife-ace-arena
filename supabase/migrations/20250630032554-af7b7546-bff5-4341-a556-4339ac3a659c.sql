
-- Fix infinite recursion in active_match_sessions RLS policies
-- The issue is that policies are likely referencing the same table they're protecting

-- First, drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can insert their own match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can update their own match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can delete their own match sessions" ON public.active_match_sessions;

-- Create a security definer function to safely check user permissions
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

-- Create new non-recursive policies using the security definer function
CREATE POLICY "Users can view their own match sessions" ON public.active_match_sessions
  FOR SELECT USING (player_id = public.get_current_user_id());

CREATE POLICY "Users can insert their own match sessions" ON public.active_match_sessions
  FOR INSERT WITH CHECK (player_id = public.get_current_user_id());

CREATE POLICY "Users can update their own match sessions" ON public.active_match_sessions
  FOR UPDATE USING (player_id = public.get_current_user_id());

CREATE POLICY "Users can delete their own match sessions" ON public.active_match_sessions
  FOR DELETE USING (player_id = public.get_current_user_id());

-- Also allow match participants to view sessions where they are opponents
CREATE POLICY "Users can view sessions where they are opponents" ON public.active_match_sessions
  FOR SELECT USING (
    opponent_id = public.get_current_user_id() OR
    partner_id = public.get_current_user_id() OR
    opponent_1_id = public.get_current_user_id() OR
    opponent_2_id = public.get_current_user_id()
  );
