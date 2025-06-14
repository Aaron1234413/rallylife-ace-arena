
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

  // Get current user's location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationPermission('granted');
        },
        (error) => {
          console.error('Location error:', error);
          // Only set permission to 'denied' if it's actually a permission error
          if (error.code === error.PERMISSION_DENIED) {
            setLocationPermission('denied');
            toast.error('Location access denied. Please enable location services to use this feature.');
          } else {
            // For other errors (timeout, unavailable), don't change permission status
            // but still show an error message
            toast.error('Unable to get your location. Please try again.');
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      setLocationPermission('denied');
      toast.error('Geolocation is not supported by this browser.');
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
