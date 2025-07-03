-- Insert mock coach and player profiles with email addresses
INSERT INTO public.profiles (id, email, full_name, role, avatar_url, created_at) VALUES
-- Mock Coaches
('11111111-1111-1111-1111-111111111111', 'sven.lah@mockcoach.com', 'Sven Lah', 'coach', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', now()),
('22222222-2222-2222-2222-222222222222', 'pierre.montolegro@mockcoach.com', 'Pierre Montolegro', 'coach', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', now()),
('33333333-3333-3333-3333-333333333333', 'gene.gaiser@mockcoach.com', 'Gene Gaiser', 'coach', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face', now()),
('44444444-4444-4444-4444-444444444444', 'shawn.stillman@mockcoach.com', 'Shawn Stillman', 'coach', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face', now()),
('55555555-5555-5555-5555-555555555555', 'shawn.meiser@mockcoach.com', 'Shawn Meiser', 'coach', 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face', now()),
-- Mock Players
('66666666-6666-6666-6666-666666666666', 'alex.chen@mockplayer.com', 'Alex Chen', 'player', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face', now()),
('77777777-7777-7777-7777-777777777777', 'maria.garcia@mockplayer.com', 'Maria Garcia', 'player', 'https://images.unsplash.com/photo-1494790108755-2616b9f71174?w=150&h=150&fit=crop&crop=face', now()),
('88888888-8888-8888-8888-888888888888', 'john.smith@mockplayer.com', 'John Smith', 'player', 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face', now()),
('99999999-9999-9999-9999-999999999999', 'emma.wilson@mockplayer.com', 'Emma Wilson', 'player', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', now()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'david.lee@mockplayer.com', 'David Lee', 'player', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', now()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sophie.brown@mockplayer.com', 'Sophie Brown', 'player', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face', now()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'james.wilson@mockplayer.com', 'James Wilson', 'player', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', now())
ON CONFLICT (id) DO NOTHING;

-- Insert coach CXP data
INSERT INTO public.coach_cxp (coach_id, current_level, total_cxp_earned, current_cxp, cxp_to_next_level, coaching_tier) VALUES
('11111111-1111-1111-1111-111111111111', 8, 4200, 420, 580, 'Elite'),
('22222222-2222-2222-2222-222222222222', 6, 2800, 300, 700, 'Advanced'),
('33333333-3333-3333-3333-333333333333', 5, 2150, 150, 850, 'Intermediate'),
('44444444-4444-4444-4444-444444444444', 7, 3500, 500, 500, 'Elite'),
('55555555-5555-5555-5555-555555555555', 4, 1650, 650, 350, 'Intermediate')
ON CONFLICT (coach_id) DO NOTHING;

-- Insert coach CRP data
INSERT INTO public.coach_crp (coach_id, current_crp, total_crp_earned, reputation_level, visibility_score) VALUES
('11111111-1111-1111-1111-111111111111', 450, 1200, 'platinum', 4.8),
('22222222-2222-2222-2222-222222222222', 380, 950, 'gold', 4.5),
('33333333-3333-3333-3333-333333333333', 320, 780, 'gold', 4.2),
('44444444-4444-4444-4444-444444444444', 410, 1050, 'platinum', 4.6),
('55555555-5555-5555-5555-555555555555', 285, 650, 'silver', 3.9)
ON CONFLICT (coach_id) DO NOTHING;

-- Insert coach token data
INSERT INTO public.coach_tokens (coach_id, current_tokens, lifetime_earned) VALUES
('11111111-1111-1111-1111-111111111111', 850, 2100),
('22222222-2222-2222-2222-222222222222', 650, 1650),
('33333333-3333-3333-3333-333333333333', 450, 1200),
('44444444-4444-4444-4444-444444444444', 720, 1800),
('55555555-5555-5555-5555-555555555555', 380, 950)
ON CONFLICT (coach_id) DO NOTHING;

-- Insert player XP data
INSERT INTO public.player_xp (player_id, current_level, total_xp_earned, current_xp, xp_to_next_level) VALUES
('66666666-6666-6666-6666-666666666666', 6, 850, 350, 150),
('77777777-7777-7777-7777-777777777777', 5, 720, 220, 280),
('88888888-8888-8888-8888-888888888888', 4, 580, 80, 420),
('99999999-9999-9999-9999-999999999999', 3, 520, 20, 480),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4, 680, 180, 320),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 3, 450, 450, 50),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 5, 732, 232, 268)
ON CONFLICT (player_id) DO NOTHING;

-- Insert player HP data
INSERT INTO public.player_hp (player_id, current_hp, max_hp) VALUES
('66666666-6666-6666-6666-666666666666', 85, 100),
('77777777-7777-7777-7777-777777777777', 92, 100),
('88888888-8888-8888-8888-888888888888', 78, 100),
('99999999-9999-9999-9999-999999999999', 88, 100),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 95, 100),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 72, 100),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 90, 100)
ON CONFLICT (player_id) DO NOTHING;

-- Insert player token data
INSERT INTO public.token_balances (player_id, regular_tokens, premium_tokens, lifetime_earned) VALUES
('66666666-6666-6666-6666-666666666666', 425, 12, 850),
('77777777-7777-7777-7777-777777777777', 360, 8, 720),
('88888888-8888-8888-8888-888888888888', 290, 5, 580),
('99999999-9999-9999-9999-999999999999', 260, 3, 520),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 340, 7, 680),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 225, 2, 450),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 366, 9, 732)
ON CONFLICT (player_id) DO NOTHING;