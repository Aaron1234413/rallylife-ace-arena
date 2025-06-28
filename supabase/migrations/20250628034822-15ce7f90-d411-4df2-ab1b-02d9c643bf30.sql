
-- Check if the match_invitations table exists and its current structure
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'match_invitations'
);

-- Show all columns if the table exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'match_invitations'
ORDER BY ordinal_position;
