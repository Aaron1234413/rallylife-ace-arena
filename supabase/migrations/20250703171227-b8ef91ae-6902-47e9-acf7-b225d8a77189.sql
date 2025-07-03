-- Fix RLS policies for club creation - handle existing policies

-- Drop ALL existing policies for clubs
DROP POLICY IF EXISTS "Users can create clubs" ON public.clubs;
DROP POLICY IF EXISTS "Public clubs are viewable by everyone" ON public.clubs;
DROP POLICY IF EXISTS "Users can view clubs they own" ON public.clubs;
DROP POLICY IF EXISTS "Users can view clubs they're members of" ON public.clubs;
DROP POLICY IF EXISTS "Anyone can view public clubs" ON public.clubs;
DROP POLICY IF EXISTS "Authenticated users can create clubs" ON public.clubs;
DROP POLICY IF EXISTS "Club owners can update their clubs" ON public.clubs;
DROP POLICY IF EXISTS "Club owners can delete their clubs" ON public.clubs;

-- Create correct policies for clubs
CREATE POLICY "Anyone can view public clubs"
ON public.clubs
FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can view clubs they own"
ON public.clubs
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create clubs"
ON public.clubs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Club owners can update their clubs"
ON public.clubs
FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Club owners can delete their clubs"
ON public.clubs
FOR DELETE
USING (auth.uid() = owner_id);

-- Drop ALL existing policies for club_memberships
DROP POLICY IF EXISTS "Users can view memberships of clubs they have access to" ON public.club_memberships;
DROP POLICY IF EXISTS "Club owners can manage memberships" ON public.club_memberships;
DROP POLICY IF EXISTS "Users can join clubs (insert membership)" ON public.club_memberships;
DROP POLICY IF EXISTS "Users can leave clubs (update their own membership)" ON public.club_memberships;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON public.club_memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON public.club_memberships;
DROP POLICY IF EXISTS "Club owners can manage all memberships" ON public.club_memberships;
DROP POLICY IF EXISTS "Users can view memberships for accessible clubs" ON public.club_memberships;

-- Create simplified, non-recursive policies for club_memberships
CREATE POLICY "Users can insert their own memberships"
ON public.club_memberships
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memberships"
ON public.club_memberships
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Club owners can manage all memberships"
ON public.club_memberships
FOR ALL
TO authenticated
USING (
  club_id IN (
    SELECT id FROM public.clubs 
    WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can view memberships for accessible clubs"
ON public.club_memberships
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  club_id IN (
    SELECT id FROM public.clubs 
    WHERE owner_id = auth.uid() OR is_public = true
  )
);