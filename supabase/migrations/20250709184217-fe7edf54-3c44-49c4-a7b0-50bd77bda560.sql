-- Enable real-time functionality for sessions table
ALTER TABLE public.sessions REPLICA IDENTITY FULL;

-- Add sessions table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;

-- Enable real-time for session_participants table  
ALTER TABLE public.session_participants REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_participants;