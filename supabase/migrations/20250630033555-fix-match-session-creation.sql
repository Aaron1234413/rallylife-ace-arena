
-- Fix RLS policies to allow match session creation during invitation acceptance
-- The issue is that when accepting an invitation, the accepter creates a session 
-- where the inviter is the player_id, which violates the current INSERT policy

-- Drop the overly restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert their own match sessions" ON public.active_match_sessions;

-- Create a more flexible INSERT policy that allows:
-- 1. Users to create sessions where they are the player_id (normal case)
-- 2. Users to create sessions where they are participants (invitation acceptance)
CREATE POLICY "Users can insert match sessions they participate in" ON public.active_match_sessions
  FOR INSERT WITH CHECK (
    player_id = public.get_current_user_id() OR
    opponent_id = public.get_current_user_id() OR
    partner_id = public.get_current_user_id() OR
    opponent_1_id = public.get_current_user_id() OR
    opponent_2_id = public.get_current_user_id()
  );
