-- Update existing profiles with mock coach names and add mock data for leaderboards
-- First, let's update some existing users to be coaches with the requested names
UPDATE public.profiles 
SET full_name = 'Sven Lah', role = 'coach', avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
WHERE id = (SELECT id FROM public.profiles WHERE role = 'coach' LIMIT 1 OFFSET 0);

UPDATE public.profiles 
SET full_name = 'Pierre Montolegro', role = 'coach', avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
WHERE id = (SELECT id FROM public.profiles WHERE full_name != 'Sven Lah' LIMIT 1 OFFSET 0);

UPDATE public.profiles 
SET full_name = 'Gene Gaiser', role = 'coach', avatar_url = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'
WHERE id = (SELECT id FROM public.profiles WHERE full_name NOT IN ('Sven Lah', 'Pierre Montolegro') LIMIT 1 OFFSET 0);

UPDATE public.profiles 
SET full_name = 'Shawn Stillman', role = 'coach', avatar_url = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face'
WHERE id = (SELECT id FROM public.profiles WHERE full_name NOT IN ('Sven Lah', 'Pierre Montolegro', 'Gene Gaiser') LIMIT 1 OFFSET 0);

UPDATE public.profiles 
SET full_name = 'Shawn Meiser', role = 'coach', avatar_url = 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face'
WHERE id = (SELECT id FROM public.profiles WHERE full_name NOT IN ('Sven Lah', 'Pierre Montolegro', 'Gene Gaiser', 'Shawn Stillman') LIMIT 1 OFFSET 0);

-- Update some existing players with consistent mock names
UPDATE public.profiles 
SET full_name = 'Alex Chen', avatar_url = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
WHERE id = (SELECT id FROM public.profiles WHERE role = 'player' AND full_name NOT IN ('Sven Lah', 'Pierre Montolegro', 'Gene Gaiser', 'Shawn Stillman', 'Shawn Meiser') LIMIT 1 OFFSET 0);

UPDATE public.profiles 
SET full_name = 'Maria Garcia', avatar_url = 'https://images.unsplash.com/photo-1494790108755-2616b9f71174?w=150&h=150&fit=crop&crop=face'
WHERE id = (SELECT id FROM public.profiles WHERE role = 'player' AND full_name NOT IN ('Sven Lah', 'Pierre Montolegro', 'Gene Gaiser', 'Shawn Stillman', 'Shawn Meiser', 'Alex Chen') LIMIT 1 OFFSET 0);

UPDATE public.profiles 
SET full_name = 'John Smith', avatar_url = 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face'
WHERE id = (SELECT id FROM public.profiles WHERE role = 'player' AND full_name NOT IN ('Sven Lah', 'Pierre Montolegro', 'Gene Gaiser', 'Shawn Stillman', 'Shawn Meiser', 'Alex Chen', 'Maria Garcia') LIMIT 1 OFFSET 0);

UPDATE public.profiles 
SET full_name = 'Emma Wilson', avatar_url = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
WHERE id = (SELECT id FROM public.profiles WHERE role = 'player' AND full_name NOT IN ('Sven Lah', 'Pierre Montolegro', 'Gene Gaiser', 'Shawn Stillman', 'Shawn Meiser', 'Alex Chen', 'Maria Garcia', 'John Smith') LIMIT 1 OFFSET 0);