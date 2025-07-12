import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationService, LocationCoordinates, LocationPermissionState } from '@/services/LocationService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EnhancedLocationState {
  currentLocation: LocationCoordinates | null;
  permission: LocationPermissionState | null;
  isLoading: boolean;
  isWatching: boolean;
  accuracy: number | null;
  lastUpdated: Date | null;
  error: string | null;
}

export function useEnhancedLocation() {
  const queryClient = useQueryClient();
  const [locationState, setLocationState] = useState<EnhancedLocationState>({
    currentLocation: null,
    permission: null,
    isLoading: false,
    isWatching: false,
    accuracy: null,
    lastUpdated: null,
    error: null
  });

  // Check permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const permission = await locationService.checkPermission();
        setLocationState(prev => ({ ...prev, permission }));
      } catch (error) {
        console.error('Error checking location permission:', error);
      }
    };

    checkPermission();
  }, []);

  // Get current location with enhanced error handling
  const getCurrentLocation = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      locationService.clearCache();
    }

    setLocationState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const location = await locationService.getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: forceRefresh ? 0 : 300000,
        fallbackToIpLocation: true
      });

      setLocationState(prev => ({
        ...prev,
        currentLocation: location,
        accuracy: location.accuracy || null,
        lastUpdated: new Date(),
        isLoading: false,
        error: null
      }));

      // Update permission state
      const permission = await locationService.checkPermission();
      setLocationState(prev => ({ ...prev, permission }));

      return location;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get location';
      setLocationState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Watch location for real-time updates
  const startWatching = useCallback(() => {
    if (locationState.isWatching) return;

    try {
      const watchId = locationService.startWatching(
        (location) => {
          setLocationState(prev => ({
            ...prev,
            currentLocation: location,
            accuracy: location.accuracy || null,
            lastUpdated: new Date(),
            error: null
          }));
        },
        (error) => {
          setLocationState(prev => ({
            ...prev,
            error: error.message,
            isWatching: false
          }));
        },
        {
          enableHighAccuracy: false, // Better battery life for watching
          timeout: 15000,
          maximumAge: 600000
        }
      );

      setLocationState(prev => ({ ...prev, isWatching: true }));
      
      return watchId;
    } catch (error: any) {
      setLocationState(prev => ({
        ...prev,
        error: error.message,
        isWatching: false
      }));
    }
  }, [locationState.isWatching]);

  // Stop watching location
  const stopWatching = useCallback(() => {
    locationService.stopWatching();
    setLocationState(prev => ({ ...prev, isWatching: false }));
  }, []);

  // Update location in database
  const updateLocationMutation = useMutation({
    mutationFn: async ({ 
      location, 
      isSharing = false 
    }: { 
      location: LocationCoordinates; 
      isSharing?: boolean; 
    }) => {
      const { data, error } = await supabase.rpc('update_user_location', {
        latitude: location.lat,
        longitude: location.lng,
        address_param: '', // Could be enhanced with reverse geocoding
        city_param: '', // Could be enhanced with reverse geocoding
        country_param: '', // Could be enhanced with reverse geocoding
        accuracy_param: location.accuracy || 0,
        sharing_param: isSharing
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nearby-users'] });
      queryClient.invalidateQueries({ queryKey: ['nearby-sessions'] });
      toast.success('Location updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating location:', error);
      toast.error('Failed to update location in database');
    },
  });

  // Request permission explicitly
  const requestPermission = useCallback(async () => {
    try {
      const permission = await locationService.requestPermission();
      await locationService.checkPermission().then(state => {
        setLocationState(prev => ({ ...prev, permission: state }));
      });
      return permission;
    } catch (error: any) {
      console.error('Error requesting permission:', error);
      throw error;
    }
  }, []);

  // Calculate distance to a point
  const calculateDistance = useCallback((target: { lat: number; lng: number }) => {
    if (!locationState.currentLocation) {
      return null;
    }
    return locationService.calculateDistance(locationState.currentLocation, target);
  }, [locationState.currentLocation]);

  // Filter items by distance
  const filterByDistance = useCallback(<T extends { latitude?: number; longitude?: number; lat?: number; lng?: number }>(
    items: T[],
    radiusKm: number
  ) => {
    if (!locationState.currentLocation) {
      return [];
    }
    return locationService.filterByRadius(items, locationState.currentLocation, radiusKm);
  }, [locationState.currentLocation]);

  // Auto-get location on mount if permission is granted
  useEffect(() => {
    const autoGetLocation = async () => {
      if (locationState.permission?.permission === 'granted' && !locationState.currentLocation) {
        try {
          await getCurrentLocation();
        } catch (error) {
          // Silently fail on auto-location
          console.debug('Auto location failed:', error);
        }
      }
    };

    autoGetLocation();
  }, [locationState.permission?.permission, locationState.currentLocation, getCurrentLocation]);

  return {
    // Location state
    currentLocation: locationState.currentLocation,
    permission: locationState.permission,
    isLoading: locationState.isLoading,
    isWatching: locationState.isWatching,
    accuracy: locationState.accuracy,
    lastUpdated: locationState.lastUpdated,
    error: locationState.error,
    hasLocation: !!locationState.currentLocation,

    // Location actions
    getCurrentLocation,
    startWatching,
    stopWatching,
    requestPermission,
    
    // Database actions
    updateLocation: updateLocationMutation.mutate,
    isUpdatingLocation: updateLocationMutation.isPending,
    
    // Utility functions
    calculateDistance,
    filterByDistance,
    formatDistance: locationService.formatDistance,
    formatTravelTime: locationService.formatTravelTime,
    
    // Direct access to service
    locationService
  };
}