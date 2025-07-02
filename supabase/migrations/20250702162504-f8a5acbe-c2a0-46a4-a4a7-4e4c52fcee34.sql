-- Phase 1: Database Schema Updates for Wellbeing Sessions
-- Check current sessions table structure and create/update session_type handling

-- First, let's see the current structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'sessions' AND table_schema = 'public'
ORDER BY ordinal_position;