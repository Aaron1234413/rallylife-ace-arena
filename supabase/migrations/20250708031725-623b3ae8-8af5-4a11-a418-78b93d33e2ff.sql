-- Add missing foreign key constraint for open_sessions.court_id -> club_courts.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'open_sessions_court_id_fkey'
    ) THEN
        ALTER TABLE public.open_sessions 
        ADD CONSTRAINT open_sessions_court_id_fkey 
        FOREIGN KEY (court_id) REFERENCES public.club_courts(id);
    END IF;
END $$;