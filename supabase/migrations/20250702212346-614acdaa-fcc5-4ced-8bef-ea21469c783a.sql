-- Phase 3: Wellbeing Session System Architecture
-- Add meditation RPC function that creates and completes wellbeing sessions

CREATE OR REPLACE FUNCTION public.complete_meditation_session(
  meditation_type text DEFAULT 'meditation',
  duration_minutes integer DEFAULT 15,
  notes text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  session_id UUID;
  hp_restoration INTEGER;
  xp_gain INTEGER;
  result JSON;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not authenticated');
  END IF;
  
  -- Calculate rewards based on duration and type
  IF meditation_type = 'stretching' THEN
    hp_restoration := GREATEST(8, FLOOR(duration_minutes / 3));
    xp_gain := GREATEST(15, FLOOR(duration_minutes * 1.2));
  ELSE -- meditation
    hp_restoration := GREATEST(5, FLOOR(duration_minutes / 2));
    xp_gain := GREATEST(10, FLOOR(duration_minutes * 1.0));
  END IF;
  
  -- Create session
  INSERT INTO public.sessions (
    creator_id, session_type, format, max_players, 
    stakes_amount, status, is_private, notes
  )
  VALUES (
    user_id, 'wellbeing', 'singles', 1,
    0, 'completed', true, 
    COALESCE(notes, meditation_type || ' session for ' || duration_minutes || ' minutes')
  )
  RETURNING id INTO session_id;
  
  -- Add participant
  INSERT INTO public.session_participants (
    session_id, user_id, status, joined_at
  )
  VALUES (session_id, user_id, 'completed', now());
  
  -- Restore HP
  PERFORM public.restore_hp(
    user_id, 
    hp_restoration, 
    'wellbeing_' || meditation_type,
    meditation_type || ' session HP restoration'
  );
  
  -- Award XP
  PERFORM public.add_xp(
    user_id,
    xp_gain,
    'wellbeing_' || meditation_type,
    meditation_type || ' session XP reward'
  );
  
  -- Award tokens
  PERFORM public.add_tokens(
    user_id,
    FLOOR(xp_gain / 2),
    'regular',
    'wellbeing_' || meditation_type,
    meditation_type || ' session token reward'
  );
  
  result := json_build_object(
    'success', true,
    'session_id', session_id,
    'hp_restored', hp_restoration,
    'xp_gained', xp_gain,
    'tokens_earned', FLOOR(xp_gain / 2),
    'duration_minutes', duration_minutes,
    'meditation_type', meditation_type
  );
  
  RETURN result;
END;
$$;