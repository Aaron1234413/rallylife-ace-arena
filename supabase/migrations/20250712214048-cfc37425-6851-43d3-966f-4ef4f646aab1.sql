-- Check and fix foreign key constraints that reference users instead of profiles
-- Drop existing foreign key constraints from player tables
ALTER TABLE public.player_hp 
DROP CONSTRAINT IF EXISTS player_hp_player_id_fkey;

ALTER TABLE public.player_xp 
DROP CONSTRAINT IF EXISTS player_xp_player_id_fkey;

ALTER TABLE public.player_avatar_equipped 
DROP CONSTRAINT IF EXISTS player_avatar_equipped_player_id_fkey;

ALTER TABLE public.player_avatar_items 
DROP CONSTRAINT IF EXISTS player_avatar_items_player_id_fkey;

-- Drop existing foreign key constraints from coach tables
ALTER TABLE public.coach_crp 
DROP CONSTRAINT IF EXISTS coach_crp_coach_id_fkey;

ALTER TABLE public.coach_cxp 
DROP CONSTRAINT IF EXISTS coach_cxp_coach_id_fkey;

ALTER TABLE public.coach_tokens 
DROP CONSTRAINT IF EXISTS coach_tokens_coach_id_fkey;

-- Add new foreign key constraints that reference profiles table
ALTER TABLE public.player_hp 
ADD CONSTRAINT player_hp_player_id_fkey 
FOREIGN KEY (player_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.player_xp 
ADD CONSTRAINT player_xp_player_id_fkey 
FOREIGN KEY (player_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.player_avatar_equipped 
ADD CONSTRAINT player_avatar_equipped_player_id_fkey 
FOREIGN KEY (player_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.player_avatar_items 
ADD CONSTRAINT player_avatar_items_player_id_fkey 
FOREIGN KEY (player_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraints for coach tables
ALTER TABLE public.coach_crp 
ADD CONSTRAINT coach_crp_coach_id_fkey 
FOREIGN KEY (coach_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.coach_cxp 
ADD CONSTRAINT coach_cxp_coach_id_fkey 
FOREIGN KEY (coach_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.coach_tokens 
ADD CONSTRAINT coach_tokens_coach_id_fkey 
FOREIGN KEY (coach_id) REFERENCES public.profiles(id) ON DELETE CASCADE;