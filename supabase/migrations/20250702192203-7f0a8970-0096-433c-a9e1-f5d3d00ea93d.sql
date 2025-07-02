-- Fix infinite recursion in club_memberships RLS policies
-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Club owners can manage memberships" ON public.club_memberships;
DROP POLICY IF EXISTS "Users can join clubs (insert membership)" ON public.club_memberships;
DROP POLICY IF EXISTS "Users can leave clubs (update their own membership)" ON public.club_memberships;
DROP POLICY IF EXISTS "Users can view memberships of clubs they have access to" ON public.club_memberships;

-- Create simplified policies that avoid recursion
CREATE POLICY "Users can insert their own memberships"
ON public.club_memberships
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memberships"
ON public.club_memberships
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Club owners can manage all memberships"
ON public.club_memberships
FOR ALL
USING (
  club_id IN (
    SELECT id FROM public.clubs 
    WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can view memberships for clubs they belong to"
ON public.club_memberships
FOR SELECT
USING (
  auth.uid() = user_id OR
  club_id IN (
    SELECT id FROM public.clubs 
    WHERE owner_id = auth.uid() OR is_public = true
  )
);