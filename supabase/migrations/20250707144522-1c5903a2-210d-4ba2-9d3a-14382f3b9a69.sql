-- Enable realtime for club-related tables
ALTER TABLE public.clubs REPLICA IDENTITY FULL;
ALTER TABLE public.club_memberships REPLICA IDENTITY FULL;
ALTER TABLE public.club_courts REPLICA IDENTITY FULL;
ALTER TABLE public.club_activity_feed REPLICA IDENTITY FULL;
ALTER TABLE public.appointments REPLICA IDENTITY FULL;
ALTER TABLE public.coach_availability REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.clubs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.club_memberships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.club_courts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.club_activity_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_availability;