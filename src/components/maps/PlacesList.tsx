
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, Loader2 } from 'lucide-react';
import { PlaceResult } from '@/hooks/useGooglePlaces';

interface PlacesListProps {
  places: PlaceResult[];
  onPlaceClick: (place: PlaceResult) => void;
  selectedPlace: PlaceResult | null;
  isLoading: boolean;
}

export function PlacesList({ places, onPlaceClick, selectedPlace, isLoading }: PlacesListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-6 w-6 mx-auto animate-spin" />
        <p className="text-sm text-muted-foreground mt-2">
          Searching for places...
        </p>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-sm text-muted-foreground">
          Search for tennis courts, clubs, or other venues to see results here.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3 p-4">
        {places.map((place) => (
          <Card
            key={place.place_id}
            className={`cursor-pointer transition-colors hover:bg-accent/50 ${
              selectedPlace?.place_id === place.place_id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onPlaceClick(place)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium line-clamp-1">{place.name}</h3>
                  {place.rating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{place.rating}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">{place.formatted_address}</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {place.types.slice(0, 3).map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
                
                {place.opening_hours?.open_now !== undefined && (
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3" />
                    <span className={place.opening_hours.open_now ? 'text-green-600' : 'text-red-600'}>
                      {place.opening_hours.open_now ? 'Open now' : 'Closed'}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
