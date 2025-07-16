-- Add UTR-related columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS utr_rating DECIMAL(3,1);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS utr_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS manual_level TEXT;

-- Create index for UTR rating for matchmaking queries
CREATE INDEX IF NOT EXISTS idx_profiles_utr_rating ON public.profiles(utr_rating) WHERE utr_rating IS NOT NULL;

-- Create index for manual level for fallback matchmaking
CREATE INDEX IF NOT EXISTS idx_profiles_manual_level ON public.profiles(manual_level) WHERE manual_level IS NOT NULL;