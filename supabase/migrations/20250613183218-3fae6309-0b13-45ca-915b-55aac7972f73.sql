
-- Create coach_crp table to track Coach Reputation Points
CREATE TABLE public.coach_crp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_crp INTEGER NOT NULL DEFAULT 100,
  total_crp_earned INTEGER NOT NULL DEFAULT 0,
  reputation_level TEXT NOT NULL DEFAULT 'bronze',
  visibility_score NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  booking_rate_bonus NUMERIC(3,2) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coach_id)
);

-- Create crp_activities table to track CRP earning activities
CREATE TABLE public.crp_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  crp_change INTEGER NOT NULL,
  crp_before INTEGER NOT NULL,
  crp_after INTEGER NOT NULL,
  description TEXT,
  source_player_id UUID REFERENCES public.profiles(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create player_feedback table for coach feedback
CREATE TABLE public.player_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  session_type TEXT NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  crp_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(player_id, coach_id, session_date)
);

-- Enable RLS on all new tables
ALTER TABLE public.coach_crp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crp_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies for coach_crp (readable by all, writable by system functions)
CREATE POLICY "Anyone can view coach CRP" ON public.coach_crp FOR SELECT USING (true);
CREATE POLICY "Only system can modify coach CRP" ON public.coach_crp FOR ALL USING (false);

-- RLS policies for crp_activities (coaches can view their own, players can view related)
CREATE POLICY "Coaches can view their CRP activities" ON public.crp_activities 
  FOR SELECT USING (coach_id = auth.uid());
CREATE POLICY "Players can view CRP activities they contributed to" ON public.crp_activities 
  FOR SELECT USING (source_player_id = auth.uid());

-- RLS policies for player_feedback (players can manage their own, coaches can view theirs)
CREATE POLICY "Players can manage their own feedback" ON public.player_feedback 
  FOR ALL USING (player_id = auth.uid());
CREATE POLICY "Coaches can view feedback about them" ON public.player_feedback 
  FOR SELECT USING (coach_id = auth.uid());

-- Function to initialize coach CRP
CREATE OR REPLACE FUNCTION public.initialize_coach_crp(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.coach_crp (coach_id, current_crp, total_crp_earned, reputation_level)
  VALUES (user_id, 100, 0, 'bronze')
  ON CONFLICT (coach_id) DO NOTHING;
END;
$$;

-- Function to add CRP
CREATE OR REPLACE FUNCTION public.add_crp(
  user_id UUID,
  crp_amount INTEGER,
  activity_type TEXT,
  description TEXT DEFAULT NULL,
  source_player_id UUID DEFAULT NULL,
  metadata JSONB DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  crp_record RECORD;
  new_crp INTEGER;
  new_total INTEGER;
  old_level TEXT;
  new_level TEXT;
  visibility_multiplier NUMERIC;
  booking_bonus NUMERIC;
  result JSON;
BEGIN
  -- Get current CRP status
  SELECT * INTO crp_record
  FROM public.coach_crp
  WHERE coach_id = user_id;
  
  -- If no record exists, initialize it
  IF crp_record IS NULL THEN
    PERFORM public.initialize_coach_crp(user_id);
    SELECT * INTO crp_record
    FROM public.coach_crp
    WHERE coach_id = user_id;
  END IF;
  
  -- Calculate new CRP values
  old_level := crp_record.reputation_level;
  new_crp := crp_record.current_crp + crp_amount;
  new_total := crp_record.total_crp_earned + GREATEST(crp_amount, 0);
  
  -- Determine reputation level based on total CRP
  IF new_total >= 2000 THEN
    new_level := 'platinum';
    visibility_multiplier := 1.5;
    booking_bonus := 0.25;
  ELSIF new_total >= 1000 THEN
    new_level := 'gold';
    visibility_multiplier := 1.3;
    booking_bonus := 0.15;
  ELSIF new_total >= 500 THEN
    new_level := 'silver';
    visibility_multiplier := 1.15;
    booking_bonus := 0.1;
  ELSE
    new_level := 'bronze';
    visibility_multiplier := 1.0;
    booking_bonus := 0.0;
  END IF;
  
  -- Update CRP record
  UPDATE public.coach_crp
  SET 
    current_crp = new_crp,
    total_crp_earned = new_total,
    reputation_level = new_level,
    visibility_score = visibility_multiplier,
    booking_rate_bonus = booking_bonus,
    updated_at = now()
  WHERE coach_id = user_id;
  
  -- Log the CRP activity
  INSERT INTO public.crp_activities (
    coach_id, activity_type, crp_change, crp_before, crp_after, 
    description, source_player_id, metadata
  )
  VALUES (
    user_id, activity_type, crp_amount, crp_record.current_crp, new_crp,
    description, source_player_id, metadata
  );
  
  -- Return result
  result := json_build_object(
    'crp_added', crp_amount,
    'new_crp', new_crp,
    'total_crp_earned', new_total,
    'old_level', old_level,
    'new_level', new_level,
    'level_up', new_level != old_level,
    'visibility_score', visibility_multiplier,
    'booking_rate_bonus', booking_bonus
  );
  
  RETURN result;
END;
$$;

-- Function to submit player feedback
CREATE OR REPLACE FUNCTION public.submit_player_feedback(
  coach_user_id UUID,
  rating INTEGER,
  feedback_text TEXT DEFAULT NULL,
  session_type TEXT DEFAULT 'lesson',
  session_date TIMESTAMP WITH TIME ZONE DEFAULT now()
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  player_user_id UUID;
  crp_to_award INTEGER;
  feedback_id UUID;
  crp_result JSON;
  result JSON;
BEGIN
  player_user_id := auth.uid();
  
  -- Calculate CRP based on rating
  crp_to_award := CASE 
    WHEN rating = 5 THEN 20
    WHEN rating = 4 THEN 15
    WHEN rating = 3 THEN 10
    WHEN rating = 2 THEN 5
    ELSE 0
  END;
  
  -- Insert feedback
  INSERT INTO public.player_feedback (
    player_id, coach_id, rating, feedback_text, session_type, 
    session_date, crp_awarded
  )
  VALUES (
    player_user_id, coach_user_id, rating, feedback_text, session_type,
    session_date, crp_to_award
  )
  RETURNING id INTO feedback_id;
  
  -- Award CRP to coach if rating is positive
  IF crp_to_award > 0 THEN
    SELECT public.add_crp(
      coach_user_id, 
      crp_to_award, 
      'player_feedback',
      'Player feedback: ' || rating || ' stars',
      player_user_id,
      json_build_object('feedback_id', feedback_id, 'rating', rating)
    ) INTO crp_result;
  END IF;
  
  result := json_build_object(
    'feedback_id', feedback_id,
    'crp_awarded', crp_to_award,
    'rating', rating,
    'crp_result', crp_result
  );
  
  RETURN result;
END;
$$;

-- Update the handle_new_user function to initialize CRP for coaches
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
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
  
  -- Initialize HP, XP, Tokens, and Avatar for players
  IF COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'player'::public.user_role) = 'player' THEN
    PERFORM public.initialize_player_hp(NEW.id);
    PERFORM public.initialize_player_xp(NEW.id);
    PERFORM public.initialize_player_tokens(NEW.id);
    PERFORM public.initialize_player_avatar(NEW.id);
  END IF;
  
  -- Initialize CRP for coaches
  IF COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'player'::public.user_role) = 'coach' THEN
    PERFORM public.initialize_coach_crp(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;
