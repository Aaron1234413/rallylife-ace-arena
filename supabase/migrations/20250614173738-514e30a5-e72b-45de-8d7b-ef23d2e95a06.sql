
-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create user_locations table for real-time location sharing
CREATE TABLE public.user_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  is_sharing_location BOOLEAN NOT NULL DEFAULT false,
  location_accuracy FLOAT,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create location_preferences table for user search settings
CREATE TABLE public.location_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_radius_km INTEGER NOT NULL DEFAULT 10,
  show_coaches BOOLEAN NOT NULL DEFAULT true,
  show_players BOOLEAN NOT NULL DEFAULT true,
  show_courts BOOLEAN NOT NULL DEFAULT true,
  auto_update_location BOOLEAN NOT NULL DEFAULT true,
  location_privacy_level TEXT NOT NULL DEFAULT 'approximate' CHECK (location_privacy_level IN ('exact', 'approximate', 'city_only')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create saved_places table for user's favorite courts/locations
CREATE TABLE public.saved_places (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL, -- Google Places ID
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  place_type TEXT NOT NULL CHECK (place_type IN ('court', 'club', 'park', 'other')),
  notes TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_locations
CREATE POLICY "Users can view their own location" 
  ON public.user_locations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own location" 
  ON public.user_locations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own location" 
  ON public.user_locations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view locations of users sharing location" 
  ON public.user_locations FOR SELECT 
  USING (is_sharing_location = true);

-- RLS Policies for location_preferences
CREATE POLICY "Users can manage their own location preferences" 
  ON public.location_preferences FOR ALL 
  USING (auth.uid() = user_id);

-- RLS Policies for saved_places
CREATE POLICY "Users can manage their own saved places" 
  ON public.saved_places FOR ALL 
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_locations_location ON public.user_locations USING GIST (location);
CREATE INDEX idx_user_locations_sharing ON public.user_locations (is_sharing_location);
CREATE INDEX idx_user_locations_updated ON public.user_locations (last_updated);
CREATE INDEX idx_saved_places_location ON public.saved_places USING GIST (location);
CREATE INDEX idx_saved_places_user_type ON public.saved_places (user_id, place_type);

-- Function to update user location
CREATE OR REPLACE FUNCTION public.update_user_location(
  latitude FLOAT,
  longitude FLOAT,
  address_param TEXT DEFAULT NULL,
  city_param TEXT DEFAULT NULL,
  country_param TEXT DEFAULT NULL,
  accuracy_param FLOAT DEFAULT NULL,
  sharing_param BOOLEAN DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_location_point GEOGRAPHY;
  result JSON;
BEGIN
  -- Create geography point from lat/lng
  user_location_point := ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::GEOGRAPHY;
  
  -- Insert or update user location
  INSERT INTO public.user_locations (
    user_id, location, address, city, country, 
    location_accuracy, is_sharing_location, last_updated
  )
  VALUES (
    auth.uid(), user_location_point, address_param, city_param, country_param,
    accuracy_param, COALESCE(sharing_param, false), now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    location = user_location_point,
    address = COALESCE(address_param, user_locations.address),
    city = COALESCE(city_param, user_locations.city),
    country = COALESCE(country_param, user_locations.country),
    location_accuracy = COALESCE(accuracy_param, user_locations.location_accuracy),
    is_sharing_location = COALESCE(sharing_param, user_locations.is_sharing_location),
    last_updated = now();
  
  result := json_build_object(
    'success', true,
    'latitude', latitude,
    'longitude', longitude,
    'sharing_location', COALESCE(sharing_param, false)
  );
  
  RETURN result;
END;
$$;

-- Function to find nearby users (coaches/players)
CREATE OR REPLACE FUNCTION public.find_nearby_users(
  search_latitude FLOAT,
  search_longitude FLOAT,
  radius_km INTEGER DEFAULT 10,
  user_type TEXT DEFAULT 'all' -- 'all', 'coach', 'player'
) RETURNS TABLE(
  user_id UUID,
  full_name TEXT,
  role TEXT,
  avatar_url TEXT,
  distance_km FLOAT,
  latitude FLOAT,
  longitude FLOAT,
  city TEXT,
  last_updated TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  search_point GEOGRAPHY;
BEGIN
  search_point := ST_SetSRID(ST_MakePoint(search_longitude, search_latitude), 4326)::GEOGRAPHY;
  
  RETURN QUERY
  SELECT 
    ul.user_id,
    p.full_name,
    p.role::TEXT,
    p.avatar_url,
    ST_Distance(ul.location, search_point) / 1000.0 as distance_km,
    ST_Y(ul.location::GEOMETRY) as latitude,
    ST_X(ul.location::GEOMETRY) as longitude,
    ul.city,
    ul.last_updated
  FROM public.user_locations ul
  JOIN public.profiles p ON ul.user_id = p.id
  WHERE ul.is_sharing_location = true
    AND ul.user_id != auth.uid()
    AND ST_DWithin(ul.location, search_point, radius_km * 1000)
    AND (user_type = 'all' OR p.role::TEXT = user_type)
    AND ul.last_updated > now() - interval '24 hours' -- Only show recent locations
  ORDER BY ST_Distance(ul.location, search_point);
END;
$$;

-- Function to save a place
CREATE OR REPLACE FUNCTION public.save_place(
  place_id_param TEXT,
  name_param TEXT,
  address_param TEXT,
  latitude FLOAT,
  longitude FLOAT,
  place_type_param TEXT,
  notes_param TEXT DEFAULT NULL,
  is_favorite_param BOOLEAN DEFAULT false
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  place_location GEOGRAPHY;
  result JSON;
BEGIN
  place_location := ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::GEOGRAPHY;
  
  INSERT INTO public.saved_places (
    user_id, place_id, name, address, location, 
    place_type, notes, is_favorite
  )
  VALUES (
    auth.uid(), place_id_param, name_param, address_param, place_location,
    place_type_param, notes_param, is_favorite_param
  )
  ON CONFLICT (user_id, place_id) DO UPDATE SET
    name = name_param,
    address = address_param,
    location = place_location,
    notes = COALESCE(notes_param, saved_places.notes),
    is_favorite = is_favorite_param;
  
  result := json_build_object(
    'success', true,
    'place_id', place_id_param,
    'name', name_param
  );
  
  RETURN result;
END;
$$;

-- Function to initialize user location preferences
CREATE OR REPLACE FUNCTION public.initialize_location_preferences(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.location_preferences (user_id)
  VALUES (user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Enable realtime for location updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_locations;
