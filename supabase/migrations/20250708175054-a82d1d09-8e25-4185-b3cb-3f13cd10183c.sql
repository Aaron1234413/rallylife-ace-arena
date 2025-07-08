-- Update the handle_new_user function to properly cast role and handle UTR/USTA ratings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email, 
    role,
    utr_rating,
    usta_rating
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', 'User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'player'::public.user_role),
    COALESCE((NEW.raw_user_meta_data ->> 'utr_rating')::numeric, 4.0),
    COALESCE((NEW.raw_user_meta_data ->> 'usta_rating')::numeric, 3.0)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    utr_rating = EXCLUDED.utr_rating,
    usta_rating = EXCLUDED.usta_rating,
    updated_at = now();
  RETURN NEW;
END;
$$;