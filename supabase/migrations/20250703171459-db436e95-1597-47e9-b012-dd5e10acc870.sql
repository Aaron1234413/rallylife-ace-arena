-- Ensure the clubs table is properly exposed to the API
-- Check if there are any issues with the table configuration

-- First, let's make sure RLS is properly enabled
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clubs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.club_memberships TO authenticated;

-- Grant usage on sequences if any
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;