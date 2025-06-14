
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
  const [mapboxToken] = useState('pk.eyJ1IjoibG92YWJsZS1haS1kZW1vIiwiYSI6ImNsc3N1aHdwczAwODcyaW1sNXRnbXBnMDkifQ.olTbOIEj7OSgniW1JwF6oQ');

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [center.lng, center.lat],
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add click handler
    if (onMapClick) {
      map.current.on('click', (e) => {
        onMapClick(e.lngLat.lat, e.lngLat.lng);
      });
    }

    return () => {
      map.current?.remove();
    };
  }, [center, mapboxToken, onMapClick]);

  // Update markers when nearby users change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.user-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add current user marker
    const currentUserMarker = new mapboxgl.Marker({ color: '#10b981' })
      .setLngLat([center.lng, center.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<div>Your Location</div>'))
      .addTo(map.current);

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
      
      marker.getElement().classList.add('user-marker');
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
  }, [nearbyUsers, center, onUserClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
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
