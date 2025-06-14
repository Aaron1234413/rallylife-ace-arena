
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { UserLocation } from '@/hooks/useUserLocation';

interface MapViewProps {
  center: { lat: number; lng: number };
  nearbyUsers: UserLocation[];
  onUserClick?: (user: UserLocation) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

export function MapView({ center, nearbyUsers, onUserClick, onMapClick }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapboxToken] = useState('pk.eyJ1IjoiYWFyb24yMWNhbXBvcyIsImEiOiJjbWJ3ajIyMWoxMXB1MmtwdXQwcTd4eHNqIn0.K6MA2bvtxRxTyH9y9me--w');

  useEffect(() => {
    console.log('MapView: Initializing with token:', mapboxToken);
    console.log('MapView: Center coordinates:', center);
    console.log('MapView: Map container ref:', mapContainer.current);
    
    if (!mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      console.log('MapView: Mapbox token set, creating map...');
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [center.lng, center.lat],
        zoom: 12,
      });

      console.log('MapView: Map created successfully');

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add click handler
      if (onMapClick) {
        map.current.on('click', (e) => {
          onMapClick(e.lngLat.lat, e.lngLat.lng);
        });
      }

      // Set map as loaded when it's ready
      map.current.on('load', () => {
        console.log('MapView: Map loaded successfully');
        setIsMapLoaded(true);
      });

      map.current.on('error', (e) => {
        console.error('MapView: Map error:', e);
      });

    } catch (error) {
      console.error('MapView: Error creating map:', error);
    }

    return () => {
      console.log('MapView: Cleaning up map');
      map.current?.remove();
    };
  }, [center, mapboxToken, onMapClick]);

  // Update markers when nearby users change
  useEffect(() => {
    if (!map.current || !isMapLoaded) {
      console.log('MapView: Skipping marker update - map not ready');
      return;
    }

    console.log('MapView: Updating markers for', nearbyUsers.length, 'users');

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
    nearbyUsers.forEach(user => {
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

    // Fit bounds to show all markers
    if (nearbyUsers.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([center.lng, center.lat]);
      nearbyUsers.forEach(user => {
        bounds.extend([user.longitude, user.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [nearbyUsers, center, onUserClick, isMapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg w-full h-full" style={{ minHeight: '400px' }} />
      
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
        </div>
      </div>
    </div>
  );
}
