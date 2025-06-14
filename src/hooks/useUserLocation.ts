
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserLocation {
  user_id: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  distance_km: number;
  latitude: number;
  longitude: number;
  city?: string;
  last_updated: string;
}

export interface SavedPlace {
  id: string;
  place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  place_type: string;
  notes?: string;
  is_favorite: boolean;
  created_at: string;
}

export function useUserLocation() {
  const queryClient = useQueryClient();
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [locationError, setLocationError] = useState<string | null>(null);

  // Get current user's location with better error handling
  useEffect(() => {
    console.log('Checking geolocation availability...');
    
    if (!('geolocation' in navigator)) {
      console.error('Geolocation is not supported by this browser');
      setLocationPermission('denied');
      setLocationError('Geolocation is not supported by this browser');
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    console.log('Requesting location permission...');

    // Check permission state first if available
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        console.log('Permission state:', result.state);
        if (result.state === 'denied') {
          setLocationPermission('denied');
          setLocationError('Location permission denied. Please enable location access in your browser settings.');
          toast.error('Location permission denied. Please enable location access in your browser settings.');
          return;
        }
      }).catch((error) => {
        console.log('Permission query failed:', error);
      });
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location obtained:', position.coords);
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationPermission('granted');
        setLocationError(null);
        toast.success('Location obtained successfully');
      },
      (error) => {
        console.error('Location error:', error);
        setLocationPermission('denied');
        
        let errorMessage = 'Unable to get your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += 'An unknown error occurred while retrieving location.';
            break;
        }
        
        setLocationError(errorMessage);
        toast.error(errorMessage);
      },
      options
    );
  }, []);

  // Update user location in database
  const updateLocationMutation = useMutation({
    mutationFn: async ({ lat, lng, isSharing = false }: { lat: number; lng: number; isSharing?: boolean }) => {
      console.log('Updating location in database:', { lat, lng, isSharing });
      const { data, error } = await supabase.rpc('update_user_location', {
        latitude: lat,
        longitude: lng,
        sharing_param: isSharing
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nearby-users'] });
      toast.success('Location updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating location:', error);
      toast.error('Failed to update location');
    },
  });

  // Find nearby users
  const { data: nearbyUsers, isLoading: isLoadingNearby, refetch: refetchNearbyUsers } = useQuery({
    queryKey: ['nearby-users', currentLocation],
    queryFn: async () => {
      if (!currentLocation) return [];
      
      console.log('Fetching nearby users for location:', currentLocation);
      const { data, error } = await supabase.rpc('find_nearby_users', {
        search_latitude: currentLocation.lat,
        search_longitude: currentLocation.lng,
        radius_km: 10,
        user_type: 'all'
      });
      
      if (error) throw error;
      console.log('Found nearby users:', data);
      return data as UserLocation[];
    },
    enabled: !!currentLocation,
  });

  // Get saved places
  const { data: savedPlaces, isLoading: isLoadingSaved } = useQuery({
    queryKey: ['saved-places'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_places')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(place => ({
        ...place,
        latitude: 0, // Will be extracted from PostGIS geography
        longitude: 0
      })) as SavedPlace[];
    },
  });

  // Save a place
  const savePlaceMutation = useMutation({
    mutationFn: async (place: {
      place_id: string;
      name: string;
      address: string;
      latitude: number;
      longitude: number;
      place_type: string;
      notes?: string;
      is_favorite?: boolean;
    }) => {
      const { data, error } = await supabase.rpc('save_place', {
        place_id_param: place.place_id,
        name_param: place.name,
        address_param: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
        place_type_param: place.place_type,
        notes_param: place.notes,
        is_favorite_param: place.is_favorite || false
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-places'] });
      toast.success('Place saved successfully');
    },
    onError: (error: any) => {
      console.error('Error saving place:', error);
      toast.error('Failed to save place');
    },
  });

  return {
    currentLocation,
    locationPermission,
    locationError,
    nearbyUsers: nearbyUsers || [],
    savedPlaces: savedPlaces || [],
    isLoadingNearby,
    isLoadingSaved,
    updateLocation: updateLocationMutation.mutate,
    isUpdatingLocation: updateLocationMutation.isPending,
    savePlace: savePlaceMutation.mutate,
    isSavingPlace: savePlaceMutation.isPending,
    refetchNearbyUsers,
  };
}
