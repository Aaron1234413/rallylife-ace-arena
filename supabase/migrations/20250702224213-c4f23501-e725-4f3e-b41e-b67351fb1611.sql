-- Phase 8: Legacy System Cleanup
-- Drop legacy social play tables after verifying all functionality works with unified sessions

-- First check if there are any remaining references or dependencies
DO $$
BEGIN
  -- Check if tables exist before dropping
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'social_play_participants' AND table_schema = 'public') THEN
    -- Drop foreign key constraints first if they exist
    DROP TABLE IF EXISTS public.social_play_participants CASCADE;
    RAISE NOTICE 'Dropped social_play_participants table';
  ELSE
    RAISE NOTICE 'social_play_participants table does not exist';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'social_play_sessions' AND table_schema = 'public') THEN
    DROP TABLE IF EXISTS public.social_play_sessions CASCADE;
    RAISE NOTICE 'Dropped social_play_sessions table';
  ELSE
    RAISE NOTICE 'social_play_sessions table does not exist';
  END IF;
END $$;