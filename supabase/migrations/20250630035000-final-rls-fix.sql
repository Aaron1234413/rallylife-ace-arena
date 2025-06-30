
-- Final comprehensive fix for active_match_sessions RLS policies
-- This addresses all remaining issues with infinite recursion and policy conflicts

-- First, disable RLS temporarily to clean up
ALTER TABLE public.active_match_sessions DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies completely
DROP POLICY IF EXISTS "Users can view their match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can view their own match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can insert their own match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can insert match sessions they participate in" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can create match sessions they participate in" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can update their own match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can update their match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can delete their own match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can delete their match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can view sessions where they are opponents" ON public.active_match_sessions;

-- Ensure the get_current_user_id function is properly defined
DROP FUNCTION IF EXISTS public.get_current_user_id();

CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

-- Re-enable RLS
ALTER TABLE public.active_match_sessions ENABLE ROW LEVEL SECURITY;

-- Create simplified, non-conflicting policies
-- Policy 1: SELECT - Users can view sessions they participate in
CREATE POLICY "match_sessions_select_policy" ON public.active_match_sessions
  FOR SELECT USING (
    player_id = public.get_current_user_id() OR
    opponent_id = public.get_current_user_id() OR
    partner_id = public.get_current_user_id() OR
    opponent_1_id = public.get_current_user_id() OR
    opponent_2_id = public.get_current_user_id()
  );

-- Policy 2: INSERT - Users can create sessions they participate in
CREATE POLICY "match_sessions_insert_policy" ON public.active_match_sessions
  FOR INSERT WITH CHECK (
    player_id = public.get_current_user_id() OR
    opponent_id = public.get_current_user_id() OR
    partner_id = public.get_current_user_id() OR
    opponent_1_id = public.get_current_user_id() OR
    opponent_2_id = public.get_current_user_id()
  );

-- Policy 3: UPDATE - Users can update sessions they participate in
CREATE POLICY "match_sessions_update_policy" ON public.active_match_sessions
  FOR UPDATE USING (
    player_id = public.get_current_user_id() OR
    opponent_id = public.get_current_user_id() OR
    partner_id = public.get_current_user_id() OR
    opponent_1_id = public.get_current_user_id() OR
    opponent_2_id = public.get_current_user_id()
  );

-- Policy 4: DELETE - Users can delete sessions they participate in
CREATE POLICY "match_sessions_delete_policy" ON public.active_match_sessions
  FOR DELETE USING (
    player_id = public.get_current_user_id() OR
    opponent_id = public.get_current_user_id() OR
    partner_id = public.get_current_user_id() OR
    opponent_1_id = public.get_current_user_id() OR
    opponent_2_id = public.get_current_user_id()
  );
