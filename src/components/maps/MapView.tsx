import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
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
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Use the provided Mapbox token
  const mapboxToken = 'pk.eyJ1IjoiYWFyb24yMWNhbXBvcyIsImEiOiJjbWJ3ajIyMWoxMXB1MmtwdXQwcTd4eHNqIn0.K6MA2bvtxRxTyH9y9me--w';

  useEffect(() => {
    console.log('MapView: Starting initialization...');
    
    if (!mapContainer.current || map.current) {
      console.log('MapView: Skipping - container missing or map already exists');
      return;
    }

    try {
      // Set the access token
      mapboxgl.accessToken = mapboxToken;
      console.log('MapView: Access token set');
      
      console.log('MapView: Creating map instance...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [center.lng, center.lat],
        zoom: 12,
        antialias: true
      });

      console.log('MapView: Map instance created');

      // Add navigation controls
      const navControl = new mapboxgl.NavigationControl();
      map.current.addControl(navControl, 'top-right');
      console.log('MapView: Navigation controls added');

      // Add click handler
      if (onMapClick) {
        map.current.on('click', (e) => {
          console.log('MapView: Map clicked at:', e.lngLat);
          onMapClick(e.lngLat.lat, e.lngLat.lng);
        });
      }

      // Map load event
      map.current.on('load', () => {
        console.log('MapView: Map loaded successfully');
        setIsMapLoaded(true);
      });

      // Error events
      map.current.on('error', (e) => {
        console.error('MapView: Map error:', e);
      });

    } catch (error) {
      console.error('MapView: Error during map creation:', error);
    }

    return () => {
      console.log('MapView: Cleaning up map');
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      setIsMapLoaded(false);
    };
  }, [center, mapboxToken, onMapClick]);

  // Update markers when users or places change
  useEffect(() => {
    if (!map.current || !isMapLoaded) {
      return;
    }

    console.log('MapView: Updating markers for', nearbyUsers.length, 'users and', places.length, 'places');

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add current user marker
    const currentUserMarker = new mapboxgl.Marker({ color: '#10b981' })
      .setLngLat([center.lng, center.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<div>Your Location</div>'))
      .addTo(map.current);

    markersRef.current.push(currentUserMarker);

    // Add nearby users markers
    nearbyUsers.forEach((user) => {
      const markerColor = user.role === 'coach' ? '#3b82f6' : '#f59e0b';
      
      const marker = new mapboxgl.Marker({ color: markerColor })
        .setLngLat([user.longitude, user.latitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${user.full_name}</h3>
              <p class="text-sm text-gray-600">${user.role}</p>
              <p class="text-xs text-gray-500">${user.distance_km.toFixed(1)}km away</p>
            </div>
          `)
        )
        .addTo(map.current!);

      // Add click handler for user markers
      marker.getElement().addEventListener('click', () => {
        onUserClick?.(user);
      });
      
      markersRef.current.push(marker);
    });

    // Add place markers
    places.forEach((place) => {
      const isSelected = selectedPlace?.place_id === place.place_id;
      const markerColor = isSelected ? '#dc2626' : '#8b5cf6';
      
      const marker = new mapboxgl.Marker({ color: markerColor })
        .setLngLat([place.geometry.location.lng, place.geometry.location.lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div class="p-3 max-w-xs">
              <h3 class="font-semibold text-sm">${place.name}</h3>
              <p class="text-xs text-gray-600 mt-1">${place.formatted_address}</p>
              ${place.rating ? `
                <div class="flex items-center gap-1 mt-2 text-xs">
                  <span class="text-yellow-500">★</span>
                  <span>${place.rating}</span>
                </div>
              ` : ''}
              ${place.types.length > 0 ? `
                <div class="mt-2">
                  <span class="text-xs text-gray-500">${place.types[0].replace(/_/g, ' ')}</span>
                </div>
              ` : ''}
            </div>
          `)
        )
        .addTo(map.current!);

      // Add click handler for place markers
      marker.getElement().addEventListener('click', () => {
        onPlaceClick?.(place);
      });
      
      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers if we have any
    if (nearbyUsers.length > 0 || places.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([center.lng, center.lat]);
      
      nearbyUsers.forEach(user => {
        bounds.extend([user.longitude, user.latitude]);
      });
      
      places.forEach(place => {
        bounds.extend([place.geometry.location.lng, place.geometry.location.lat]);
      });
      
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
