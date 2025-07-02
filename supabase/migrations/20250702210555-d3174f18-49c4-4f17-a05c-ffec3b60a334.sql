-- Phase 1: Database Schema Unification & Analysis
-- Step 1: Analyze current state and migrate social_play_sessions to unified sessions table

-- First, let's check if we have any existing social_play_sessions to migrate
DO $$
DECLARE
  social_play_count INTEGER;
  existing_sessions_count INTEGER;
BEGIN
  -- Count existing social play sessions
  SELECT COUNT(*) INTO social_play_count FROM public.social_play_sessions;
  
  -- Count existing sessions that might be social play
  SELECT COUNT(*) INTO existing_sessions_count 
  FROM public.sessions 
  WHERE session_type = 'social_play';
  
  RAISE NOTICE 'Found % social_play_sessions to migrate', social_play_count;
  RAISE NOTICE 'Found % existing social_play sessions in unified table', existing_sessions_count;
END $$;

-- Migrate social_play_sessions to unified sessions table
INSERT INTO public.sessions (
  id, creator_id, session_type, format, max_players, 
  stakes_amount, location, notes, status, is_private,
  created_at, updated_at
)
SELECT 
  sps.id, 
  sps.created_by, 
  'social_play'::text as session_type,
  CASE 
    WHEN sps.session_type = 'doubles' THEN 'doubles'::text 
    ELSE 'singles'::text 
  END as format,
  CASE 
    WHEN sps.session_type = 'doubles' THEN 4 
    ELSE 2 
  END as max_players,
  0 as stakes_amount, -- Social play typically has no stakes
  sps.location, 
  sps.notes, 
  CASE 
    WHEN sps.status = 'pending' THEN 'waiting'::text
    WHEN sps.status = 'active' THEN 'active'::text
    WHEN sps.status = 'completed' THEN 'completed'::text
    WHEN sps.status = 'paused' THEN 'active'::text -- Map paused to active
    ELSE 'cancelled'::text
  END as status,
  false as is_private, -- Social play is typically public
  sps.created_at, 
  sps.updated_at
FROM public.social_play_sessions sps
WHERE sps.id NOT IN (
  SELECT id FROM public.sessions WHERE session_type = 'social_play'
)
ON CONFLICT (id) DO NOTHING;

-- Migrate social_play_participants to session_participants
INSERT INTO public.session_participants (
  session_id, user_id, status, joined_at
)
SELECT 
  sp.session_id, 
  sp.user_id, 
  'joined'::text as status,
  sp.registration_datetime as joined_at
FROM public.social_play_participants sp
WHERE NOT EXISTS (
  SELECT 1 FROM public.session_participants 
  WHERE session_id = sp.session_id AND user_id = sp.user_id
)
ON CONFLICT (session_id, user_id) DO NOTHING;

-- Verification: Check migration results
DO $$
DECLARE
  migrated_sessions INTEGER;
  migrated_participants INTEGER;
  total_social_sessions INTEGER;
  total_participants INTEGER;
BEGIN
  -- Count migrated sessions
  SELECT COUNT(*) INTO migrated_sessions 
  FROM public.sessions 
  WHERE session_type = 'social_play';
  
  -- Count migrated participants
  SELECT COUNT(*) INTO migrated_participants 
  FROM public.session_participants sp
  JOIN public.sessions s ON sp.session_id = s.id
  WHERE s.session_type = 'social_play';
  
  -- Count original data
  SELECT COUNT(*) INTO total_social_sessions FROM public.social_play_sessions;
  SELECT COUNT(*) INTO total_participants FROM public.social_play_participants;
  
  RAISE NOTICE 'Migration Results:';
  RAISE NOTICE 'Sessions migrated: % out of %', migrated_sessions, total_social_sessions;
  RAISE NOTICE 'Participants migrated: % out of %', migrated_participants, total_participants;
  
  -- Verify no data loss
  IF migrated_sessions < total_social_sessions THEN
    RAISE EXCEPTION 'Session migration incomplete: % migrated out of %', migrated_sessions, total_social_sessions;
  END IF;
  
  IF migrated_participants < total_participants THEN
    RAISE EXCEPTION 'Participant migration incomplete: % migrated out of %', migrated_participants, total_participants;
  END IF;
  
  RAISE NOTICE 'Phase 1 migration completed successfully!';
END $$;