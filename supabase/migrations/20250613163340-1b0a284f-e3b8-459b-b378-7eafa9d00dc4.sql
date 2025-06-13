
-- Create HP System table
CREATE TABLE public.player_hp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_hp INTEGER NOT NULL DEFAULT 100,
  max_hp INTEGER NOT NULL DEFAULT 100,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  decay_rate INTEGER NOT NULL DEFAULT 1,
  decay_paused BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure HP stays within bounds
  CONSTRAINT hp_bounds CHECK (current_hp >= 0 AND current_hp <= max_hp),
  CONSTRAINT max_hp_bounds CHECK (max_hp >= 20 AND max_hp <= 150),
  CONSTRAINT decay_rate_bounds CHECK (decay_rate >= 0 AND decay_rate <= 10),
  
  -- One HP record per player
  UNIQUE(player_id)
);

-- Enable RLS
ALTER TABLE public.player_hp ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own HP" 
  ON public.player_hp 
  FOR SELECT 
  USING (auth.uid() = player_id);

CREATE POLICY "Users can update their own HP" 
  ON public.player_hp 
  FOR UPDATE 
  USING (auth.uid() = player_id);

CREATE POLICY "System can insert HP records" 
  ON public.player_hp 
  FOR INSERT 
  WITH CHECK (auth.uid() = player_id);

-- Create HP activity log table
CREATE TABLE public.hp_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  hp_change INTEGER NOT NULL,
  hp_before INTEGER NOT NULL,
  hp_after INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure valid activity types
  CONSTRAINT valid_activity_type CHECK (activity_type IN ('match', 'training', 'lesson', 'health_pack', 'decay', 'bonus'))
);

-- Enable RLS for HP activities
ALTER TABLE public.hp_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own HP activities" 
  ON public.hp_activities 
  FOR SELECT 
  USING (auth.uid() = player_id);

CREATE POLICY "System can insert HP activities" 
  ON public.hp_activities 
  FOR INSERT 
  WITH CHECK (auth.uid() = player_id);

-- Function to initialize HP for new players
CREATE OR REPLACE FUNCTION public.initialize_player_hp(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.player_hp (player_id, current_hp, max_hp)
  VALUES (user_id, 100, 100)
  ON CONFLICT (player_id) DO NOTHING;
END;
$$;

-- Function to calculate HP decay
CREATE OR REPLACE FUNCTION public.calculate_hp_decay(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  hp_record RECORD;
  hours_inactive INTEGER;
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
  
  -- Calculate hours since last activity
  hours_inactive := EXTRACT(EPOCH FROM (now() - hp_record.last_activity)) / 3600;
  
  -- Calculate decay (1 HP per hour by default, minimum 20 HP)
  decay_amount := LEAST(hours_inactive * hp_record.decay_rate, hp_record.current_hp - 20);
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
            'HP decay from ' || hours_inactive || ' hours of inactivity');
  END IF;
  
  RETURN new_hp;
END;
$$;

-- Function to restore HP
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
  actual_restoration INTEGER;
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
  
  -- Calculate new HP (capped at max_hp)
  new_hp := LEAST(hp_record.current_hp + restoration_amount, hp_record.max_hp);
  actual_restoration := new_hp - hp_record.current_hp;
  
  -- Update HP and last activity
  UPDATE public.player_hp
  SET current_hp = new_hp,
      last_activity = now(),
      updated_at = now()
  WHERE player_id = user_id;
  
  -- Log the restoration
  IF actual_restoration > 0 THEN
    INSERT INTO public.hp_activities (player_id, activity_type, hp_change, hp_before, hp_after, description)
    VALUES (user_id, activity_type, actual_restoration, hp_record.current_hp, new_hp, 
            COALESCE(description, 'HP restored from ' || activity_type));
  END IF;
  
  RETURN new_hp;
END;
$$;

-- Update the handle_new_user function to initialize HP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'player'::public.user_role)
  );
  
  -- Initialize HP for players
  IF COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'player'::public.user_role) = 'player' THEN
    PERFORM public.initialize_player_hp(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;
