-- Phase 4: Coach Integration & Advanced Features Database Setup

-- Extend club_memberships role to include 'coach'
ALTER TABLE public.club_memberships 
DROP CONSTRAINT IF EXISTS club_memberships_role_check;

ALTER TABLE public.club_memberships 
ADD CONSTRAINT club_memberships_role_check 
CHECK (role IN ('owner', 'admin', 'moderator', 'coach', 'member'));

-- Create coach_services table
CREATE TABLE public.coach_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL, -- 'lesson', 'training', 'consultation', 'assessment'
  title TEXT NOT NULL,
  description TEXT,
  rate_tokens INTEGER NOT NULL DEFAULT 0,
  rate_money DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_participants INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coach_id, club_id, service_type, title)
);

-- Create coach_bookings table
CREATE TABLE public.coach_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  player_id UUID NOT NULL,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.coach_services(id) ON DELETE CASCADE,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  total_cost_tokens INTEGER NOT NULL DEFAULT 0,
  total_cost_money DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_method TEXT NOT NULL DEFAULT 'tokens', -- 'tokens', 'money', 'mixed'
  status TEXT NOT NULL DEFAULT 'confirmed', -- 'pending', 'confirmed', 'cancelled', 'completed'
  notes TEXT,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (start_datetime < end_datetime),
  CHECK (total_cost_tokens >= 0),
  CHECK (total_cost_money >= 0)
);

-- Create club_events table
CREATE TABLE public.club_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- 'tournament', 'social', 'training', 'meeting'
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  max_participants INTEGER,
  registration_fee_tokens INTEGER DEFAULT 0,
  registration_fee_money DECIMAL(10,2) DEFAULT 0.00,
  is_public BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed', 'cancelled'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (start_datetime < end_datetime)
);

-- Create club_event_participants table
CREATE TABLE public.club_event_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.club_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  registration_datetime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
  attendance_status TEXT NOT NULL DEFAULT 'registered', -- 'registered', 'attended', 'no_show'
  notes TEXT,
  UNIQUE(event_id, user_id)
);

-- Create club_achievements table
CREATE TABLE public.club_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'participation', 'skill', 'social', 'contribution'
  tier TEXT NOT NULL DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  requirement_type TEXT NOT NULL, -- 'event_participation', 'court_bookings', 'training_sessions'
  requirement_value INTEGER NOT NULL,
  reward_tokens INTEGER DEFAULT 0,
  reward_premium_tokens INTEGER DEFAULT 0,
  icon_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create club_achievement_progress table
CREATE TABLE public.club_achievement_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.club_achievements(id) ON DELETE CASCADE,
  current_progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(club_id, user_id, achievement_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.coach_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_achievement_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for coach_services
CREATE POLICY "Club members can view coach services"
ON public.coach_services
FOR SELECT
USING (
  club_id IN (
    SELECT club_id FROM public.club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR club_id IN (
    SELECT id FROM public.clubs WHERE is_public = true
  )
);

CREATE POLICY "Coaches can manage their own services"
ON public.coach_services
FOR ALL
USING (auth.uid() = coach_id)
WITH CHECK (auth.uid() = coach_id);

-- RLS policies for coach_bookings
CREATE POLICY "Users can view their own coach bookings"
ON public.coach_bookings
FOR SELECT
USING (player_id = auth.uid() OR coach_id = auth.uid());

CREATE POLICY "Players can create coach bookings"
ON public.coach_bookings
FOR INSERT
WITH CHECK (
  auth.uid() = player_id AND
  club_id IN (
    SELECT club_id FROM public.club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Coaches and players can update their bookings"
ON public.coach_bookings
FOR UPDATE
USING (player_id = auth.uid() OR coach_id = auth.uid());

-- RLS policies for club_events
CREATE POLICY "Club members can view events"
ON public.club_events
FOR SELECT
USING (
  club_id IN (
    SELECT club_id FROM public.club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR (is_public = true AND club_id IN (
    SELECT id FROM public.clubs WHERE is_public = true
  ))
);

CREATE POLICY "Club organizers can manage events"
ON public.club_events
FOR ALL
USING (
  club_id IN (
    SELECT cm.club_id FROM public.club_memberships cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    AND (cm.role IN ('owner', 'admin', 'moderator') 
         OR ((cm.permissions->>'can_manage_events')::boolean = true))
  )
);

-- RLS policies for club_event_participants
CREATE POLICY "Club members can view event participants"
ON public.club_event_participants
FOR SELECT
USING (
  event_id IN (
    SELECT ce.id FROM public.club_events ce
    JOIN public.club_memberships cm ON ce.club_id = cm.club_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can manage their own event participation"
ON public.club_event_participants
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for club_achievements
CREATE POLICY "Club members can view achievements"
ON public.club_achievements
FOR SELECT
USING (
  club_id IN (
    SELECT club_id FROM public.club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Club admins can manage achievements"
ON public.club_achievements
FOR ALL
USING (
  club_id IN (
    SELECT cm.club_id FROM public.club_memberships cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  )
);

-- RLS policies for club_achievement_progress
CREATE POLICY "Users can view their own achievement progress"
ON public.club_achievement_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage achievement progress"
ON public.club_achievement_progress
FOR ALL
USING (true)
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_coach_services_coach_id ON public.coach_services(coach_id);
CREATE INDEX idx_coach_services_club_id ON public.coach_services(club_id);
CREATE INDEX idx_coach_bookings_coach_id ON public.coach_bookings(coach_id);
CREATE INDEX idx_coach_bookings_player_id ON public.coach_bookings(player_id);
CREATE INDEX idx_coach_bookings_club_id ON public.coach_bookings(club_id);
CREATE INDEX idx_coach_bookings_datetime ON public.coach_bookings(start_datetime, end_datetime);
CREATE INDEX idx_club_events_club_id ON public.club_events(club_id);
CREATE INDEX idx_club_events_datetime ON public.club_events(start_datetime, end_datetime);
CREATE INDEX idx_club_event_participants_event_id ON public.club_event_participants(event_id);
CREATE INDEX idx_club_event_participants_user_id ON public.club_event_participants(user_id);
CREATE INDEX idx_club_achievements_club_id ON public.club_achievements(club_id);
CREATE INDEX idx_club_achievement_progress_user_id ON public.club_achievement_progress(user_id);
CREATE INDEX idx_club_achievement_progress_club_id ON public.club_achievement_progress(club_id);

-- Create triggers for updated_at
CREATE TRIGGER update_coach_services_updated_at
  BEFORE UPDATE ON public.coach_services
  FOR EACH ROW EXECUTE FUNCTION update_court_updated_at();

CREATE TRIGGER update_coach_bookings_updated_at
  BEFORE UPDATE ON public.coach_bookings
  FOR EACH ROW EXECUTE FUNCTION update_court_updated_at();

CREATE TRIGGER update_club_events_updated_at
  BEFORE UPDATE ON public.club_events
  FOR EACH ROW EXECUTE FUNCTION update_court_updated_at();

CREATE TRIGGER update_club_achievements_updated_at
  BEFORE UPDATE ON public.club_achievements
  FOR EACH ROW EXECUTE FUNCTION update_court_updated_at();