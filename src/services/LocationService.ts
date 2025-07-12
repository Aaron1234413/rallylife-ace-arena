/**
 * Comprehensive Location Service with permission handling, fallbacks, and utilities
 */

import { toast } from 'sonner';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export interface LocationPermissionState {
  permission: 'granted' | 'denied' | 'prompt';
  lastChecked: number;
}

export interface DistanceCalculation {
  distanceKm: number;
  walkingTimeMinutes: number;
  drivingTimeMinutes: number;
  cyclingTimeMinutes: number;
}

export interface LocationServiceOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  fallbackToIpLocation?: boolean;
}

class LocationService {
  private static instance: LocationService;
  private currentPosition: LocationCoordinates | null = null;
  private watchId: number | null = null;
  private permissionState: LocationPermissionState | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Request user's current location with comprehensive error handling
   */
  public async getCurrentLocation(options: LocationServiceOptions = {}): Promise<LocationCoordinates> {
    const {
      enableHighAccuracy = true,
      timeout = 10000,
      maximumAge = 300000,
      fallbackToIpLocation = true
    } = options;

    // Check if we have cached location that's still valid
    if (this.currentPosition && 
        this.currentPosition.timestamp && 
        Date.now() - this.currentPosition.timestamp < this.CACHE_DURATION) {
      return this.currentPosition;
    }

    if (!this.isGeolocationSupported()) {
      if (fallbackToIpLocation) {
        return this.getLocationFromIP();
      }
      throw new Error('Geolocation is not supported by this browser');
    }

    try {
      const position = await this.requestGeolocation({
        enableHighAccuracy,
        timeout,
        maximumAge
      });

      const coordinates: LocationCoordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now()
      };

      this.currentPosition = coordinates;
      this.updatePermissionState('granted');
      
      return coordinates;
    } catch (error: any) {
      console.error('Geolocation error:', error);
      
      if (error.code === GeolocationPositionError.PERMISSION_DENIED) {
        this.updatePermissionState('denied');
        toast.error('Location access denied. Please enable location services.');
        throw new Error('Location permission denied');
      } else if (error.code === GeolocationPositionError.POSITION_UNAVAILABLE) {
        toast.error('Location information is unavailable.');
        if (fallbackToIpLocation) {
          return this.getLocationFromIP();
        }
        throw new Error('Location unavailable');
      } else if (error.code === GeolocationPositionError.TIMEOUT) {
        toast.error('Location request timed out.');
        if (fallbackToIpLocation) {
          return this.getLocationFromIP();
        }
        throw new Error('Location request timeout');
      }
      
      throw error;
    }
  }

  /**
   * Start watching user's location for real-time updates
   */
  public startWatching(
    onLocationUpdate: (location: LocationCoordinates) => void,
    onError?: (error: GeolocationPositionError) => void,
    options: LocationServiceOptions = {}
  ): number {
    if (!this.isGeolocationSupported()) {
      throw new Error('Geolocation is not supported');
    }

    const {
      enableHighAccuracy = false, // Less accurate but better battery life for watching
      timeout = 15000,
      maximumAge = 600000 // 10 minutes for watching
    } = options;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coordinates: LocationCoordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };
        
        this.currentPosition = coordinates;
        onLocationUpdate(coordinates);
      },
      (error) => {
        console.error('Location watching error:', error);
        if (onError) {
          onError(error);
        }
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      }
    );

    return this.watchId;
  }

  /**
   * Stop watching location updates
   */
  public stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Calculate accurate distance between two points using Haversine formula
   */
  public calculateDistance(
    point1: LocationCoordinates,
    point2: LocationCoordinates
  ): DistanceCalculation {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    return {
      distanceKm: Math.round(distanceKm * 100) / 100, // Round to 2 decimal places
      walkingTimeMinutes: Math.round(distanceKm * 12), // ~12 min per km walking
      drivingTimeMinutes: Math.round(distanceKm * 2.5), // ~2.5 min per km driving in city
      cyclingTimeMinutes: Math.round(distanceKm * 4) // ~4 min per km cycling
    };
  }

  /**
   * Filter locations by distance radius
   */
  public filterByRadius<T extends { latitude?: number; longitude?: number; lat?: number; lng?: number }>(
    items: T[],
    center: LocationCoordinates,
    radiusKm: number
  ): (T & { distance: DistanceCalculation })[] {
    return items
      .map(item => {
        const itemLat = item.latitude || item.lat;
        const itemLng = item.longitude || item.lng;
        
        if (!itemLat || !itemLng) {
          return null;
        }

        const distance = this.calculateDistance(center, { lat: itemLat, lng: itemLng });
        
        if (distance.distanceKm <= radiusKm) {
          return { ...item, distance };
        }
        
        return null;
      })
      .filter((item): item is T & { distance: DistanceCalculation } => item !== null)
      .sort((a, b) => a.distance.distanceKm - b.distance.distanceKm);
  }

  /**
   * Get user's location permission state
   */
  public async checkPermission(): Promise<LocationPermissionState> {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        const state: LocationPermissionState = {
          permission: permission.state as 'granted' | 'denied' | 'prompt',
          lastChecked: Date.now()
        };
        this.permissionState = state;
        return state;
      } catch (error) {
        console.warn('Permission API not available:', error);
      }
    }

    // Fallback - try to determine from stored state or make educated guess
    return this.permissionState || { permission: 'prompt', lastChecked: Date.now() };
  }

  /**
   * Request permission explicitly (useful for better UX)
   */
  public async requestPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    try {
      const position = await this.requestGeolocation({
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
      });
      
      this.updatePermissionState('granted');
      return 'granted';
    } catch (error: any) {
      if (error.code === GeolocationPositionError.PERMISSION_DENIED) {
        this.updatePermissionState('denied');
        return 'denied';
      }
      return 'prompt';
    }
  }

  /**
   * Get cached location if available
   */
  public getCachedLocation(): LocationCoordinates | null {
    if (this.currentPosition && 
        this.currentPosition.timestamp && 
        Date.now() - this.currentPosition.timestamp < this.CACHE_DURATION) {
      return this.currentPosition;
    }
    return null;
  }

  /**
   * Clear cached location (useful for manual refresh)
   */
  public clearCache(): void {
    this.currentPosition = null;
  }

  /**
   * Format distance for display
   */
  public formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    } else if (distanceKm < 10) {
      return `${Math.round(distanceKm * 10) / 10}km`;
    } else {
      return `${Math.round(distanceKm)}km`;
    }
  }

  /**
   * Format travel time for display
   */
  public formatTravelTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    }
  }

  // Private methods

  private isGeolocationSupported(): boolean {
    return 'geolocation' in navigator;
  }

  private requestGeolocation(options: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  private updatePermissionState(permission: 'granted' | 'denied' | 'prompt'): void {
    this.permissionState = {
      permission,
      lastChecked: Date.now()
    };
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Fallback IP-based location (approximate)
   */
  private async getLocationFromIP(): Promise<LocationCoordinates> {
    try {
      // Using a free IP geolocation service as fallback
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        const coordinates: LocationCoordinates = {
          lat: data.latitude,
          lng: data.longitude,
          accuracy: 10000, // Very low accuracy for IP-based location
          timestamp: Date.now()
        };
        
        toast.info('Using approximate location based on your IP address');
        return coordinates;
      }
      
      throw new Error('Could not determine location from IP');
    } catch (error) {
      console.error('IP location fallback failed:', error);
      throw new Error('All location methods failed');
    }
  }
}

export const locationService = LocationService.getInstance();