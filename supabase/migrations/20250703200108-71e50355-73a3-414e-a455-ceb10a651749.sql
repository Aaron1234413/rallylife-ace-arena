-- Add coach statistical data for leaderboards
-- Get coach IDs first
DO $$
DECLARE
    sven_id UUID;
    pierre_id UUID;
    gene_id UUID;
    shawn_s_id UUID;
    shawn_m_id UUID;
    alex_id UUID;
    maria_id UUID;
    john_id UUID;
    emma_id UUID;
BEGIN
    -- Get coach IDs
    SELECT id INTO sven_id FROM public.profiles WHERE full_name = 'Sven Lah' AND role = 'coach';
    SELECT id INTO pierre_id FROM public.profiles WHERE full_name = 'Pierre Montolegro' AND role = 'coach';
    SELECT id INTO gene_id FROM public.profiles WHERE full_name = 'Gene Gaiser' AND role = 'coach';
    SELECT id INTO shawn_s_id FROM public.profiles WHERE full_name = 'Shawn Stillman' AND role = 'coach';
    SELECT id INTO shawn_m_id FROM public.profiles WHERE full_name = 'Shawn Meiser' AND role = 'coach';
    
    -- Get player IDs
    SELECT id INTO alex_id FROM public.profiles WHERE full_name = 'Alex Chen' AND role = 'player';
    SELECT id INTO maria_id FROM public.profiles WHERE full_name = 'Maria Garcia' AND role = 'player';
    SELECT id INTO john_id FROM public.profiles WHERE full_name = 'John Smith' AND role = 'player';
    SELECT id INTO emma_id FROM public.profiles WHERE full_name = 'Emma Wilson' AND role = 'player';

    -- Insert coach CXP data if coaches exist
    IF sven_id IS NOT NULL THEN
        INSERT INTO public.coach_cxp (coach_id, current_level, total_cxp_earned, current_cxp, cxp_to_next_level, coaching_tier) 
        VALUES (sven_id, 8, 4200, 420, 580, 'Elite') ON CONFLICT (coach_id) DO UPDATE SET 
        current_level = 8, total_cxp_earned = 4200, current_cxp = 420, cxp_to_next_level = 580, coaching_tier = 'Elite';
    END IF;
    
    IF pierre_id IS NOT NULL THEN
        INSERT INTO public.coach_cxp (coach_id, current_level, total_cxp_earned, current_cxp, cxp_to_next_level, coaching_tier) 
        VALUES (pierre_id, 6, 2800, 300, 700, 'Advanced') ON CONFLICT (coach_id) DO UPDATE SET 
        current_level = 6, total_cxp_earned = 2800, current_cxp = 300, cxp_to_next_level = 700, coaching_tier = 'Advanced';
    END IF;
    
    IF gene_id IS NOT NULL THEN
        INSERT INTO public.coach_cxp (coach_id, current_level, total_cxp_earned, current_cxp, cxp_to_next_level, coaching_tier) 
        VALUES (gene_id, 5, 2150, 150, 850, 'Intermediate') ON CONFLICT (coach_id) DO UPDATE SET 
        current_level = 5, total_cxp_earned = 2150, current_cxp = 150, cxp_to_next_level = 850, coaching_tier = 'Intermediate';
    END IF;
    
    IF shawn_s_id IS NOT NULL THEN
        INSERT INTO public.coach_cxp (coach_id, current_level, total_cxp_earned, current_cxp, cxp_to_next_level, coaching_tier) 
        VALUES (shawn_s_id, 7, 3500, 500, 500, 'Elite') ON CONFLICT (coach_id) DO UPDATE SET 
        current_level = 7, total_cxp_earned = 3500, current_cxp = 500, cxp_to_next_level = 500, coaching_tier = 'Elite';
    END IF;
    
    IF shawn_m_id IS NOT NULL THEN
        INSERT INTO public.coach_cxp (coach_id, current_level, total_cxp_earned, current_cxp, cxp_to_next_level, coaching_tier) 
        VALUES (shawn_m_id, 4, 1650, 650, 350, 'Intermediate') ON CONFLICT (coach_id) DO UPDATE SET 
        current_level = 4, total_cxp_earned = 1650, current_cxp = 650, cxp_to_next_level = 350, coaching_tier = 'Intermediate';
    END IF;

    -- Insert player XP data if players exist
    IF alex_id IS NOT NULL THEN
        INSERT INTO public.player_xp (player_id, current_level, total_xp_earned, current_xp, xp_to_next_level) 
        VALUES (alex_id, 6, 850, 350, 150) ON CONFLICT (player_id) DO UPDATE SET 
        current_level = 6, total_xp_earned = 850, current_xp = 350, xp_to_next_level = 150;
    END IF;
    
    IF maria_id IS NOT NULL THEN
        INSERT INTO public.player_xp (player_id, current_level, total_xp_earned, current_xp, xp_to_next_level) 
        VALUES (maria_id, 5, 720, 220, 280) ON CONFLICT (player_id) DO UPDATE SET 
        current_level = 5, total_xp_earned = 720, current_xp = 220, xp_to_next_level = 280;
    END IF;
    
    IF john_id IS NOT NULL THEN
        INSERT INTO public.player_xp (player_id, current_level, total_xp_earned, current_xp, xp_to_next_level) 
        VALUES (john_id, 4, 580, 80, 420) ON CONFLICT (player_id) DO UPDATE SET 
        current_level = 4, total_xp_earned = 580, current_xp = 80, xp_to_next_level = 420;
    END IF;
    
    IF emma_id IS NOT NULL THEN
        INSERT INTO public.player_xp (player_id, current_level, total_xp_earned, current_xp, xp_to_next_level) 
        VALUES (emma_id, 3, 520, 20, 480) ON CONFLICT (player_id) DO UPDATE SET 
        current_level = 3, total_xp_earned = 520, current_xp = 20, xp_to_next_level = 480;
    END IF;
END $$;