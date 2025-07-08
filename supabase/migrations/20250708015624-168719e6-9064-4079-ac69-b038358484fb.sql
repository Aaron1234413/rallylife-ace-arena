-- Create play_availability table for "Looking to Play" system
CREATE TABLE public.play_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  club_id UUID NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  preferred_times jsonb, -- e.g., {"morning": true, "afternoon": false, "evening": true}
  skill_preferences jsonb, -- e.g., {"match_similar": true, "max_utr_diff": 0.5}
  notes TEXT, -- Optional notes like "Looking for doubles partner"
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_play_availability_player_club ON public.play_availability(player_id, club_id);
CREATE INDEX idx_play_availability_club_active ON public.play_availability(club_id, is_available, expires_at);
CREATE INDEX idx_play_availability_expires_at ON public.play_availability(expires_at);

-- Enable Row Level Security
ALTER TABLE public.play_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Club members can view availability in their clubs"
ON public.play_availability
FOR SELECT
USING (
  club_id IN (
    SELECT club_id FROM public.club_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can manage their own availability"
ON public.play_availability
FOR ALL
USING (player_id = auth.uid())
WITH CHECK (player_id = auth.uid());

-- Function to toggle play availability
CREATE OR REPLACE FUNCTION public.toggle_play_availability(
  club_id_param UUID,
  is_available_param BOOLEAN DEFAULT true,
  preferred_times_param JSONB DEFAULT '{"morning": true, "afternoon": true, "evening": true}'::jsonb,
  notes_param TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  existing_record RECORD;
BEGIN
  -- Check if user is a member of the club
  IF NOT EXISTS (
    SELECT 1 FROM public.club_memberships 
    WHERE club_id = club_id_param AND user_id = auth.uid() AND status = 'active'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Not a member of this club');
  END IF;
  
  -- Check for existing availability record
  SELECT * INTO existing_record
  FROM public.play_availability
  WHERE player_id = auth.uid() AND club_id = club_id_param;
  
  IF existing_record IS NOT NULL THEN
    -- Update existing record
    UPDATE public.play_availability
    SET 
      is_available = is_available_param,
      preferred_times = preferred_times_param,
      notes = notes_param,
      expires_at = now() + interval '7 days',
      updated_at = now()
    WHERE id = existing_record.id;
    
    result := json_build_object(
      'success', true,
      'action', 'updated',
      'is_available', is_available_param,
      'expires_at', now() + interval '7 days'
    );
  ELSE
    -- Insert new record
    INSERT INTO public.play_availability (
      player_id, club_id, is_available, preferred_times, notes
    )
    VALUES (
      auth.uid(), club_id_param, is_available_param, preferred_times_param, notes_param
    );
    
    result := json_build_object(
      'success', true,
      'action', 'created',
      'is_available', is_available_param,
      'expires_at', now() + interval '7 days'
    );
  END IF;
  
  RETURN result;
END;
$$;

-- Function to get skill-matched players looking to play
CREATE OR REPLACE FUNCTION public.get_skill_matched_players(
  club_id_param UUID,
  utr_tolerance NUMERIC DEFAULT 0.5,
  usta_tolerance NUMERIC DEFAULT 0.5
)
RETURNS TABLE(
  player_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  utr_rating NUMERIC,
  usta_rating NUMERIC,
  location TEXT,
  notes TEXT,
  preferred_times JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  skill_match_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_utr NUMERIC;
  current_user_usta NUMERIC;
BEGIN
  -- Get current user's skill ratings
  SELECT p.utr_rating, p.usta_rating 
  INTO current_user_utr, current_user_usta
  FROM public.profiles p
  WHERE p.id = auth.uid();
  
  -- If user doesn't have ratings, use defaults
  current_user_utr := COALESCE(current_user_utr, 4.0);
  current_user_usta := COALESCE(current_user_usta, 3.0);
  
  RETURN QUERY
  SELECT 
    pa.player_id,
    p.full_name,
    p.avatar_url,
    p.utr_rating,
    p.usta_rating,
    p.location,
    pa.notes,
    pa.preferred_times,
    pa.expires_at,
    -- Calculate skill match score (lower is better match)
    (
      ABS(COALESCE(p.utr_rating, 4.0) - current_user_utr) * 2 + 
      ABS(COALESCE(p.usta_rating, 3.0) - current_user_usta)
    ) as skill_match_score
  FROM public.play_availability pa
  JOIN public.profiles p ON pa.player_id = p.id
  WHERE 
    pa.club_id = club_id_param
    AND pa.is_available = true
    AND pa.expires_at > now()
    AND pa.player_id != auth.uid() -- Exclude current user
    AND (
      ABS(COALESCE(p.utr_rating, 4.0) - current_user_utr) <= utr_tolerance
      OR ABS(COALESCE(p.usta_rating, 3.0) - current_user_usta) <= usta_tolerance
    )
  ORDER BY skill_match_score ASC, pa.created_at DESC;
END;
$$;

-- Auto-cleanup function for expired availability
CREATE OR REPLACE FUNCTION public.cleanup_expired_availability()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.play_availability 
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;