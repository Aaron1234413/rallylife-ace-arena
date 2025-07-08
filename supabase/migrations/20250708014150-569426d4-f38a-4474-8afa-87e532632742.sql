-- Add skill level and social features to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS utr_rating NUMERIC(3,1) DEFAULT 4.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS usta_rating NUMERIC(2,1) DEFAULT 3.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS looking_to_play_until TIMESTAMP WITH TIME ZONE;

-- Add indexes for better performance on skill-based searches
CREATE INDEX IF NOT EXISTS idx_profiles_utr_rating ON public.profiles(utr_rating);
CREATE INDEX IF NOT EXISTS idx_profiles_usta_rating ON public.profiles(usta_rating);
CREATE INDEX IF NOT EXISTS idx_profiles_looking_to_play_until ON public.profiles(looking_to_play_until);

-- Add constraint to ensure valid UTR range (1.0 - 16.5)
ALTER TABLE public.profiles ADD CONSTRAINT check_utr_rating_range 
  CHECK (utr_rating >= 1.0 AND utr_rating <= 16.5);

-- Add constraint to ensure valid USTA range (1.0 - 7.0)
ALTER TABLE public.profiles ADD CONSTRAINT check_usta_rating_range 
  CHECK (usta_rating >= 1.0 AND usta_rating <= 7.0);