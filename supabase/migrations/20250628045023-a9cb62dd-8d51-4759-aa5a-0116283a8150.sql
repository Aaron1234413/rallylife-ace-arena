
-- Check the constraint definition for match_invitations.invitation_type
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE n.nspname = 'public' 
    AND t.relname = 'match_invitations'
    AND conname LIKE '%invitation_type%';

-- Also check if there's an enum type defined
SELECT 
    t.typname,
    e.enumlabel
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname LIKE '%invitation%'
ORDER BY e.enumsortorder;

-- Check the column definition
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'match_invitations'
    AND column_name = 'invitation_type';
