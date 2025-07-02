-- Create test sessions for verification of complete_session function
-- These will be used to test each session type completion logic

-- Insert test sessions for each type
INSERT INTO public.sessions (id, creator_id, session_type, format, max_players, stakes_amount, status, is_private, notes)
VALUES 
  -- Match session with stakes (winner takes all)
  ('11111111-1111-1111-1111-111111111111'::uuid, 'c2dbbc06-8dfb-4fd5-9ee9-fe57edf91d41'::uuid, 'match', 'singles', 2, 50, 'active', false, 'Test match session'),
  
  -- Social play with stakes (60% organizer, 40% participants)
  ('22222222-2222-2222-2222-222222222222'::uuid, 'c2dbbc06-8dfb-4fd5-9ee9-fe57edf91d41'::uuid, 'social_play', 'doubles', 4, 100, 'active', false, 'Test social play session'),
  
  -- Training session with stakes (stakes refunded equally)
  ('33333333-3333-3333-3333-333333333333'::uuid, 'c2dbbc06-8dfb-4fd5-9ee9-fe57edf91d41'::uuid, 'training', 'singles', 1, 30, 'active', false, 'Test training session'),
  
  -- Wellbeing session with stakes (stakes refunded, HP restored)
  ('44444444-4444-4444-4444-444444444444'::uuid, 'c2dbbc06-8dfb-4fd5-9ee9-fe57edf91d41'::uuid, 'wellbeing', 'singles', 3, 20, 'active', false, 'Test wellbeing session');

-- Add participants to test sessions
INSERT INTO public.session_participants (session_id, user_id, status, joined_at)
VALUES 
  -- Match participants
  ('11111111-1111-1111-1111-111111111111'::uuid, 'c2dbbc06-8dfb-4fd5-9ee9-fe57edf91d41'::uuid, 'joined', NOW()),
  ('11111111-1111-1111-1111-111111111111'::uuid, '67e988d1-cc8b-4191-adeb-59e1b9e57f7f'::uuid, 'joined', NOW()),
  
  -- Social play participants
  ('22222222-2222-2222-2222-222222222222'::uuid, 'c2dbbc06-8dfb-4fd5-9ee9-fe57edf91d41'::uuid, 'joined', NOW()),
  ('22222222-2222-2222-2222-222222222222'::uuid, '67e988d1-cc8b-4191-adeb-59e1b9e57f7f'::uuid, 'joined', NOW()),
  ('22222222-2222-2222-2222-222222222222'::uuid, '68cb0557-dbf9-4bbc-9a68-8ad36930872c'::uuid, 'joined', NOW()),
  
  -- Training participant
  ('33333333-3333-3333-3333-333333333333'::uuid, 'c2dbbc06-8dfb-4fd5-9ee9-fe57edf91d41'::uuid, 'joined', NOW()),
  
  -- Wellbeing participants  
  ('44444444-4444-4444-4444-444444444444'::uuid, 'c2dbbc06-8dfb-4fd5-9ee9-fe57edf91d41'::uuid, 'joined', NOW()),
  ('44444444-4444-4444-4444-444444444444'::uuid, '67e988d1-cc8b-4191-adeb-59e1b9e57f7f'::uuid, 'joined', NOW());