-- Fix member count discrepancy and create RAKO Academy Club
-- First, fix the member count trigger to properly update counts

-- Update existing member counts to reflect actual members
UPDATE clubs 
SET member_count = (
  SELECT COUNT(*) 
  FROM club_memberships 
  WHERE club_id = clubs.id AND status = 'active'
);

-- Create or update the RAKO Academy Club
INSERT INTO clubs (
  name, 
  description, 
  owner_id, 
  is_public, 
  subscription_tier,
  subscription_status,
  court_count,
  coach_slots,
  member_count
) VALUES (
  'RAKO Academy', 
  'The official RAKO Academy - where every tennis player belongs. Master your game with the community.',
  '67e988d1-cc8b-4191-adeb-59e1b9e57f7f', -- Your user ID
  true,
  'pro', -- Highest tier
  'active',
  10, -- Premium court count
  50, -- Premium coach slots  
  0 -- Will be updated by trigger
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_status = EXCLUDED.subscription_status,
  court_count = EXCLUDED.court_count,
  coach_slots = EXCLUDED.coach_slots;

-- Function to auto-enroll users in RAKO Academy
CREATE OR REPLACE FUNCTION auto_enroll_in_rako_academy()
RETURNS TRIGGER AS $$
DECLARE
  rako_club_id UUID;
BEGIN
  -- Get RAKO Academy club ID
  SELECT id INTO rako_club_id 
  FROM clubs 
  WHERE name = 'RAKO Academy' 
  LIMIT 1;
  
  -- If RAKO Academy exists, auto-enroll the new user
  IF rako_club_id IS NOT NULL THEN
    INSERT INTO club_memberships (club_id, user_id, role, status)
    VALUES (rako_club_id, NEW.id, 'member', 'active')
    ON CONFLICT (club_id, user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-enrollment on new user creation
DROP TRIGGER IF EXISTS auto_enroll_rako_academy_trigger ON auth.users;
CREATE TRIGGER auto_enroll_rako_academy_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auto_enroll_in_rako_academy();

-- Enroll all existing users in RAKO Academy
INSERT INTO club_memberships (club_id, user_id, role, status)
SELECT 
  (SELECT id FROM clubs WHERE name = 'RAKO Academy' LIMIT 1),
  id,
  'member',
  'active'
FROM auth.users
WHERE id != '67e988d1-cc8b-4191-adeb-59e1b9e57f7f' -- Don't add owner as member
ON CONFLICT (club_id, user_id) DO NOTHING;

-- Make sure the owner has owner role in RAKO Academy
INSERT INTO club_memberships (club_id, user_id, role, status, permissions)
SELECT 
  (SELECT id FROM clubs WHERE name = 'RAKO Academy' LIMIT 1),
  '67e988d1-cc8b-4191-adeb-59e1b9e57f7f',
  'owner',
  'active',
  '{"can_invite": true, "can_manage_members": true, "can_edit_club": true, "can_manage_courts": true}'::jsonb
ON CONFLICT (club_id, user_id) DO UPDATE SET
  role = 'owner',
  permissions = '{"can_invite": true, "can_manage_members": true, "can_edit_club": true, "can_manage_courts": true}'::jsonb;

-- Update member counts for all clubs
UPDATE clubs 
SET member_count = (
  SELECT COUNT(*) 
  FROM club_memberships 
  WHERE club_id = clubs.id AND status = 'active'
);