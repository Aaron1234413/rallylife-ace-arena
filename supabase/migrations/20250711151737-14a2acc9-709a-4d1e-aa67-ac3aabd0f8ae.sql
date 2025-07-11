-- Create trigger that fires after club insertion
CREATE TRIGGER create_default_services_trigger
  AFTER INSERT ON public.clubs
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_create_default_services();