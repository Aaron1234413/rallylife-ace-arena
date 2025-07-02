-- Check if sessions table exists and get its structure
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'sessions';

-- Also check for any check constraints on session_type
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.sessions'::regclass 
AND contype = 'c';