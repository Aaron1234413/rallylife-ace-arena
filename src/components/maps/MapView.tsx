
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { UserLocation } from '@/hooks/useUserLocation';
import { PlaceResult } from '@/hooks/useGooglePlaces';

interface MapViewProps {
  center: { lat: number; lng: number };
  nearbyUsers: UserLocation[];
  places?: PlaceResult[];
  selectedPlace?: PlaceResult | null;
  onUserClick?: (user: UserLocation) => void;
  onPlaceClick?: (place: PlaceResult) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

export function MapView({ 
  center, 
  nearbyUsers, 
  places = [], 
  selectedPlace,
  onUserClick, 
  onPlaceClick,
  onMapClick 
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // Load Google Maps API
  const loadGoogleMaps = useCallback(() => {
    if (window.google) {
      setIsGoogleMapsLoaded(true);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `/functions/v1/google-maps-script`;
    script.async = true;
    script.defer = true;
    
    // Set up global callback
    window.initGoogleMaps = () => {
      console.log('MapView: Google Maps API loaded');
      setIsGoogleMapsLoaded(true);
    };
    
    script.onload = () => {
      console.log('MapView: Google Maps script loaded');
    };
    
    script.onerror = (error) => {
      console.error('MapView: Error loading Google Maps script:', error);
    };

    document.head.appendChild(script);
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    loadGoogleMaps();
  }, [loadGoogleMaps]);

  // Create map instance
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapContainer.current || map.current) {
      return;
    }

    try {
      console.log('MapView: Creating Google Maps instance...');
      
      map.current = new window.google.maps.Map(mapContainer.current, {
        center: { lat: center.lat, lng: center.lng },
        zoom: 12,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Add click handler
      if (onMapClick) {
        map.current.addListener('click', (e: any) => {
          console.log('MapView: Map clicked at:', e.latLng.lat(), e.latLng.lng());
          onMapClick(e.latLng.lat(), e.latLng.lng());
        });
      }

      console.log('MapView: Google Maps instance created successfully');
      setIsMapLoaded(true);

    } catch (error) {
      console.error('MapView: Error creating Google Maps instance:', error);
    }

    return () => {
      console.log('MapView: Cleaning up map');
      if (map.current) {
        map.current = null;
      }
      setIsMapLoaded(false);
    };
  }, [isGoogleMapsLoaded, center, onMapClick]);

  // Update center when location changes
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    
    map.current.setCenter({ lat: center.lat, lng: center.lng });
  }, [center, isMapLoaded]);

  // Update markers when users or places change
  useEffect(() => {
    if (!map.current || !isMapLoaded || !window.google) {
      return;
    }

    console.log('MapView: Updating markers for', nearbyUsers.length, 'users and', places.length, 'places');

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Create bounds to fit all markers
    const bounds = new window.google.maps.LatLngBounds();

    // Add current user marker (green)
    const currentUserMarker = new window.google.maps.Marker({
      position: { lat: center.lat, lng: center.lng },
      map: map.current,
      title: 'Your Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#10b981',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      }
    });

    const currentUserInfoWindow = new window.google.maps.InfoWindow({
      content: '<div style="padding: 8px;"><strong>Your Location</strong></div>'
    });

    currentUserMarker.addListener('click', () => {
      currentUserInfoWindow.open(map.current, currentUserMarker);
    });

    markersRef.current.push(currentUserMarker);
    bounds.extend({ lat: center.lat, lng: center.lng });

    // Add nearby users markers
    nearbyUsers.forEach((user) => {
      const markerColor = user.role === 'coach' ? '#3b82f6' : '#f59e0b';
      
      const userMarker = new window.google.maps.Marker({
        position: { lat: user.latitude, lng: user.longitude },
        map: map.current,
        title: user.full_name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      const userInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600;">${user.full_name}</h3>
            <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${user.role}</p>
            <p style="margin: 0; color: #888; font-size: 12px;">${user.distance_km.toFixed(1)}km away</p>
          </div>
        `
      });

      userMarker.addListener('click', () => {
        userInfoWindow.open(map.current, userMarker);
        onUserClick?.(user);
      });
      
      markersRef.current.push(userMarker);
      bounds.extend({ lat: user.latitude, lng: user.longitude });
    });

    // Add place markers
    places.forEach((place) => {
      const isSelected = selectedPlace?.place_id === place.place_id;
      const markerColor = isSelected ? '#dc2626' : '#8b5cf6';
      
      const placeMarker = new window.google.maps.Marker({
        position: { lat: place.geometry.location.lat, lng: place.geometry.location.lng },
        map: map.current,
        title: place.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      const placeInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">${place.name}</h3>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 12px;">${place.formatted_address}</p>
            ${place.rating ? `
              <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px; font-size: 12px;">
                <span style="color: #fbbf24;">★</span>
                <span>${place.rating}</span>
              </div>
            ` : ''}
            ${place.types.length > 0 ? `
              <div style="margin-top: 8px;">
                <span style="font-size: 12px; color: #888;">${place.types[0].replace(/_/g, ' ')}</span>
              </div>
            ` : ''}
          </div>
        `
      });

      placeMarker.addListener('click', () => {
        placeInfoWindow.open(map.current, placeMarker);
        onPlaceClick?.(place);
      });
      
      markersRef.current.push(placeMarker);
      bounds.extend({ lat: place.geometry.location.lat, lng: place.geometry.location.lng });
    });

    // Fit bounds to show all markers if we have any
    if (nearbyUsers.length > 0 || places.length > 0) {
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [nearbyUsers, places, selectedPlace, center, onUserClick, onPlaceClick, isMapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainer} 
        className="absolute inset-0 rounded-lg w-full h-full" 
        style={{ minHeight: '400px' }} 
      />
      
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Map Legend */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md">
        <div className="text-sm font-medium mb-2">Legend</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Coaches</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span>Players</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Places</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>Selected Place</span>
          </div>
        </div>
      </div>
    </div>
  );
}
