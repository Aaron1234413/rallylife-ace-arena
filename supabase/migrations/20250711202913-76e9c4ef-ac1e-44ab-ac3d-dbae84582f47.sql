-- Optimize geographic queries for nearby sessions
-- Add spatial index and improve the get_nearby_sessions function for better performance

-- Add spatial index using PostGIS for better geographic query performance
-- First, create a geography column that combines lat/lng for efficient spatial queries
ALTER TABLE public.sessions 
ADD COLUMN location_point GEOGRAPHY(POINT, 4326);

-- Create function to update location_point when coordinates change
CREATE OR REPLACE FUNCTION public.update_sessions_location_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location_point = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    NEW.location_coordinates_set = true;
  ELSE
    NEW.location_point = NULL;
    NEW.location_coordinates_set = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update location_point
CREATE TRIGGER update_sessions_location_point_trigger
  BEFORE INSERT OR UPDATE OF latitude, longitude
  ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sessions_location_point();

-- Update existing records to populate location_point
UPDATE public.sessions 
SET location_point = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
    location_coordinates_set = true
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create spatial index for efficient geographic queries
CREATE INDEX IF NOT EXISTS idx_sessions_location_point 
ON public.sessions USING GIST (location_point)
WHERE location_point IS NOT NULL;

-- Create optimized function for nearby sessions using PostGIS
CREATE OR REPLACE FUNCTION public.get_nearby_sessions(
  user_lat DECIMAL, 
  user_lng DECIMAL, 
  radius_km DECIMAL DEFAULT 50
) RETURNS TABLE(
  session_id UUID,
  distance_km DECIMAL
) AS $$
DECLARE
  user_point GEOGRAPHY;
BEGIN
  -- Create user location point
  user_point := ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography;
  
  RETURN QUERY
  SELECT 
    s.id as session_id,
    ROUND((ST_Distance(user_point, s.location_point) / 1000)::DECIMAL, 2) as distance_km
  FROM public.sessions s
  WHERE s.location_point IS NOT NULL 
    AND s.status IN ('waiting', 'active')
    AND ST_DWithin(user_point, s.location_point, radius_km * 1000) -- radius in meters
  ORDER BY ST_Distance(user_point, s.location_point) ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Add similar optimization for profiles table
ALTER TABLE public.profiles 
ADD COLUMN location_point GEOGRAPHY(POINT, 4326);

-- Create function for profiles location update
CREATE OR REPLACE FUNCTION public.update_profiles_location_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location_point = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSE
    NEW.location_point = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_location_point_trigger
  BEFORE INSERT OR UPDATE OF latitude, longitude
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_location_point();

-- Update existing profiles
UPDATE public.profiles 
SET location_point = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create spatial index for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_location_point 
ON public.profiles USING GIST (location_point)
WHERE location_point IS NOT NULL;

-- Update get_nearby_players function to use PostGIS
CREATE OR REPLACE FUNCTION public.get_nearby_players(
  user_lat DECIMAL, 
  user_lng DECIMAL, 
  radius_km DECIMAL DEFAULT 50
) RETURNS TABLE(
  player_id UUID,
  distance_km DECIMAL
) AS $$
DECLARE
  user_point GEOGRAPHY;
BEGIN
  -- Create user location point
  user_point := ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography;
  
  RETURN QUERY
  SELECT 
    p.id as player_id,
    ROUND((ST_Distance(user_point, p.location_point) / 1000)::DECIMAL, 2) as distance_km
  FROM public.profiles p
  WHERE p.location_point IS NOT NULL 
    AND p.id != auth.uid() -- Exclude current user
    AND ST_DWithin(user_point, p.location_point, radius_km * 1000) -- radius in meters
  ORDER BY ST_Distance(user_point, p.location_point) ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;