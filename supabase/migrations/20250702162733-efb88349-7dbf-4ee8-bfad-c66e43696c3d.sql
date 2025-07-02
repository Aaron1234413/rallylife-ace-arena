-- Phase 1: Add wellbeing session type to existing sessions table

-- Check current session_type values first
SELECT DISTINCT session_type FROM public.sessions;

-- Get the current enum definition
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'session_type')
ORDER BY enumsortorder;