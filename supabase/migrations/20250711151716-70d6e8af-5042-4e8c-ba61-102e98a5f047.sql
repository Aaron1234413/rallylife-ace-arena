-- Create trigger function to automatically create default services when club is created
CREATE OR REPLACE FUNCTION public.trigger_create_default_services()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Only create default services for new clubs
  PERFORM public.create_default_club_services(NEW.id, NEW.owner_id);
  RETURN NEW;
END;
$function$;