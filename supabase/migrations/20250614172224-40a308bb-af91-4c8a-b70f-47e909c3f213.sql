
-- Create scheduling-related tables for the Communication Hub

-- Table for available time slots that coaches can set
CREATE TABLE public.coach_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Table for scheduled appointments/lessons
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  appointment_type TEXT NOT NULL DEFAULT 'lesson' CHECK (appointment_type IN ('lesson', 'consultation', 'assessment', 'practice_session')),
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
  location TEXT,
  notes TEXT,
  price_amount DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES public.profiles(id),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  CONSTRAINT valid_appointment_time CHECK (end_time > start_time),
  CONSTRAINT future_appointment CHECK (scheduled_date >= CURRENT_DATE OR (scheduled_date = CURRENT_DATE AND start_time >= CURRENT_TIME))
);

-- Table for appointment requests (when players request to book)
CREATE TABLE public.appointment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requested_date DATE NOT NULL,
  requested_start_time TIME NOT NULL,
  requested_end_time TIME NOT NULL,
  appointment_type TEXT NOT NULL DEFAULT 'lesson',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'expired')),
  response_message TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '72 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for recurring appointment schedules
CREATE TABLE public.recurring_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  appointment_type TEXT NOT NULL DEFAULT 'lesson',
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  recurrence_pattern TEXT NOT NULL CHECK (recurrence_pattern IN ('weekly', 'biweekly', 'monthly')),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  location TEXT,
  price_amount DECIMAL(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.coach_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coach_availability
CREATE POLICY "Coaches can manage their own availability" ON public.coach_availability
  FOR ALL USING (auth.uid() = coach_id);

CREATE POLICY "Players can view coach availability" ON public.coach_availability
  FOR SELECT USING (is_active = true);

-- RLS Policies for appointments
CREATE POLICY "Users can view their own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = coach_id OR auth.uid() = player_id);

CREATE POLICY "Coaches can manage appointments they're involved in" ON public.appointments
  FOR ALL USING (auth.uid() = coach_id);

CREATE POLICY "Players can view and update their appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = player_id);

CREATE POLICY "Players can update their appointment status" ON public.appointments
  FOR UPDATE USING (auth.uid() = player_id);

-- RLS Policies for appointment_requests
CREATE POLICY "Users can view their own appointment requests" ON public.appointment_requests
  FOR SELECT USING (auth.uid() = coach_id OR auth.uid() = player_id);

CREATE POLICY "Players can create appointment requests" ON public.appointment_requests
  FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Coaches can respond to their appointment requests" ON public.appointment_requests
  FOR UPDATE USING (auth.uid() = coach_id);

-- RLS Policies for recurring_schedules
CREATE POLICY "Users can view their own recurring schedules" ON public.recurring_schedules
  FOR SELECT USING (auth.uid() = coach_id OR auth.uid() = player_id);

CREATE POLICY "Coaches can manage their recurring schedules" ON public.recurring_schedules
  FOR ALL USING (auth.uid() = coach_id);

-- Create indexes for better performance
CREATE INDEX idx_coach_availability_coach_day ON public.coach_availability(coach_id, day_of_week);
CREATE INDEX idx_appointments_coach_date ON public.appointments(coach_id, scheduled_date);
CREATE INDEX idx_appointments_player_date ON public.appointments(player_id, scheduled_date);
CREATE INDEX idx_appointment_requests_coach_status ON public.appointment_requests(coach_id, status);
CREATE INDEX idx_recurring_schedules_coach_active ON public.recurring_schedules(coach_id, is_active);

-- Function to check coach availability for a specific time slot
CREATE OR REPLACE FUNCTION public.check_coach_availability(
  coach_user_id UUID,
  check_date DATE,
  start_time_param TIME,
  end_time_param TIME
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  day_of_week_num INTEGER;
  availability_exists BOOLEAN := false;
  conflict_exists BOOLEAN := false;
BEGIN
  -- Get day of week (0 = Sunday, 6 = Saturday)
  day_of_week_num := EXTRACT(DOW FROM check_date);
  
  -- Check if coach has availability set for this day and time
  SELECT EXISTS (
    SELECT 1 FROM public.coach_availability ca
    WHERE ca.coach_id = coach_user_id
      AND ca.day_of_week = day_of_week_num
      AND ca.is_active = true
      AND ca.start_time <= start_time_param
      AND ca.end_time >= end_time_param
  ) INTO availability_exists;
  
  -- Check for existing appointments that conflict
  SELECT EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.coach_id = coach_user_id
      AND a.scheduled_date = check_date
      AND a.status NOT IN ('cancelled', 'rescheduled')
      AND (
        (a.start_time <= start_time_param AND a.end_time > start_time_param) OR
        (a.start_time < end_time_param AND a.end_time >= end_time_param) OR
        (a.start_time >= start_time_param AND a.end_time <= end_time_param)
      )
  ) INTO conflict_exists;
  
  RETURN availability_exists AND NOT conflict_exists;
END;
$$;

-- Function to create an appointment request
CREATE OR REPLACE FUNCTION public.create_appointment_request(
  coach_user_id UUID,
  requested_date_param DATE,
  requested_start_time_param TIME,
  requested_end_time_param TIME,
  appointment_type_param TEXT DEFAULT 'lesson',
  message_param TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  player_user_id UUID;
  request_id UUID;
  is_available BOOLEAN;
  result JSON;
BEGIN
  player_user_id := auth.uid();
  
  -- Check if the requested time slot is available
  SELECT public.check_coach_availability(
    coach_user_id, 
    requested_date_param, 
    requested_start_time_param, 
    requested_end_time_param
  ) INTO is_available;
  
  IF NOT is_available THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Requested time slot is not available'
    );
  END IF;
  
  -- Create the appointment request
  INSERT INTO public.appointment_requests (
    coach_id, player_id, requested_date, requested_start_time, 
    requested_end_time, appointment_type, message
  )
  VALUES (
    coach_user_id, player_user_id, requested_date_param, 
    requested_start_time_param, requested_end_time_param, 
    appointment_type_param, message_param
  )
  RETURNING id INTO request_id;
  
  result := json_build_object(
    'success', true,
    'request_id', request_id,
    'message', 'Appointment request created successfully'
  );
  
  RETURN result;
END;
$$;

-- Function to approve an appointment request and create the appointment
CREATE OR REPLACE FUNCTION public.approve_appointment_request(
  request_id UUID,
  response_message_param TEXT DEFAULT NULL,
  price_amount_param DECIMAL DEFAULT NULL,
  location_param TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_record RECORD;
  appointment_id UUID;
  coach_user_id UUID;
  result JSON;
BEGIN
  coach_user_id := auth.uid();
  
  -- Get the request details
  SELECT * INTO request_record
  FROM public.appointment_requests
  WHERE id = request_id AND coach_id = coach_user_id AND status = 'pending';
  
  IF request_record IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Request not found or already processed'
    );
  END IF;
  
  -- Create the appointment
  INSERT INTO public.appointments (
    coach_id, player_id, title, appointment_type, scheduled_date,
    start_time, end_time, duration_minutes, price_amount, location,
    status
  )
  VALUES (
    request_record.coach_id, request_record.player_id,
    'Scheduled ' || request_record.appointment_type,
    request_record.appointment_type, request_record.requested_date,
    request_record.requested_start_time, request_record.requested_end_time,
    EXTRACT(EPOCH FROM (request_record.requested_end_time - request_record.requested_start_time)) / 60,
    price_amount_param, location_param, 'confirmed'
  )
  RETURNING id INTO appointment_id;
  
  -- Update the request status
  UPDATE public.appointment_requests
  SET status = 'approved',
      response_message = response_message_param,
      responded_at = now()
  WHERE id = request_id;
  
  result := json_build_object(
    'success', true,
    'appointment_id', appointment_id,
    'message', 'Appointment request approved and appointment created'
  );
  
  RETURN result;
END;
$$;

-- Function to get upcoming appointments for a user
CREATE OR REPLACE FUNCTION public.get_upcoming_appointments(
  user_id UUID DEFAULT auth.uid(),
  days_ahead INTEGER DEFAULT 30
) RETURNS TABLE(
  id UUID,
  coach_id UUID,
  player_id UUID,
  coach_name TEXT,
  player_name TEXT,
  title TEXT,
  appointment_type TEXT,
  scheduled_date DATE,
  start_time TIME,
  end_time TIME,
  duration_minutes INTEGER,
  status TEXT,
  location TEXT,
  price_amount DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.coach_id,
    a.player_id,
    cp.full_name as coach_name,
    pp.full_name as player_name,
    a.title,
    a.appointment_type,
    a.scheduled_date,
    a.start_time,
    a.end_time,
    a.duration_minutes,
    a.status,
    a.location,
    a.price_amount,
    a.created_at
  FROM public.appointments a
  JOIN public.profiles cp ON a.coach_id = cp.id
  JOIN public.profiles pp ON a.player_id = pp.id
  WHERE (a.coach_id = user_id OR a.player_id = user_id)
    AND a.scheduled_date >= CURRENT_DATE
    AND a.scheduled_date <= CURRENT_DATE + (days_ahead || ' days')::INTERVAL
    AND a.status NOT IN ('cancelled')
  ORDER BY a.scheduled_date ASC, a.start_time ASC;
END;
$$;
