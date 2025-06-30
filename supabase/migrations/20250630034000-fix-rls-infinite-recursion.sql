
-- Complete fix for RLS infinite recursion in active_match_sessions
-- The issue is that policies are causing infinite loops when trying to access the same table

-- First, completely drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can insert their own match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can insert match sessions they participate in" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can update their own match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can delete their own match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can view sessions where they are opponents" ON public.active_match_sessions;

-- Ensure we have a clean security definer function
DROP FUNCTION IF EXISTS public.get_current_user_id();

CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

-- Create simplified, non-recursive policies
-- SELECT policy: Allow users to see sessions they participate in
CREATE POLICY "Users can view their match sessions" ON public.active_match_sessions
  FOR SELECT USING (
    player_id = public.get_current_user_id() OR
    opponent_id = public.get_current_user_id() OR
    partner_id = public.get_current_user_id() OR
    opponent_1_id = public.get_current_user_id() OR
    opponent_2_id = public.get_current_user_id()
  );

-- INSERT policy: Allow users to create sessions they participate in
CREATE POLICY "Users can create match sessions they participate in" ON public.active_match_sessions
  FOR INSERT WITH CHECK (
    player_id = public.get_current_user_id() OR
    opponent_id = public.get_current_user_id() OR
    partner_id = public.get_current_user_id() OR
    opponent_1_id = public.get_current_user_id() OR
    opponent_2_id = public.get_current_user_id()
  );

-- UPDATE policy: Allow users to update sessions they participate in
CREATE POLICY "Users can update their match sessions" ON public.active_match_sessions
  FOR UPDATE USING (
    player_id = public.get_current_user_id() OR
    opponent_id = public.get_current_user_id() OR
    partner_id = public.get_current_user_id() OR
    opponent_1_id = public.get_current_user_id() OR
    opponent_2_id = public.get_current_user_id()
  );

-- DELETE policy: Allow users to delete sessions they participate in
CREATE POLICY "Users can delete their match sessions" ON public.active_match_sessions
  FOR DELETE USING (
    player_id = public.get_current_user_id() OR
    opponent_id = public.get_current_user_id() OR
    partner_id = public.get_current_user_id() OR
    opponent_1_id = public.get_current_user_id() OR
    opponent_2_id = public.get_current_user_id()
  );
