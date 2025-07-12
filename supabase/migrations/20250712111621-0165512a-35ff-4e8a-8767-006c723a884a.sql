-- Function to log member joined activity
CREATE OR REPLACE FUNCTION log_member_joined_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log when a member is joining (status becomes 'active')
  IF NEW.status = 'active' AND (OLD IS NULL OR OLD.status != 'active') THEN
    INSERT INTO club_activity_feed (club_id, user_id, activity_type, activity_data)
    VALUES (
      NEW.club_id,
      NEW.user_id,
      'member_joined',
      json_build_object('member_id', NEW.user_id, 'role', NEW.role)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log member joining activity
DROP TRIGGER IF EXISTS trigger_log_member_joined ON club_memberships;
CREATE TRIGGER trigger_log_member_joined
  AFTER INSERT OR UPDATE ON club_memberships
  FOR EACH ROW
  EXECUTE FUNCTION log_member_joined_activity();