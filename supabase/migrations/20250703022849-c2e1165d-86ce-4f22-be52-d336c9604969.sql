-- Phase 1: Database Optimization for Live Leaderboards
-- Create indexes for efficient leaderboard queries

-- Player XP leaderboard index (level DESC, XP DESC)
CREATE INDEX IF NOT EXISTS idx_player_xp_leaderboard 
ON player_xp (current_level DESC, total_xp_earned DESC);

-- Coach CXP leaderboard index (level DESC, CXP DESC)  
CREATE INDEX IF NOT EXISTS idx_coach_cxp_leaderboard 
ON coach_cxp (current_level DESC, total_cxp_earned DESC);

-- Additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_player_xp_player_id 
ON player_xp (player_id);

CREATE INDEX IF NOT EXISTS idx_coach_cxp_coach_id 
ON coach_cxp (coach_id);

CREATE INDEX IF NOT EXISTS idx_profiles_id_name_avatar 
ON profiles (id, full_name, avatar_url);

-- Enable realtime for both tables if not already enabled
ALTER TABLE player_xp REPLICA IDENTITY FULL;
ALTER TABLE coach_cxp REPLICA IDENTITY FULL;
ALTER TABLE profiles REPLICA IDENTITY FULL;

-- Add tables to realtime publication if not already added
DO $$
BEGIN
    -- Add player_xp to realtime
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'player_xp'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE player_xp;
    END IF;
    
    -- Add coach_cxp to realtime
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'coach_cxp'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE coach_cxp;
    END IF;
    
    -- Add profiles to realtime
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
    END IF;
END $$;