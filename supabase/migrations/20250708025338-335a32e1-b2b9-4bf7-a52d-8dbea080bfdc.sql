-- Add missing foreign key relationships for the tables

-- Add foreign key for open_sessions creator_id to reference profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'open_sessions_creator_id_fkey'
    ) THEN
        ALTER TABLE public.open_sessions 
        ADD CONSTRAINT open_sessions_creator_id_fkey 
        FOREIGN KEY (creator_id) REFERENCES auth.users(id);
    END IF;
END $$;

-- Add foreign key for member_status user_id to reference profiles  
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'member_status_user_id_fkey'
    ) THEN
        ALTER TABLE public.member_status 
        ADD CONSTRAINT member_status_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id);
    END IF;
END $$;

-- Add foreign key for club_activity_stream user_id to reference profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'club_activity_stream_user_id_fkey'
    ) THEN
        ALTER TABLE public.club_activity_stream 
        ADD CONSTRAINT club_activity_stream_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id);
    END IF;
END $$;