import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  MapPin, 
  Filter, 
  X, 
  Clock, 
  Users, 
  Target, 
  Zap,
  Navigation
} from 'lucide-react';

interface EnhancedLocationFiltersProps {
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  sessionTypeFilter: string;
  onSessionTypeFilterChange: (type: string) => void;
  stakesFilter: string;
  onStakesFilterChange: (stakes: string) => void;
  levelFilter: string;
  onLevelFilterChange: (level: string) => void;
  availabilityFilter: string;
  onAvailabilityFilterChange: (availability: string) => void;
  showOnlyWithLocation: boolean;
  onShowOnlyWithLocationChange: (value: boolean) => void;
  showTravelTime: boolean;
  onShowTravelTimeChange: (value: boolean) => void;
  hasLocation: boolean;
  activeFiltersCount: number;
  onClearFilters: () => void;
  currentLocation?: { lat: number; lng: number } | null;
}

export const EnhancedLocationFilters: React.FC<EnhancedLocationFiltersProps> = ({
  radiusKm,
  onRadiusChange,
  sortBy,
  onSortChange,
  sessionTypeFilter,
  onSessionTypeFilterChange,
  stakesFilter,
  onStakesFilterChange,
  levelFilter,
  onLevelFilterChange,
  availabilityFilter,
  onAvailabilityFilterChange,
  showOnlyWithLocation,
  onShowOnlyWithLocationChange,
  showTravelTime,
  onShowTravelTimeChange,
  hasLocation,
  activeFiltersCount,
  onClearFilters,
  currentLocation
}) => {
  const getTravelTimeEstimate = (km: number) => {
    const walkingTime = Math.round(km * 12); // 12 min per km walking
    const drivingTime = Math.round(km * 2.5); // 2.5 min per km driving
    return { walking: walkingTime, driving: drivingTime };
  };

  const currentTravelTime = getTravelTimeEstimate(radiusKm);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5 text-blue-600" />
          Enhanced Location Filters
          {hasLocation && (
            <Badge variant="outline" className="ml-2">
              <Navigation className="h-3 w-3 mr-1" />
              Location Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Location Controls */}
        {hasLocation && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Search Radius
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-700">{radiusKm}km</span>
                {showTravelTime && (
                  <Badge variant="secondary" className="text-xs">
                    ~{currentTravelTime.driving}min drive
                  </Badge>
                )}
              </div>
            </div>
            
            <Slider
              value={[radiusKm]}
              onValueChange={([value]) => onRadiusChange(value)}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>1km</span>
              <span>50km</span>
              <span>100km</span>
            </div>
            
            {showTravelTime && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 text-green-700">
                  <Clock className="h-3 w-3" />
                  Walk: ~{currentTravelTime.walking}min
                </div>
                <div className="flex items-center gap-1 text-blue-700">
                  <Clock className="h-3 w-3" />
                  Drive: ~{currentTravelTime.driving}min
                </div>
              </div>
            )}
          </div>
        )}

        {/* Location Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Only show sessions with precise location</label>
            <Switch
              checked={showOnlyWithLocation}
              onCheckedChange={onShowOnlyWithLocationChange}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show travel time estimates</label>
            <Switch
              checked={showTravelTime}
              onCheckedChange={onShowTravelTimeChange}
            />
          </div>
        </div>

        {/* Sort Options */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Sort By</label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hasLocation && (
                <>
                  <SelectItem value="distance">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      Distance (Nearest First)
                    </div>
                  </SelectItem>
                  <SelectItem value="travel_time">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Travel Time
                    </div>
                  </SelectItem>
                </>
              )}
              <SelectItem value="created_at">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Recently Created
                </div>
              </SelectItem>
              <SelectItem value="participants">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  Most Participants
                </div>
              </SelectItem>
              <SelectItem value="stakes">
                <div className="flex items-center gap-2">
                  <Target className="h-3 w-3" />
                  Highest Stakes
                </div>
              </SelectItem>
              <SelectItem value="recommendation">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  Best Match
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Session Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Session Type</label>
          <Select value={sessionTypeFilter} onValueChange={onSessionTypeFilterChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="match">Tennis Match</SelectItem>
              <SelectItem value="social_play">Social Play</SelectItem>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="wellbeing">Wellbeing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Level Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Player Level</label>
          <Select value={levelFilter} onValueChange={onLevelFilterChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Level</SelectItem>
              <SelectItem value="beginner">Beginner (Level 1-5)</SelectItem>
              <SelectItem value="intermediate">Intermediate (Level 6-15)</SelectItem>
              <SelectItem value="advanced">Advanced (Level 16-25)</SelectItem>
              <SelectItem value="expert">Expert (Level 25+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stakes Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Stakes</label>
          <Select value={stakesFilter} onValueChange={onStakesFilterChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Stakes</SelectItem>
              <SelectItem value="free">Free (No Stakes)</SelectItem>
              <SelectItem value="low">Low Stakes (1-50 tokens)</SelectItem>
              <SelectItem value="medium">Medium Stakes (51-200 tokens)</SelectItem>
              <SelectItem value="high">High Stakes (200+ tokens)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Availability Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Availability</label>
          <Select value={availabilityFilter} onValueChange={onAvailabilityFilterChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="available">Available to Join</SelectItem>
              <SelectItem value="filling_fast">Filling Fast (1-2 spots)</SelectItem>
              <SelectItem value="just_created">Just Created (&lt; 1 hour)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-8 px-3"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
        )}

        {/* Location Info */}
        {currentLocation && (
          <div className="pt-4 border-t text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>Your location: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};