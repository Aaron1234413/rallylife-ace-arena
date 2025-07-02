-- Create club_courts table
CREATE TABLE public.club_courts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  surface_type TEXT NOT NULL DEFAULT 'hard',
  hourly_rate_tokens INTEGER NOT NULL DEFAULT 50,
  hourly_rate_money DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create court_availability table
CREATE TABLE public.court_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  court_id UUID NOT NULL REFERENCES public.club_courts(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_bookable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(court_id, day_of_week, start_time, end_time)
);

-- Create court_bookings table
CREATE TABLE public.court_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  court_id UUID NOT NULL REFERENCES public.club_courts(id) ON DELETE CASCADE,
  player_id UUID NOT NULL,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  total_cost_tokens INTEGER NOT NULL DEFAULT 0,
  total_cost_money DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_method TEXT NOT NULL DEFAULT 'tokens', -- 'tokens', 'money', 'mixed'
  status TEXT NOT NULL DEFAULT 'confirmed', -- 'pending', 'confirmed', 'cancelled', 'completed'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (start_datetime < end_datetime),
  CHECK (total_cost_tokens >= 0),
  CHECK (total_cost_money >= 0)
);

-- Create court_booking_payments table
CREATE TABLE public.court_booking_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.court_bookings(id) ON DELETE CASCADE,
  amount_tokens INTEGER NOT NULL DEFAULT 0,
  amount_money DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  payment_reference TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all court tables
ALTER TABLE public.club_courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_booking_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for club_courts
CREATE POLICY "Club members can view courts"
ON public.club_courts
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

CREATE POLICY "Club owners and admins can manage courts"
ON public.club_courts
FOR ALL
USING (
  club_id IN (
    SELECT cm.club_id FROM public.club_memberships cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    AND (cm.permissions->>'can_manage_courts')::boolean = true
  )
  OR club_id IN (
    SELECT id FROM public.clubs WHERE owner_id = auth.uid()
  )
);

-- RLS policies for court_availability
CREATE POLICY "Club members can view court availability"
ON public.court_availability
FOR SELECT
USING (
  court_id IN (
    SELECT cc.id FROM public.club_courts cc
    JOIN public.club_memberships cm ON cc.club_id = cm.club_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
  OR court_id IN (
    SELECT cc.id FROM public.club_courts cc
    JOIN public.clubs c ON cc.club_id = c.id
    WHERE c.is_public = true
  )
);

CREATE POLICY "Club owners and admins can manage court availability"
ON public.court_availability
FOR ALL
USING (
  court_id IN (
    SELECT cc.id FROM public.club_courts cc
    JOIN public.club_memberships cm ON cc.club_id = cm.club_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    AND (cm.permissions->>'can_manage_courts')::boolean = true
  )
  OR court_id IN (
    SELECT cc.id FROM public.club_courts cc
    JOIN public.clubs c ON cc.club_id = c.id
    WHERE c.owner_id = auth.uid()
  )
);

-- RLS policies for court_bookings
CREATE POLICY "Users can view their own bookings"
ON public.court_bookings
FOR SELECT
USING (player_id = auth.uid());

CREATE POLICY "Club members can view bookings for their club courts"
ON public.court_bookings
FOR SELECT
USING (
  court_id IN (
    SELECT cc.id FROM public.club_courts cc
    JOIN public.club_memberships cm ON cc.club_id = cm.club_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Club members can create bookings"
ON public.court_bookings
FOR INSERT
WITH CHECK (
  auth.uid() = player_id AND
  court_id IN (
    SELECT cc.id FROM public.club_courts cc
    JOIN public.club_memberships cm ON cc.club_id = cm.club_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can update their own bookings"
ON public.court_bookings
FOR UPDATE
USING (player_id = auth.uid());

CREATE POLICY "Users can delete their own bookings"
ON public.court_bookings
FOR DELETE
USING (player_id = auth.uid());

-- RLS policies for court_booking_payments
CREATE POLICY "Users can view their own booking payments"
ON public.court_booking_payments
FOR SELECT
USING (
  booking_id IN (
    SELECT id FROM public.court_bookings WHERE player_id = auth.uid()
  )
);

CREATE POLICY "System can manage booking payments"
ON public.court_booking_payments
FOR ALL
USING (true)
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_club_courts_club_id ON public.club_courts(club_id);
CREATE INDEX idx_club_courts_active ON public.club_courts(is_active);
CREATE INDEX idx_court_availability_court_id ON public.court_availability(court_id);
CREATE INDEX idx_court_availability_day_time ON public.court_availability(day_of_week, start_time, end_time);
CREATE INDEX idx_court_bookings_court_id ON public.court_bookings(court_id);
CREATE INDEX idx_court_bookings_player_id ON public.court_bookings(player_id);
CREATE INDEX idx_court_bookings_datetime ON public.court_bookings(start_datetime, end_datetime);
CREATE INDEX idx_court_bookings_status ON public.court_bookings(status);
CREATE INDEX idx_court_booking_payments_booking_id ON public.court_booking_payments(booking_id);

-- Function to check booking conflicts
CREATE OR REPLACE FUNCTION check_booking_conflict(
  p_court_id UUID,
  p_start_datetime TIMESTAMP WITH TIME ZONE,
  p_end_datetime TIMESTAMP WITH TIME ZONE,
  p_exclude_booking_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.court_bookings
    WHERE court_id = p_court_id
    AND status IN ('confirmed', 'pending')
    AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
    AND (
      (start_datetime <= p_start_datetime AND end_datetime > p_start_datetime) OR
      (start_datetime < p_end_datetime AND end_datetime >= p_end_datetime) OR
      (start_datetime >= p_start_datetime AND end_datetime <= p_end_datetime)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate booking cost
CREATE OR REPLACE FUNCTION calculate_booking_cost(
  p_court_id UUID,
  p_start_datetime TIMESTAMP WITH TIME ZONE,
  p_end_datetime TIMESTAMP WITH TIME ZONE
) RETURNS JSON AS $$
DECLARE
  court_record RECORD;
  duration_hours NUMERIC;
  total_tokens INTEGER;
  total_money DECIMAL(10,2);
  result JSON;
BEGIN
  -- Get court pricing
  SELECT hourly_rate_tokens, hourly_rate_money
  INTO court_record
  FROM public.club_courts
  WHERE id = p_court_id AND is_active = true;
  
  IF court_record IS NULL THEN
    RETURN json_build_object('error', 'Court not found or inactive');
  END IF;
  
  -- Calculate duration in hours
  duration_hours := EXTRACT(EPOCH FROM (p_end_datetime - p_start_datetime)) / 3600;
  
  -- Calculate costs
  total_tokens := CEIL(duration_hours * court_record.hourly_rate_tokens);
  total_money := ROUND(duration_hours * court_record.hourly_rate_money, 2);
  
  result := json_build_object(
    'duration_hours', duration_hours,
    'hourly_rate_tokens', court_record.hourly_rate_tokens,
    'hourly_rate_money', court_record.hourly_rate_money,
    'total_tokens', total_tokens,
    'total_money', total_money
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create court booking
CREATE OR REPLACE FUNCTION create_court_booking(
  p_court_id UUID,
  p_start_datetime TIMESTAMP WITH TIME ZONE,
  p_end_datetime TIMESTAMP WITH TIME ZONE,
  p_payment_method TEXT DEFAULT 'tokens',
  p_notes TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  booking_id UUID;
  cost_info JSON;
  player_user_id UUID;
  result JSON;
BEGIN
  player_user_id := auth.uid();
  
  -- Check if booking conflicts exist
  IF check_booking_conflict(p_court_id, p_start_datetime, p_end_datetime) THEN
    RETURN json_build_object('success', false, 'error', 'Time slot already booked');
  END IF;
  
  -- Calculate cost
  SELECT calculate_booking_cost(p_court_id, p_start_datetime, p_end_datetime) INTO cost_info;
  
  IF cost_info->>'error' IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', cost_info->>'error');
  END IF;
  
  -- Create booking
  INSERT INTO public.court_bookings (
    court_id, player_id, start_datetime, end_datetime,
    total_cost_tokens, total_cost_money, payment_method, notes
  )
  VALUES (
    p_court_id, player_user_id, p_start_datetime, p_end_datetime,
    (cost_info->>'total_tokens')::INTEGER,
    (cost_info->>'total_money')::DECIMAL,
    p_payment_method, p_notes
  )
  RETURNING id INTO booking_id;
  
  -- Create payment record
  INSERT INTO public.court_booking_payments (
    booking_id,
    amount_tokens,
    amount_money,
    payment_status
  )
  VALUES (
    booking_id,
    CASE WHEN p_payment_method IN ('tokens', 'mixed') THEN (cost_info->>'total_tokens')::INTEGER ELSE 0 END,
    CASE WHEN p_payment_method IN ('money', 'mixed') THEN (cost_info->>'total_money')::DECIMAL ELSE 0.00 END,
    'pending'
  );
  
  result := json_build_object(
    'success', true,
    'booking_id', booking_id,
    'cost_info', cost_info,
    'message', 'Booking created successfully'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update court updated_at timestamp
CREATE OR REPLACE FUNCTION update_court_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_club_courts_updated_at
  BEFORE UPDATE ON public.club_courts
  FOR EACH ROW EXECUTE FUNCTION update_court_updated_at();

CREATE TRIGGER update_court_availability_updated_at
  BEFORE UPDATE ON public.court_availability
  FOR EACH ROW EXECUTE FUNCTION update_court_updated_at();

CREATE TRIGGER update_court_bookings_updated_at
  BEFORE UPDATE ON public.court_bookings
  FOR EACH ROW EXECUTE FUNCTION update_court_updated_at();

CREATE TRIGGER update_court_booking_payments_updated_at
  BEFORE UPDATE ON public.court_booking_payments
  FOR EACH ROW EXECUTE FUNCTION update_court_updated_at();