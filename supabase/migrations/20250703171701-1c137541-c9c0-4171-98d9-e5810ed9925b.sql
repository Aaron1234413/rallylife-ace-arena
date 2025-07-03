-- Create the missing log_club_activity function
CREATE OR REPLACE FUNCTION public.log_club_activity(
  club_id_param UUID,
  user_id_param UUID,
  activity_type_param TEXT,
  activity_data_param JSON
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into club_activity_feed table
  INSERT INTO public.club_activity_feed (
    club_id,
    user_id,
    activity_type,
    activity_data
  )
  VALUES (
    club_id_param,
    user_id_param,
    activity_type_param,
    activity_data_param::jsonb
  );
END;
$$;