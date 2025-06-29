
import { useState, useEffect, useRef } from 'react';

interface ActivityLocation {
  id: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  activity_count: number;
  recent_activity: string;
  pulse_intensity: 'low' | 'medium' | 'high';
  timestamp: string;
}

export function useGlobalActivity() {
  const [activityLocations, setActivityLocations] = useState<ActivityLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate global activity data with realistic locations
  const generateActivityLocations = (): ActivityLocation[] => {
    const cities = [
      { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
      { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
      { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
      { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
      { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
      { name: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437 },
      { name: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918 },
      { name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734 },
      { name: 'Melbourne', country: 'Australia', lat: -37.8136, lng: 144.9631 },
      { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 }
    ];

    return cities.map((city, index) => {
      const activityCount = Math.floor(Math.random() * 50) + 10;
      const activities = [
        'Tennis match completed',
        'Training session active',
        'Achievement unlocked',
        'New player joined',
        'Tournament started'
      ];

      return {
        id: `location-${index}`,
        lat: city.lat,
        lng: city.lng,
        city: city.name,
        country: city.country,
        activity_count: activityCount,
        recent_activity: activities[Math.floor(Math.random() * activities.length)],
        pulse_intensity: activityCount > 35 ? 'high' : activityCount > 20 ? 'medium' : 'low',
        timestamp: new Date().toISOString()
      };
    });
  };

  const updateActivityLocations = () => {
    setActivityLocations(prev => 
      prev.map(location => ({
        ...location,
        activity_count: Math.max(1, location.activity_count + Math.floor(Math.random() * 6) - 2),
        pulse_intensity: (() => {
          const count = location.activity_count;
          return count > 35 ? 'high' : count > 20 ? 'medium' : 'low';
        })(),
        timestamp: new Date().toISOString()
      }))
    );
  };

  useEffect(() => {
    // Initial load
    setActivityLocations(generateActivityLocations());
    setLoading(false);

    // Update locations every 5 seconds
    intervalRef.current = setInterval(updateActivityLocations, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    activityLocations,
    loading
  };
}
