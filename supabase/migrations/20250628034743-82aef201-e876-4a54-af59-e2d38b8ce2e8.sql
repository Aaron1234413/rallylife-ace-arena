
-- Check the constraint on match_invitations table to see what values are allowed
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.match_invitations'::regclass 
AND contype = 'c';

-- Check the table structure using proper SQL
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'match_invitations'
ORDER BY ordinal_position;
