
-- Table for all possible achievements for coaches
CREATE TABLE public.coach_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g. 'progression', 'coaching', 'community', etc.
  tier TEXT NOT NULL DEFAULT 'bronze',
  requirement_type TEXT NOT NULL, -- e.g. 'cxp_total', 'level_reached', etc.
  requirement_value INTEGER NOT NULL,
  reward_cxp INTEGER DEFAULT 0,
  reward_tokens INTEGER DEFAULT 0,
  reward_special TEXT, -- e.g. badge name or null
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for coach achievement progress
CREATE TABLE public.coach_achievement_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.coach_achievements(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table to track when a coach unlocks an achievement, with claimed state
CREATE TABLE public.coach_achievements_unlocked (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.coach_achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.coach_achievement_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_achievements_unlocked ENABLE ROW LEVEL SECURITY;

-- Coaches can read/write their own progress entries
CREATE POLICY "Coach can select own achievement progress"
ON public.coach_achievement_progress
FOR SELECT
USING (coach_id = auth.uid());

CREATE POLICY "Coach can update own achievement progress"
ON public.coach_achievement_progress
FOR UPDATE
USING (coach_id = auth.uid());

CREATE POLICY "Coach can insert own achievement progress"
ON public.coach_achievement_progress
FOR INSERT
WITH CHECK (coach_id = auth.uid());

-- Coaches can read/unlock/claim their own achievements
CREATE POLICY "Coach can select own unlocked achievements"
ON public.coach_achievements_unlocked
FOR SELECT
USING (coach_id = auth.uid());

CREATE POLICY "Coach can update own unlocked achievements"
ON public.coach_achievements_unlocked
FOR UPDATE
USING (coach_id = auth.uid());

CREATE POLICY "Coach can insert own unlocked achievements"
ON public.coach_achievements_unlocked
FOR INSERT
WITH CHECK (coach_id = auth.uid());

