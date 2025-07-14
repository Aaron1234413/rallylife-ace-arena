-- Phase 1: Database Schema Consistency for Club Privacy System

-- Step 1: Update all existing clubs to be private
UPDATE public.clubs 
SET is_private = true, is_public = false
WHERE is_public = true OR is_private = false OR is_private IS NULL;

-- Step 2: Add constraint to ensure clubs cannot be public in the future
ALTER TABLE public.clubs 
ADD CONSTRAINT clubs_must_be_private CHECK (is_public = false);

-- Step 3: Update RLS policies to remove public club access patterns

-- Drop existing policies that reference public clubs
DROP POLICY IF EXISTS "Anyone can view public clubs" ON public.clubs;

-- Update club_memberships policies to remove public club references
DROP POLICY IF EXISTS "Users can view memberships for accessible clubs" ON public.club_memberships;

-- Create updated policy for club_memberships without public club access
CREATE POLICY "Users can view memberships for clubs they belong to"
ON public.club_memberships
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  club_id IN (
    SELECT id FROM public.clubs 
    WHERE owner_id = auth.uid()
  )
);

-- Update other policies that reference public clubs
DROP POLICY IF EXISTS "Club members can view courts" ON public.club_courts;

CREATE POLICY "Club members can view courts"
ON public.club_courts
FOR SELECT
TO authenticated
USING (
  club_id IN (
    SELECT club_id FROM club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Update club_events policy
DROP POLICY IF EXISTS "Club members can view events" ON public.club_events;

CREATE POLICY "Club members can view events"
ON public.club_events
FOR SELECT
TO authenticated
USING (
  club_id IN (
    SELECT club_id FROM club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Add policy for club discovery through invitations only
CREATE POLICY "Users can view clubs they have access to"
ON public.clubs
FOR SELECT
TO authenticated
USING (
  auth.uid() = owner_id OR
  id IN (
    SELECT club_id FROM club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);