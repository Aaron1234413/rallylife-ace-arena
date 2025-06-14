
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
    console.log('MapView: Starting initialization...');
    console.log('MapView: Token:', mapboxToken);
    console.log('MapView: Center:', center);
    console.log('MapView: Container element:', mapContainer.current);
    
    if (!mapContainer.current || map.current) {
      console.log('MapView: Skipping - container missing or map already exists');
      return;
    }

    try {
      // Set the access token
      mapboxgl.accessToken = mapboxToken;
      console.log('MapView: Access token set');
      
      // Check if WebGL is supported
      if (!mapboxgl.supported()) {
        console.error('MapView: WebGL not supported');
        return;
      }
      console.log('MapView: WebGL supported');
      
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
        console.log('MapView: Map load event fired');
        setIsMapLoaded(true);
      });

      // Map style load event (more reliable for style loading)
      map.current.on('style.load', () => {
        console.log('MapView: Map style loaded');
      });

      // Map render event
      map.current.on('render', () => {
        console.log('MapView: Map render event (tiles loading)');
      });

      // Map idle event (when map finishes loading/moving)
      map.current.on('idle', () => {
        console.log('MapView: Map idle (finished loading)');
      });

      // Error events
      map.current.on('error', (e) => {
        console.error('MapView: Map error:', e);
        console.error('MapView: Error details:', e.error);
      });

      map.current.on('sourcedataloading', (e) => {
        console.log('MapView: Source data loading:', e.sourceId);
      });

      map.current.on('sourcedata', (e) => {
        console.log('MapView: Source data loaded:', e.sourceId, 'isSourceLoaded:', e.isSourceLoaded);
      });

      map.current.on('tiledataloading', (e) => {
        console.log('MapView: Tile data loading');
      });

      map.current.on('data', (e) => {
        console.log('MapView: Data event:', e.dataType);
      });

      // Check map container dimensions
      const containerRect = mapContainer.current.getBoundingClientRect();
      console.log('MapView: Container dimensions:', {
        width: containerRect.width,
        height: containerRect.height,
        visible: containerRect.width > 0 && containerRect.height > 0
      });

    } catch (error) {
      console.error('MapView: Error during map creation:', error);
      console.error('MapView: Error stack:', error.stack);
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

  // Update markers when nearby users change
  useEffect(() => {
    console.log('MapView: Marker update effect triggered');
    console.log('MapView: Map exists:', !!map.current);
    console.log('MapView: Map loaded:', isMapLoaded);
    console.log('MapView: Nearby users count:', nearbyUsers.length);

    if (!map.current) {
      console.log('MapView: Skipping marker update - no map instance');
      return;
    }

    if (!isMapLoaded) {
      console.log('MapView: Skipping marker update - map not loaded yet');
      // Try to force load check
      if (map.current.loaded()) {
        console.log('MapView: Map.loaded() returns true, setting isMapLoaded');
        setIsMapLoaded(true);
        return;
      }
      return;
    }

    console.log('MapView: Updating markers for', nearbyUsers.length, 'users');

    // Clear existing markers
    markersRef.current.forEach(marker => {
      console.log('MapView: Removing existing marker');
      marker.remove();
    });
    markersRef.current = [];

    // Add current user marker
    console.log('MapView: Adding current user marker at:', [center.lng, center.lat]);
    const currentUserMarker = new mapboxgl.Marker({ color: '#10b981' })
      .setLngLat([center.lng, center.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<div>Your Location</div>'))
      .addTo(map.current);

    markersRef.current.push(currentUserMarker);

    // Add nearby users markers
    nearbyUsers.forEach((user, index) => {
      const markerColor = user.role === 'coach' ? '#3b82f6' : '#f59e0b';
      console.log(`MapView: Adding marker ${index + 1} for ${user.full_name} at:`, [user.longitude, user.latitude]);
      
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
        console.log('MapView: User marker clicked:', user.full_name);
        onUserClick?.(user);
      });
      
      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (nearbyUsers.length > 0) {
      console.log('MapView: Fitting bounds to show all markers');
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
      <div 
        ref={mapContainer} 
        className="absolute inset-0 rounded-lg w-full h-full" 
        style={{ 
          minHeight: '400px',
          background: '#f0f0f0' // Temporary background to see if container is visible
        }} 
      />
      
      {/* Debug info */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white p-2 rounded text-xs">
        <div>Map Loaded: {isMapLoaded ? 'Yes' : 'No'}</div>
        <div>Map Instance: {map.current ? 'Yes' : 'No'}</div>
        <div>Users: {nearbyUsers.length}</div>
      </div>
      
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
