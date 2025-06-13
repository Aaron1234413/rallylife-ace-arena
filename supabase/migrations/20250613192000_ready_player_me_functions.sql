
-- Create function to update Ready Player Me avatar URL
CREATE OR REPLACE FUNCTION public.update_ready_player_me_avatar(user_id uuid, avatar_url text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Update the profile with the new Ready Player Me URL
  UPDATE public.profiles
  SET ready_player_me_url = avatar_url,
      updated_at = now()
  WHERE id = user_id;
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'avatar_url', avatar_url
  );
END;
$function$

-- Create function to get Ready Player Me avatar URL
CREATE OR REPLACE FUNCTION public.get_ready_player_me_avatar(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  avatar_url TEXT;
BEGIN
  SELECT ready_player_me_url INTO avatar_url
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN avatar_url;
END;
$function$
