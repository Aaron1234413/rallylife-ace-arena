-- Enable real-time for session automation
ALTER TABLE public.sessions REPLICA IDENTITY FULL;
ALTER TABLE public.session_participants REPLICA IDENTITY FULL;

-- Add tables to real-time publication if not already added
DO $$
BEGIN
    -- Check if sessions table is in realtime publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'sessions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
    END IF;
    
    -- Check if session_participants table is in realtime publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'session_participants'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.session_participants;
    END IF;
END $$;