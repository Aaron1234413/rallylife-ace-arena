
-- Update the existing profiles table to add new columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Create player-specific profile data
CREATE TABLE IF NOT EXISTS public.player_profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  skill_level TEXT,
  preferred_play_style TEXT,
  location TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create coach-specific profile data
CREATE TABLE IF NOT EXISTS public.coach_profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  coaching_focus TEXT,
  experience_years INTEGER,
  certifications TEXT[],
  location TEXT,
  bio TEXT,
  hourly_rate DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for player_profiles
CREATE POLICY "Players can view their own player profile" ON public.player_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Players can update their own player profile" ON public.player_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Players can insert their own player profile" ON public.player_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for coach_profiles
CREATE POLICY "Coaches can view their own coach profile" ON public.coach_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Coaches can update their own coach profile" ON public.coach_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Coaches can insert their own coach profile" ON public.coach_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
