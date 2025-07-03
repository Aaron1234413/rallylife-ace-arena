-- Phase 6: Court Booking System
-- Create court bookings table
CREATE TABLE public.court_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL,
  court_id UUID NOT NULL,
  player_id UUID NOT NULL,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  total_cost_tokens INTEGER NOT NULL DEFAULT 0,
  total_cost_money NUMERIC NOT NULL DEFAULT 0.00,
  payment_method TEXT NOT NULL DEFAULT 'tokens',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  booking_status TEXT NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create court availability table for custom schedules
CREATE TABLE public.court_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  court_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create court maintenance/blocking table
CREATE TABLE public.court_maintenance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  court_id UUID NOT NULL,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.court_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_maintenance ENABLE ROW LEVEL SECURITY;

-- RLS policies for court_bookings
CREATE POLICY "Club members can view court bookings" 
ON public.court_bookings 
FOR SELECT 
USING (
  club_id IN (
    SELECT club_memberships.club_id 
    FROM club_memberships 
    WHERE club_memberships.user_id = auth.uid() 
    AND club_memberships.status = 'active'
  )
);

CREATE POLICY "Players can create their own bookings" 
ON public.court_bookings 
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

CREATE POLICY "Players can update their own bookings" 
ON public.court_bookings 
FOR UPDATE 
USING (auth.uid() = player_id);

CREATE POLICY "Club admins can manage all bookings" 
ON public.court_bookings 
FOR ALL 
USING (
  club_id IN (
    SELECT cm.club_id 
    FROM club_memberships cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active' 
    AND (cm.role = ANY (ARRAY['owner', 'admin']) OR 
         ((cm.permissions ->> 'can_manage_courts')::boolean = true))
  )
);

-- RLS policies for court_availability
CREATE POLICY "Club members can view court availability" 
ON public.court_availability 
FOR SELECT 
USING (
  court_id IN (
    SELECT cc.id 
    FROM club_courts cc 
    JOIN club_memberships cm ON cc.club_id = cm.club_id 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Club admins can manage court availability" 
ON public.court_availability 
FOR ALL 
USING (
  court_id IN (
    SELECT cc.id 
    FROM club_courts cc 
    JOIN club_memberships cm ON cc.club_id = cm.club_id 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active' 
    AND (cm.role = ANY (ARRAY['owner', 'admin']) OR 
         ((cm.permissions ->> 'can_manage_courts')::boolean = true))
  )
);

-- RLS policies for court_maintenance
CREATE POLICY "Club members can view maintenance schedules" 
ON public.court_maintenance 
FOR SELECT 
USING (
  court_id IN (
    SELECT cc.id 
    FROM club_courts cc 
    JOIN club_memberships cm ON cc.club_id = cm.club_id 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Club admins can manage maintenance" 
ON public.court_maintenance 
FOR ALL 
USING (
  court_id IN (
    SELECT cc.id 
    FROM club_courts cc 
    JOIN club_memberships cm ON cc.club_id = cm.club_id 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active' 
    AND (cm.role = ANY (ARRAY['owner', 'admin']) OR 
         ((cm.permissions ->> 'can_manage_courts')::boolean = true))
  )
) 
WITH CHECK (auth.uid() = created_by);

-- Add foreign key constraints
ALTER TABLE public.court_bookings 
ADD CONSTRAINT court_bookings_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;

ALTER TABLE public.court_bookings 
ADD CONSTRAINT court_bookings_court_id_fkey 
FOREIGN KEY (court_id) REFERENCES public.club_courts(id) ON DELETE CASCADE;

ALTER TABLE public.court_bookings 
ADD CONSTRAINT court_bookings_player_id_fkey 
FOREIGN KEY (player_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.court_availability 
ADD CONSTRAINT court_availability_court_id_fkey 
FOREIGN KEY (court_id) REFERENCES public.club_courts(id) ON DELETE CASCADE;

ALTER TABLE public.court_maintenance 
ADD CONSTRAINT court_maintenance_court_id_fkey 
FOREIGN KEY (court_id) REFERENCES public.club_courts(id) ON DELETE CASCADE;

ALTER TABLE public.court_maintenance 
ADD CONSTRAINT court_maintenance_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX idx_court_bookings_club_id ON public.court_bookings(club_id);
CREATE INDEX idx_court_bookings_court_id ON public.court_bookings(court_id);
CREATE INDEX idx_court_bookings_player_id ON public.court_bookings(player_id);
CREATE INDEX idx_court_bookings_datetime ON public.court_bookings(start_datetime, end_datetime);
CREATE INDEX idx_court_availability_court_id ON public.court_availability(court_id);
CREATE INDEX idx_court_maintenance_court_id ON public.court_maintenance(court_id);
CREATE INDEX idx_court_maintenance_datetime ON public.court_maintenance(start_datetime, end_datetime);

-- Add unique constraint to prevent double bookings
CREATE UNIQUE INDEX idx_court_bookings_no_overlap 
ON public.court_bookings(court_id, start_datetime, end_datetime)
WHERE booking_status = 'confirmed';

-- Create updated_at triggers
CREATE TRIGGER update_court_bookings_updated_at
  BEFORE UPDATE ON public.court_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_court_availability_updated_at
  BEFORE UPDATE ON public.court_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check booking conflicts
CREATE OR REPLACE FUNCTION check_court_booking_conflict(
  court_id_param UUID,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Check for overlapping bookings
  SELECT COUNT(*)
  INTO conflict_count
  FROM public.court_bookings cb
  WHERE cb.court_id = court_id_param
    AND cb.booking_status = 'confirmed'
    AND (exclude_booking_id IS NULL OR cb.id != exclude_booking_id)
    AND (
      (start_time >= cb.start_datetime AND start_time < cb.end_datetime) OR
      (end_time > cb.start_datetime AND end_time <= cb.end_datetime) OR
      (start_time <= cb.start_datetime AND end_time >= cb.end_datetime)
    );
  
  -- Check for maintenance periods
  SELECT COUNT(*) + conflict_count
  INTO conflict_count
  FROM public.court_maintenance cm
  WHERE cm.court_id = court_id_param
    AND (
      (start_time >= cm.start_datetime AND start_time < cm.end_datetime) OR
      (end_time > cm.start_datetime AND end_time <= cm.end_datetime) OR
      (start_time <= cm.start_datetime AND end_time >= cm.end_datetime)
    );
  
  RETURN conflict_count > 0;
END;
$$;