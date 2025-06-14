
import { useState } from 'react';
import { toast } from 'sonner';

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  rating?: number;
  photos?: any[];
  price_level?: number;
  opening_hours?: {
    open_now: boolean;
  };
}

export function useGooglePlaces() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);

  const searchPlaces = async (query: string, location?: { lat: number; lng: number }, radius: number = 5000) => {
    setIsSearching(true);
    try {
      console.log('Searching for places:', { query, location, radius });
      
      // Call our Supabase edge function
      const response = await fetch('/functions/v1/google-places-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          location,
          radius,
          type: 'establishment'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const results = data.results || [];
      setSearchResults(results);
      toast.success(`Found ${results.length} places`);
      
      return results;
    } catch (error) {
      console.error('Places search error:', error);
      toast.error('Failed to search for places. Please try again.');
      setSearchResults([]);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  const getPlaceDetails = async (placeId: string) => {
    try {
      console.log('Getting place details for:', placeId);
      
      const response = await fetch('/functions/v1/google-place-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          place_id: placeId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data.result;
    } catch (error) {
      console.error('Place details error:', error);
      toast.error('Failed to get place details');
      return null;
    }
  };

  const clearResults = () => {
    setSearchResults([]);
  };

  return {
    searchResults,
    isSearching,
    searchPlaces,
    getPlaceDetails,
    clearResults,
  };
}
