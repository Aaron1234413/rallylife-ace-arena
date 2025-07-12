-- Function to update club member count
CREATE OR REPLACE FUNCTION update_club_member_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update member count based on active memberships
  UPDATE clubs 
  SET member_count = (
    SELECT COUNT(*) 
    FROM club_memberships 
    WHERE club_id = COALESCE(NEW.club_id, OLD.club_id) 
    AND status = 'active'
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.club_id, OLD.club_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update member count when memberships change
DROP TRIGGER IF EXISTS trigger_update_club_member_count ON club_memberships;
CREATE TRIGGER trigger_update_club_member_count
  AFTER INSERT OR UPDATE OR DELETE ON club_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_club_member_count();