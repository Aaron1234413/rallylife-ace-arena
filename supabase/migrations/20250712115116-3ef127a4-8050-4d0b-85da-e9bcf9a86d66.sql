-- Fix member count discrepancy and create RAKO Academy Club
-- First, update existing member counts to reflect actual members
UPDATE clubs 
SET member_count = (
  SELECT COUNT(*) 
  FROM club_memberships 
  WHERE club_id = clubs.id AND status = 'active'
);

-- Check if RAKO Academy already exists, if not create it
DO $$
DECLARE
  rako_club_id UUID;
  owner_user_id UUID := '67e988d1-cc8b-4191-adeb-59e1b9e57f7f';
BEGIN
  -- Check if RAKO Academy exists
  SELECT id INTO rako_club_id FROM clubs WHERE name = 'RAKO Academy';
  
  -- If it doesn't exist, create it
  IF rako_club_id IS NULL THEN
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
      owner_user_id,
      true,
      'pro', 
      'active',
      10, 
      50,  
      0 
    ) RETURNING id INTO rako_club_id;
  END IF;
  
  -- Enroll all existing users in RAKO Academy (except owner)
  INSERT INTO club_memberships (club_id, user_id, role, status)
  SELECT 
    rako_club_id,
    id,
    'member',
    'active'
  FROM auth.users
  WHERE id != owner_user_id
  ON CONFLICT (club_id, user_id) DO NOTHING;

  -- Make sure the owner has owner role in RAKO Academy
  INSERT INTO club_memberships (club_id, user_id, role, status, permissions)
  VALUES (
    rako_club_id,
    owner_user_id,
    'owner',
    'active',
    '{"can_invite": true, "can_manage_members": true, "can_edit_club": true, "can_manage_courts": true}'::jsonb
  ) ON CONFLICT (club_id, user_id) DO UPDATE SET
    role = 'owner',
    permissions = '{"can_invite": true, "can_manage_members": true, "can_edit_club": true, "can_manage_courts": true}'::jsonb;
END $$;

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

-- Update member counts for all clubs after changes
UPDATE clubs 
SET member_count = (
  SELECT COUNT(*) 
  FROM club_memberships 
  WHERE club_id = clubs.id AND status = 'active'
);