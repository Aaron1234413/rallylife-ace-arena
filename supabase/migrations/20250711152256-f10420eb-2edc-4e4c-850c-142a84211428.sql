-- Create default services for existing clubs that don't have any services
INSERT INTO public.club_services (
  club_id, organizer_id, name, description, service_type, 
  price_tokens, price_usd, hybrid_payment_enabled, 
  duration_minutes, max_participants, is_active
)
SELECT 
  c.id as club_id,
  c.owner_id as organizer_id,
  s.name,
  s.description,
  s.service_type,
  s.price_tokens,
  s.price_usd,
  s.hybrid_payment_enabled,
  s.duration_minutes,
  s.max_participants,
  s.is_active
FROM clubs c
CROSS JOIN (
  VALUES 
    ('Private Lesson', 'One-on-one tennis lesson with certified instructor', 'lesson', 500, 2500, true, 60, 1, true),
    ('Clinic Lesson', 'Group tennis lesson for skill development', 'lesson', 300, 1800, true, 90, 6, true),
    ('Court Rental', 'Reserve a court for recreational play', 'court_booking', 100, 600, true, 60, 4, true)
) AS s(name, description, service_type, price_tokens, price_usd, hybrid_payment_enabled, duration_minutes, max_participants, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM club_services cs 
  WHERE cs.club_id = c.id
);