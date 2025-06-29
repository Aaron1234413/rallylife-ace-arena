
import { useState, useEffect, useRef } from 'react';

interface ActivityLocation {
  id: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  activity_count: number;
  pulse_intensity: 'low' | 'medium' | 'high';
  recent_activity: string;
  timestamp: string;
}

export function useGlobalActivity() {
  const [activityLocations, setActivityLocations] = useState<ActivityLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateActivityLocations = (): ActivityLocation[] => {
    const locations = [
      { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
      { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
      { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
      { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
      { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
      { city: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437 },
      { city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
      { city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
      { city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777 },
      { city: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333 },
      { city: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734 },
      { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
      { city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
      { city: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918 },
      { city: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 }
    ];

    const activities = [
      'completed an intense match',
      'finished a training session',
      'won a tournament',
      'achieved a new personal best',
      'completed group training',
      'finished a coaching session',
      'won a doubles match',
      'completed fitness training'
    ];

    return locations.map(location => {
      const activityCount = Math.floor(Math.random() * 50) + 5;
      const intensity = activityCount > 35 ? 'high' : activityCount > 20 ? 'medium' : 'low';
      
      return {
        id: `${location.city}-${location.country}`,
        ...location,
        activity_count: activityCount,
        pulse_intensity: intensity,
        recent_activity: activities[Math.floor(Math.random() * activities.length)],
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString()
      };
    });
  };

  const updateActivityCounts = () => {
    setActivityLocations(prev => 
      prev.map(location => {
        const change = Math.floor(Math.random() * 6) - 2; // -2 to +3
        const newCount = Math.max(5, location.activity_count + change);
        const newIntensity = newCount > 35 ? 'high' : newCount > 20 ? 'medium' : 'low';
        
        return {
          ...location,
          activity_count: newCount,
          pulse_intensity: newIntensity,
          timestamp: new Date().toISOString()
        };
      })
    );
  };

  useEffect(() => {
    const loadInitialData = () => {
      setLoading(true);
      setActivityLocations(generateActivityLocations());
      setLoading(false);
    };

    loadInitialData();

    // Update activity counts every 5 seconds
    intervalRef.current = setInterval(updateActivityCounts, 5000);

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
