-- Court booking system
CREATE TABLE court_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES clubs(id),
  court_id UUID REFERENCES club_courts(id),
  player_id UUID NOT NULL,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  booking_type TEXT DEFAULT 'practice', -- practice, match, lesson
  opponent_id UUID,
  coach_id UUID,
  status TEXT DEFAULT 'confirmed', -- confirmed, cancelled, completed
  payment_method TEXT DEFAULT 'tokens',
  cost_tokens INTEGER DEFAULT 0,
  cost_money DECIMAL DEFAULT 0,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Coach services offered at clubs
CREATE TABLE club_coach_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES clubs(id),
  coach_id UUID NOT NULL,
  service_type TEXT NOT NULL, -- lesson, training, clinic
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price_tokens INTEGER NOT NULL,
  price_money DECIMAL DEFAULT 0,
  max_participants INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE court_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_coach_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for court_bookings
CREATE POLICY "Club members can view court bookings" 
ON court_bookings FOR SELECT 
USING (
  club_id IN (
    SELECT club_id FROM club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Players can create their own bookings" 
ON court_bookings FOR INSERT 
WITH CHECK (
  auth.uid() = player_id AND 
  club_id IN (
    SELECT club_id FROM club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Players can update their own bookings" 
ON court_bookings FOR UPDATE 
USING (auth.uid() = player_id);

CREATE POLICY "Players can cancel their own bookings" 
ON court_bookings FOR DELETE 
USING (auth.uid() = player_id);

-- RLS Policies for club_coach_services
CREATE POLICY "Club members can view coach services" 
ON club_coach_services FOR SELECT 
USING (
  club_id IN (
    SELECT club_id FROM club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Coaches can manage their own services" 
ON club_coach_services FOR ALL 
USING (auth.uid() = coach_id);

CREATE POLICY "Club admins can manage coach services" 
ON club_coach_services FOR ALL 
USING (
  club_id IN (
    SELECT cm.club_id FROM club_memberships cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active' 
    AND cm.role IN ('owner', 'admin')
  )
);