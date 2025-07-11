-- Create function to initialize default services for a new club
CREATE OR REPLACE FUNCTION public.create_default_club_services(club_id_param uuid, owner_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Create default services for the club
  INSERT INTO public.club_services (
    club_id, organizer_id, name, description, service_type, 
    price_tokens, price_usd, hybrid_payment_enabled, 
    duration_minutes, max_participants, is_active
  ) VALUES 
  (
    club_id_param, owner_id_param, 'Private Lesson', 
    'One-on-one tennis lesson with certified instructor',
    'lesson', 500, 2500, true, 60, 1, true
  ),
  (
    club_id_param, owner_id_param, 'Clinic Lesson',
    'Group tennis lesson for skill development',
    'lesson', 300, 1800, true, 90, 6, true
  ),
  (
    club_id_param, owner_id_param, 'Court Rental',
    'Reserve a court for recreational play',
    'court_booking', 100, 600, true, 60, 4, true
  );
END;
$function$

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
$function$

-- Create trigger that fires after club insertion
CREATE TRIGGER create_default_services_trigger
  AFTER INSERT ON public.clubs
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_create_default_services();

-- Create RPC function for updating club services
CREATE OR REPLACE FUNCTION public.update_club_service(
  service_id_param uuid,
  service_name text DEFAULT NULL,
  service_description text DEFAULT NULL,
  price_tokens_param integer DEFAULT NULL,
  price_usd_param integer DEFAULT NULL,
  hybrid_payment_enabled_param boolean DEFAULT NULL,
  duration_minutes_param integer DEFAULT NULL,
  max_participants_param integer DEFAULT NULL,
  is_active_param boolean DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  service_record RECORD;
  result json;
BEGIN
  -- Get the service and verify permissions
  SELECT * INTO service_record
  FROM public.club_services
  WHERE id = service_id_param;
  
  IF service_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Service not found');
  END IF;
  
  -- Check if user has permission to update this service
  IF NOT EXISTS (
    SELECT 1 FROM public.club_memberships cm
    JOIN public.clubs c ON cm.club_id = c.id
    WHERE cm.club_id = service_record.club_id 
    AND cm.user_id = auth.uid()
    AND (cm.role IN ('admin', 'owner') OR c.owner_id = auth.uid())
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Permission denied');
  END IF;
  
  -- Update the service with provided values
  UPDATE public.club_services
  SET 
    name = COALESCE(service_name, name),
    description = COALESCE(service_description, description),
    price_tokens = COALESCE(price_tokens_param, price_tokens),
    price_usd = COALESCE(price_usd_param, price_usd),
    hybrid_payment_enabled = COALESCE(hybrid_payment_enabled_param, hybrid_payment_enabled),
    duration_minutes = COALESCE(duration_minutes_param, duration_minutes),
    max_participants = COALESCE(max_participants_param, max_participants),
    is_active = COALESCE(is_active_param, is_active),
    updated_at = now()
  WHERE id = service_id_param;
  
  result := json_build_object(
    'success', true,
    'message', 'Service updated successfully'
  );
  
  RETURN result;
END;
$function$