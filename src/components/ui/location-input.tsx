import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, X, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useUserLocation } from '@/hooks/useUserLocation';
import { toast } from 'sonner';

export interface LocationData {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  place_id?: string;
}

interface LocationInputProps {
  value: LocationData | null;
  onChange: (location: LocationData | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  placeholder = "Enter location...",
  className,
  disabled
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { currentLocation, locationPermission } = useUserLocation();

  useEffect(() => {
    if (value?.address) {
      setQuery(value.address);
    }
  }, [value]);

  const searchPlaces = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-places-search', {
        body: { 
          query: searchQuery,
          type: 'establishment'
        }
      });

      if (error) {
        console.error('Error searching places:', error);
        setSuggestions([]);
        return;
      }

      setSuggestions(data?.results || []);
    } catch (error) {
      console.error('Error searching places:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setShowSuggestions(true);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      searchPlaces(newQuery);
    }, 300);
  };

  const handleSuggestionSelect = (suggestion: any) => {
    const locationData: LocationData = {
      address: suggestion.formatted_address || suggestion.name,
      coordinates: suggestion.geometry?.location && {
        lat: suggestion.geometry.location.lat,
        lng: suggestion.geometry.location.lng
      },
      place_id: suggestion.place_id
    };

    setQuery(locationData.address);
    onChange(locationData);
    setShowSuggestions(false);
  };

  const handleManualSubmit = () => {
    if (query.trim()) {
      onChange({
        address: query.trim()
      });
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    onChange(null);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleUseCurrentLocation = async () => {
    if (!currentLocation) {
      toast.error('Current location not available. Please enable location services.');
      return;
    }

    setIsGettingCurrentLocation(true);
    try {
      // Use reverse geocoding to get address from coordinates
      const { data, error } = await supabase.functions.invoke('google-reverse-geocode', {
        body: { 
          lat: currentLocation.lat, 
          lng: currentLocation.lng 
        }
      });

      if (error) {
        console.error('Error reverse geocoding:', error);
        // Fallback to just coordinates
        const locationData: LocationData = {
          address: `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`,
          coordinates: currentLocation
        };
        setQuery(locationData.address);
        onChange(locationData);
        toast.success('Using current location');
      } else {
        // Use the formatted address from reverse geocoding
        const result = data?.results?.[0];
        const locationData: LocationData = {
          address: result?.formatted_address || `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`,
          coordinates: currentLocation,
          place_id: result?.place_id
        };
        setQuery(locationData.address);
        onChange(locationData);
        toast.success('Using current location');
      }
    } catch (error) {
      console.error('Error getting current location address:', error);
      // Fallback to coordinates only
      const locationData: LocationData = {
        address: `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`,
        coordinates: currentLocation
      };
      setQuery(locationData.address);
      onChange(locationData);
      toast.success('Using current location');
    } finally {
      setIsGettingCurrentLocation(false);
      setShowSuggestions(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-24"
          onFocus={() => setShowSuggestions(true)}
          onBlur={(e) => {
            // Delay hiding suggestions to allow clicks
            setTimeout(() => setShowSuggestions(false), 150);
          }}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {currentLocation && locationPermission === 'granted' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleUseCurrentLocation}
              disabled={isGettingCurrentLocation || disabled}
              className="h-6 w-6 p-0"
              title="Use current location"
            >
              {isGettingCurrentLocation ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Navigation className="h-3 w-3" />
              )}
            </Button>
          )}
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0"
              title="Clear location"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {isLoading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || query.trim()) && (
        <div className="absolute z-50 top-full mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id || index}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground border-b last:border-b-0 transition-colors"
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{suggestion.name}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {suggestion.formatted_address}
                  </div>
                </div>
              </div>
            </button>
          ))}

          {/* Manual entry option */}
          {query.trim() && (
            <button
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground border-t transition-colors"
              onClick={handleManualSubmit}
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Use "{query}" as location</span>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
};