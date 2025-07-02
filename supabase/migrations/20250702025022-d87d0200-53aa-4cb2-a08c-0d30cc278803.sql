-- Fix infinite recursion in active_match_sessions RLS policies
-- Remove all existing policies and create clean, non-recursive ones

-- Drop all existing RLS policies for active_match_sessions
DROP POLICY IF EXISTS "Delete own sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Insert own sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Match participants can update sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Match participants can view sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Select sessions (owner, participants, invitees)" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Update sessions (owner or participants)" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can create their own match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can delete their own match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can insert their own match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can update their own match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can view sessions where they are opponents" ON public.active_match_sessions;
DROP POLICY IF EXISTS "Users can view their own match sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "insert_sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "match_sessions_delete" ON public.active_match_sessions;
DROP POLICY IF EXISTS "match_sessions_insert" ON public.active_match_sessions;
DROP POLICY IF EXISTS "match_sessions_select" ON public.active_match_sessions;
DROP POLICY IF EXISTS "match_sessions_update" ON public.active_match_sessions;
DROP POLICY IF EXISTS "select_sessions" ON public.active_match_sessions;
DROP POLICY IF EXISTS "update_sessions" ON public.active_match_sessions;

-- Create clean, simple RLS policies without recursion
CREATE POLICY "Users can view their own match sessions" 
ON public.active_match_sessions 
FOR SELECT 
USING (player_id = auth.uid());

CREATE POLICY "Users can view sessions where they are opponents"
ON public.active_match_sessions 
FOR SELECT 
USING (
  opponent_id = auth.uid() OR 
  partner_id = auth.uid() OR 
  opponent_1_id = auth.uid() OR 
  opponent_2_id = auth.uid()
);

CREATE POLICY "Users can insert their own match sessions"
ON public.active_match_sessions 
FOR INSERT 
WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can update their own match sessions"
ON public.active_match_sessions 
FOR UPDATE 
USING (player_id = auth.uid())
WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can delete their own match sessions"
ON public.active_match_sessions 
FOR DELETE 
USING (player_id = auth.uid());