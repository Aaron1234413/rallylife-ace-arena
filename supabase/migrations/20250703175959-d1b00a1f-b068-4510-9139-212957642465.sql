-- Create coach services table for club coaching functionality
CREATE TABLE public.coach_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  club_id UUID NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'lesson',
  title TEXT NOT NULL,
  description TEXT,
  rate_tokens INTEGER NOT NULL DEFAULT 50,
  rate_money NUMERIC NOT NULL DEFAULT 25.00,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  max_participants INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coach bookings table
CREATE TABLE public.coach_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  player_id UUID NOT NULL,
  club_id UUID NOT NULL,
  service_id UUID NOT NULL,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  total_cost_tokens INTEGER NOT NULL DEFAULT 0,
  total_cost_money NUMERIC NOT NULL DEFAULT 0.00,
  payment_method TEXT NOT NULL DEFAULT 'tokens',
  status TEXT NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  feedback_rating INTEGER,
  feedback_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on coach services
ALTER TABLE public.coach_services ENABLE ROW LEVEL SECURITY;

-- Enable RLS on coach bookings  
ALTER TABLE public.coach_bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies for coach_services
CREATE POLICY "Club members can view coach services" 
ON public.coach_services 
FOR SELECT 
USING (
  club_id IN (
    SELECT club_memberships.club_id 
    FROM club_memberships 
    WHERE club_memberships.user_id = auth.uid() 
    AND club_memberships.status = 'active'
  ) OR 
  club_id IN (
    SELECT clubs.id 
    FROM clubs 
    WHERE clubs.is_public = true
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
    SELECT club_memberships.club_id 
    FROM club_memberships 
    WHERE club_memberships.user_id = auth.uid() 
    AND club_memberships.status = 'active'
  )
);

CREATE POLICY "Coaches and players can update their bookings" 
ON public.coach_bookings 
FOR UPDATE 
USING (player_id = auth.uid() OR coach_id = auth.uid());

-- Add foreign key constraints
ALTER TABLE public.coach_services 
ADD CONSTRAINT coach_services_coach_id_fkey 
FOREIGN KEY (coach_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.coach_services 
ADD CONSTRAINT coach_services_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;

ALTER TABLE public.coach_bookings 
ADD CONSTRAINT coach_bookings_coach_id_fkey 
FOREIGN KEY (coach_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.coach_bookings 
ADD CONSTRAINT coach_bookings_player_id_fkey 
FOREIGN KEY (player_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.coach_bookings 
ADD CONSTRAINT coach_bookings_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;

ALTER TABLE public.coach_bookings 
ADD CONSTRAINT coach_bookings_service_id_fkey 
FOREIGN KEY (service_id) REFERENCES public.coach_services(id) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX idx_coach_services_club_id ON public.coach_services(club_id);
CREATE INDEX idx_coach_services_coach_id ON public.coach_services(coach_id);
CREATE INDEX idx_coach_bookings_club_id ON public.coach_bookings(club_id);
CREATE INDEX idx_coach_bookings_coach_id ON public.coach_bookings(coach_id);
CREATE INDEX idx_coach_bookings_player_id ON public.coach_bookings(player_id);
CREATE INDEX idx_coach_bookings_start_datetime ON public.coach_bookings(start_datetime);

-- Create updated_at trigger for coach_services
CREATE TRIGGER update_coach_services_updated_at
  BEFORE UPDATE ON public.coach_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for coach_bookings
CREATE TRIGGER update_coach_bookings_updated_at
  BEFORE UPDATE ON public.coach_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();