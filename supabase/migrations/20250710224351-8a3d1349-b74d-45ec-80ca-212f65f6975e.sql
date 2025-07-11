-- Add SELECT policy to allow users to view sessions
CREATE POLICY "Users can view accessible sessions" 
ON public.sessions 
FOR SELECT 
TO authenticated
USING (
  -- Users can view sessions they created
  creator_id = auth.uid() 
  OR 
  -- Users can view public sessions
  is_private = false 
  OR 
  -- Users can view sessions in clubs they are members of
  (club_id IS NOT NULL AND club_id IN (
    SELECT club_id 
    FROM public.club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ))
);