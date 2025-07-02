-- Fix infinite recursion in both clubs and club_memberships tables
-- Start with clubs table - drop all existing policies
DROP POLICY IF EXISTS "Public clubs are viewable by everyone" ON public.clubs;
DROP POLICY IF EXISTS "Users can view clubs they own" ON public.clubs;
DROP POLICY IF EXISTS "Users can view clubs they're members of" ON public.clubs;
DROP POLICY IF EXISTS "Users can create clubs" ON public.clubs;
DROP POLICY IF EXISTS "Club owners can update their clubs" ON public.clubs;
DROP POLICY IF EXISTS "Club owners can delete their clubs" ON public.clubs;

-- Create simplified clubs policies
CREATE POLICY "Anyone can view public clubs"
ON public.clubs
FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can view clubs they own"
ON public.clubs
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create clubs"
ON public.clubs
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Club owners can update clubs"
ON public.clubs
FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Club owners can delete clubs"
ON public.clubs
FOR DELETE
USING (auth.uid() = owner_id);

-- Now fix club_memberships policies - drop all existing
DROP POLICY IF EXISTS "Users can insert their own memberships" ON public.club_memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON public.club_memberships;
DROP POLICY IF EXISTS "Club owners can manage all memberships" ON public.club_memberships;
DROP POLICY IF EXISTS "Users can view memberships for clubs they belong to" ON public.club_memberships;

-- Create simple club_memberships policies
CREATE POLICY "Users can insert their own memberships"
ON public.club_memberships
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memberships"
ON public.club_memberships
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own memberships"
ON public.club_memberships
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Club owners can manage memberships"
ON public.club_memberships
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE clubs.id = club_memberships.club_id 
    AND clubs.owner_id = auth.uid()
  )
);