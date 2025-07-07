import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Filter, X } from 'lucide-react';

interface LocationFiltersProps {
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  sessionTypeFilter: string;
  onSessionTypeFilterChange: (type: string) => void;
  stakesFilter: string;
  onStakesFilterChange: (stakes: string) => void;
  hasLocation: boolean;
  activeFiltersCount: number;
  onClearFilters: () => void;
}

export const LocationFilters: React.FC<LocationFiltersProps> = ({
  radiusKm,
  onRadiusChange,
  sortBy,
  onSortChange,
  sessionTypeFilter,
  onSessionTypeFilterChange,
  stakesFilter,
  onStakesFilterChange,
  hasLocation,
  activeFiltersCount,
  onClearFilters
}) => {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Location Radius */}
        {hasLocation && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Search Radius
              </label>
              <span className="text-sm text-gray-600">{radiusKm}km</span>
            </div>
            <Slider
              value={[radiusKm]}
              onValueChange={([value]) => onRadiusChange(value)}
              max={100}
              min={5}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5km</span>
              <span>100km</span>
            </div>
          </div>
        )}

        {/* Sort By */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Sort By</label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hasLocation && (
                <SelectItem value="distance">Distance (Nearest First)</SelectItem>
              )}
              <SelectItem value="created_at">Recently Created</SelectItem>
              <SelectItem value="participants">Most Participants</SelectItem>
              <SelectItem value="stakes">Highest Stakes</SelectItem>
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

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 px-2"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};