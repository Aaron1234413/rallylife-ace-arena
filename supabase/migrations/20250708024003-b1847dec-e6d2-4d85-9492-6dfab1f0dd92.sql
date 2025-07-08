-- Phase 5: Database Functions for Social Features

-- Function to update member last_seen timestamp
CREATE OR REPLACE FUNCTION public.update_member_last_seen(club_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.member_status (user_id, club_id, status, last_seen)
  VALUES (auth.uid(), club_id_param, 'online', now())
  ON CONFLICT (user_id, club_id)
  DO UPDATE SET 
    last_seen = now(),
    updated_at = now();
END;
$$;

-- Function to set play availability (reuse existing play_availability table)
CREATE OR REPLACE FUNCTION public.set_play_availability(
  club_id_param UUID,
  available_until_param TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  message_param TEXT DEFAULT NULL,
  session_type_param TEXT DEFAULT 'casual'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  availability_id UUID;
  result JSON;
BEGIN
  -- Cancel any existing active availability
  UPDATE public.play_availability 
  SET status = 'cancelled', updated_at = now()
  WHERE user_id = auth.uid() AND club_id = club_id_param AND status = 'active';
  
  -- Create new availability entry
  INSERT INTO public.play_availability (
    user_id, club_id, available_until, message, preferred_session_type
  )
  VALUES (
    auth.uid(), club_id_param, available_until_param, message_param, session_type_param
  )
  RETURNING id INTO availability_id;
  
  -- Update member status
  INSERT INTO public.member_status (user_id, club_id, status, availability_message, last_seen)
  VALUES (auth.uid(), club_id_param, 'looking_to_play', message_param, now())
  ON CONFLICT (user_id, club_id)
  DO UPDATE SET 
    status = 'looking_to_play',
    availability_message = message_param,
    last_seen = now(),
    updated_at = now();
  
  -- Add to activity stream
  INSERT INTO public.club_activity_stream (club_id, user_id, activity_type, activity_data)
  VALUES (
    club_id_param, 
    auth.uid(), 
    'looking_to_play',
    jsonb_build_object(
      'message', message_param,
      'session_type', session_type_param,
      'available_until', available_until_param
    )
  );
  
  result := json_build_object(
    'success', true,
    'availability_id', availability_id,
    'message', 'Looking to play status updated'
  );
  
  RETURN result;
END;
$$;

-- Function to stop looking to play
CREATE OR REPLACE FUNCTION public.stop_looking_to_play(club_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Cancel active availability
  UPDATE public.play_availability 
  SET status = 'cancelled', updated_at = now()
  WHERE user_id = auth.uid() AND club_id = club_id_param AND status = 'active';
  
  -- Update member status to online
  UPDATE public.member_status 
  SET status = 'online', availability_message = NULL, updated_at = now()
  WHERE user_id = auth.uid() AND club_id = club_id_param;
  
  RETURN json_build_object('success', true, 'message', 'No longer looking to play');
END;
$$;