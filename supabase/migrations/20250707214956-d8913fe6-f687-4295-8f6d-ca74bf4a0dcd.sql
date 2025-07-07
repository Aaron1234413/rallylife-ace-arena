-- Enable PostGIS extension for geographic operations
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add latitude and longitude to profiles table
ALTER TABLE public.profiles 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN location_updated_at TIMESTAMP WITH TIME ZONE;

-- Add latitude and longitude to sessions table
ALTER TABLE public.sessions 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN location_coordinates_set BOOLEAN DEFAULT FALSE;

-- Create indexes for efficient geographic queries
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles USING btree(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_location ON public.sessions USING btree(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create a function to calculate distance between two points (in kilometers)
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 DECIMAL, lng1 DECIMAL, 
  lat2 DECIMAL, lng2 DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
  -- Haversine formula for distance calculation
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * 
      cos(radians(lat2)) * 
      cos(radians(lng2) - radians(lng1)) + 
      sin(radians(lat1)) * 
      sin(radians(lat2))
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a function to find nearby sessions within a radius
CREATE OR REPLACE FUNCTION public.get_nearby_sessions(
  user_lat DECIMAL, 
  user_lng DECIMAL, 
  radius_km DECIMAL DEFAULT 50
) RETURNS TABLE(
  session_id UUID,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as session_id,
    public.calculate_distance(user_lat, user_lng, s.latitude, s.longitude) as distance_km
  FROM public.sessions s
  WHERE s.latitude IS NOT NULL 
    AND s.longitude IS NOT NULL
    AND s.status IN ('waiting', 'active')
    AND public.calculate_distance(user_lat, user_lng, s.latitude, s.longitude) <= radius_km
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to find nearby players within a radius  
CREATE OR REPLACE FUNCTION public.get_nearby_players(
  user_lat DECIMAL, 
  user_lng DECIMAL, 
  radius_km DECIMAL DEFAULT 50
) RETURNS TABLE(
  player_id UUID,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as player_id,
    public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) as distance_km
  FROM public.profiles p
  WHERE p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND p.id != auth.uid() -- Exclude current user
    AND public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= radius_km
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;