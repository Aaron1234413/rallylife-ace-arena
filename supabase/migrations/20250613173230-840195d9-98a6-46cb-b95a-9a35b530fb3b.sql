
-- Update the HP decay calculation to 2 HP per day instead of 1 HP per hour
CREATE OR REPLACE FUNCTION public.calculate_hp_decay(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  hp_record RECORD;
  days_inactive NUMERIC;
  decay_amount INTEGER;
  new_hp INTEGER;
BEGIN
  -- Get current HP status
  SELECT * INTO hp_record
  FROM public.player_hp
  WHERE player_id = user_id;
  
  -- If no record exists or decay is paused, return current HP
  IF hp_record IS NULL OR hp_record.decay_paused THEN
    RETURN COALESCE(hp_record.current_hp, 100);
  END IF;
  
  -- Calculate days since last activity (24 hours = 1 day)
  days_inactive := EXTRACT(EPOCH FROM (now() - hp_record.last_activity)) / 86400;
  
  -- Calculate decay (2 HP per day, minimum 20 HP)
  decay_amount := FLOOR(days_inactive * 2)::INTEGER;
  decay_amount := LEAST(decay_amount, hp_record.current_hp - 20);
  decay_amount := GREATEST(decay_amount, 0);
  
  new_hp := hp_record.current_hp - decay_amount;
  
  -- Update HP if there was decay
  IF decay_amount > 0 THEN
    UPDATE public.player_hp
    SET current_hp = new_hp,
        updated_at = now()
    WHERE player_id = user_id;
    
    -- Log the decay
    INSERT INTO public.hp_activities (player_id, activity_type, hp_change, hp_before, hp_after, description)
    VALUES (user_id, 'decay', -decay_amount, hp_record.current_hp, new_hp, 
            'HP decay from ' || ROUND(days_inactive, 1) || ' days of inactivity');
  END IF;
  
  RETURN new_hp;
END;
$$;
