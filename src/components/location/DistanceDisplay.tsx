import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Car, PersonStanding, Bike } from 'lucide-react';
import { DistanceCalculation } from '@/services/LocationService';

interface DistanceDisplayProps {
  distance: DistanceCalculation;
  showTravelTime?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export const DistanceDisplay: React.FC<DistanceDisplayProps> = ({
  distance,
  showTravelTime = false,
  variant = 'default',
  className = ''
}) => {
  const formatDistance = (km: number) => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    } else if (km < 10) {
      return `${Math.round(km * 10) / 10}km`;
    } else {
      return `${Math.round(km)}km`;
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    }
  };

  if (variant === 'compact') {
    return (
      <Badge variant="secondary" className={`flex items-center gap-1 ${className}`}>
        <MapPin className="h-3 w-3" />
        {formatDistance(distance.distanceKm)}
      </Badge>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="font-medium">{formatDistance(distance.distanceKm)} away</span>
        </div>
        
        {showTravelTime && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1 text-green-700">
              <PersonStanding className="h-3 w-3" />
              <span>{formatTime(distance.walkingTimeMinutes)}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-700">
              <Bike className="h-3 w-3" />
              <span>{formatTime(distance.cyclingTimeMinutes)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-700">
              <Car className="h-3 w-3" />
              <span>{formatTime(distance.drivingTimeMinutes)}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="secondary" className="flex items-center gap-1">
        <MapPin className="h-3 w-3" />
        {formatDistance(distance.distanceKm)}
      </Badge>
      
      {showTravelTime && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatTime(distance.drivingTimeMinutes)}
        </Badge>
      )}
    </div>
  );
};