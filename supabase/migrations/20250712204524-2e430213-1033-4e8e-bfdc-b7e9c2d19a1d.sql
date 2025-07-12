-- Fix the handle_new_user function to include all necessary initialization
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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
  
  -- Initialize CRP, CXP, and CTK for coaches
  IF COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'player'::public.user_role) = 'coach' THEN
    PERFORM public.initialize_coach_crp(NEW.id);
    PERFORM public.initialize_coach_cxp(NEW.id);
    PERFORM public.initialize_coach_tokens(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;