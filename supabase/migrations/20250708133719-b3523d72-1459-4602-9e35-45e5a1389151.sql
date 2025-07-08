
-- Drop the conflicting function first
DROP FUNCTION IF EXISTS public.set_play_availability(uuid, timestamptz, text, text);
DROP FUNCTION IF EXISTS public.set_play_availability(uuid, text, text, timestamptz);

-- Now recreate our correct version
CREATE OR REPLACE FUNCTION public.set_play_availability(
  club_id_param uuid,
  message_param text DEFAULT NULL,
  session_type_param text DEFAULT 'casual',
  available_until_param timestamptz DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Insert or update member status
  INSERT INTO public.member_status (user_id, club_id, status, availability_message, last_seen)
  VALUES (auth.uid(), club_id_param, 'looking_to_play', message_param, now())
  ON CONFLICT (user_id, club_id) 
  DO UPDATE SET 
    status = 'looking_to_play',
    availability_message = message_param,
    last_seen = now(),
    updated_at = now();

  result := json_build_object(
    'success', true,
    'message', 'You are now looking to play!'
  );

  RETURN result;
END;
$$;
