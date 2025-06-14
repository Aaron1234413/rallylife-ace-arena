
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
}

export function useGooglePlaces() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);

  const searchPlaces = async (query: string, location?: { lat: number; lng: number }, type: string = 'tennis') => {
    setIsSearching(true);
    try {
      // This will be implemented with Google Places API
      // For now, return mock data
      const mockResults: PlaceResult[] = [
        {
          place_id: 'mock_1',
          name: 'Central Tennis Club',
          formatted_address: '123 Tennis St, City, State',
          geometry: {
            location: {
              lat: location?.lat || 40.7128,
              lng: location?.lng || -74.0060
            }
          },
          types: ['establishment', 'point_of_interest'],
          rating: 4.5
        }
      ];
      
      setSearchResults(mockResults);
      toast.success(`Found ${mockResults.length} tennis facilities`);
    } catch (error) {
      console.error('Places search error:', error);
      toast.error('Failed to search for places');
    } finally {
      setIsSearching(false);
    }
  };

  const getPlaceDetails = async (placeId: string) => {
    try {
      // This will be implemented with Google Places API
      // For now, return mock data
      return {
        place_id: placeId,
        name: 'Tennis Court Details',
        formatted_address: '123 Tennis St, City, State',
        geometry: { location: { lat: 40.7128, lng: -74.0060 } },
        types: ['establishment'],
        rating: 4.5,
        opening_hours: {
          open_now: true,
          weekday_text: ['Monday: 6:00 AM – 10:00 PM']
        },
        formatted_phone_number: '(555) 123-4567'
      };
    } catch (error) {
      console.error('Place details error:', error);
      toast.error('Failed to get place details');
      return null;
    }
  };

  return {
    searchResults,
    isSearching,
    searchPlaces,
    getPlaceDetails,
  };
}
