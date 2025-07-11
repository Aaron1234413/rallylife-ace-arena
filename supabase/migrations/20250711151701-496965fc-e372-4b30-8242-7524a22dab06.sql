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
$function$;