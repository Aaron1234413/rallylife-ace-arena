
-- Remove HP decay system - HP will only change through activities
CREATE OR REPLACE FUNCTION public.calculate_hp_decay(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  hp_record RECORD;
BEGIN
  -- Get current HP status without any decay calculation
  SELECT * INTO hp_record
  FROM public.player_hp
  WHERE player_id = user_id;
  
  -- If no record exists, return default HP
  IF hp_record IS NULL THEN
    RETURN 100;
  END IF;
  
  -- Simply return current HP without any decay
  RETURN hp_record.current_hp;
END;
$$;

-- Update the restore_hp function to ensure it works correctly without decay
CREATE OR REPLACE FUNCTION public.restore_hp(
  user_id UUID,
  restoration_amount INTEGER,
  activity_type TEXT,
  description TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  hp_record RECORD;
  new_hp INTEGER;
  actual_change INTEGER;
BEGIN
  -- Get current HP status
  SELECT * INTO hp_record
  FROM public.player_hp
  WHERE player_id = user_id;
  
  -- If no record exists, initialize it
  IF hp_record IS NULL THEN
    PERFORM public.initialize_player_hp(user_id);
    SELECT * INTO hp_record
    FROM public.player_hp
    WHERE player_id = user_id;
  END IF;
  
  -- Calculate new HP (can go negative for HP costs, but capped at max_hp for restoration)
  IF restoration_amount > 0 THEN
    -- Restoration: cap at max_hp
    new_hp := LEAST(hp_record.current_hp + restoration_amount, hp_record.max_hp);
  ELSE
    -- HP cost: can go down to 0
    new_hp := GREATEST(hp_record.current_hp + restoration_amount, 0);
  END IF;
  
  actual_change := new_hp - hp_record.current_hp;
  
  -- Update HP and last activity
  UPDATE public.player_hp
  SET current_hp = new_hp,
      last_activity = now(),
      updated_at = now()
  WHERE player_id = user_id;
  
  -- Log the change if there was any
  IF actual_change != 0 THEN
    INSERT INTO public.hp_activities (player_id, activity_type, hp_change, hp_before, hp_after, description)
    VALUES (user_id, activity_type, actual_change, hp_record.current_hp, new_hp, 
            COALESCE(description, 
              CASE 
                WHEN actual_change > 0 THEN 'HP restored from ' || activity_type
                ELSE 'HP cost from ' || activity_type
              END
            ));
  END IF;
  
  RETURN new_hp;
END;
$$;
