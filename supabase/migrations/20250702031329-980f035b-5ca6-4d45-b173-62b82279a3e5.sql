-- Fix RLS policy for active_match_sessions to allow invitation acceptance
-- Drop the restrictive INSERT policy
DROP POLICY "Users can insert their own match sessions" ON public.active_match_sessions;

-- Create a new INSERT policy that allows users to insert match sessions they participate in
CREATE POLICY "Users can insert match sessions they participate in" 
ON public.active_match_sessions 
FOR INSERT 
WITH CHECK (
  (player_id = auth.uid()) OR 
  (opponent_id = auth.uid()) OR 
  (partner_id = auth.uid()) OR 
  (opponent_1_id = auth.uid()) OR 
  (opponent_2_id = auth.uid())
);