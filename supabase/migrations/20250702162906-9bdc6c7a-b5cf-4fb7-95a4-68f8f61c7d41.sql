-- Check the current sessions table structure and data
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'sessions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any existing sessions and their types
SELECT session_type, COUNT(*) as count
FROM public.sessions 
GROUP BY session_type;