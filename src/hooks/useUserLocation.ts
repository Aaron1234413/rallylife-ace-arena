
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
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Get current user's location with better error handling
  useEffect(() => {
    console.log('useUserLocation: Checking geolocation support');
    
    if ('geolocation' in navigator) {
      console.log('useUserLocation: Geolocation is supported, requesting position');
      setIsGettingLocation(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('useUserLocation: Position obtained:', position.coords);
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationPermission('granted');
          setIsGettingLocation(false);
          toast.success('Location access granted');
        },
        (error) => {
          console.error('useUserLocation: Location error:', error);
          console.log('useUserLocation: Error code:', error.code);
          console.log('useUserLocation: Error message:', error.message);
          
          setIsGettingLocation(false);
          
          if (error.code === error.PERMISSION_DENIED) {
            setLocationPermission('denied');
            toast.error('Location access denied. You can still use the map with manual search.');
          } else {
            // For other errors (position unavailable, timeout), provide a default location
            console.log('useUserLocation: Using fallback location (New York City)');
            setCurrentLocation({
              lat: 40.7128,
              lng: -74.0060
            });
            setLocationPermission('granted');
            toast.info('Using default location. Enable location services for accurate results.');
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
      );
    } else {
      console.log('useUserLocation: Geolocation is not supported');
      setLocationPermission('denied');
      setIsGettingLocation(false);
      // Provide fallback location
      setCurrentLocation({
        lat: 40.7128,
        lng: -74.0060
      });
      toast.error('Geolocation not supported. Using default location.');
    }
  }, []);

  // Update user location in database
  const updateLocationMutation = useMutation({
    mutationFn: async ({ lat, lng, isSharing = false }: { lat: number; lng: number; isSharing?: boolean }) => {
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
      
      const { data, error } = await supabase.rpc('find_nearby_users', {
        search_latitude: currentLocation.lat,
        search_longitude: currentLocation.lng,
        radius_km: 10,
        user_type: 'all'
      });
      
      if (error) throw error;
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
    isGettingLocation,
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
