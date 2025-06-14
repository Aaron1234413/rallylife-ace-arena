
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MapPin, Search, Users, GraduationCap, Loader2 } from 'lucide-react';

interface LocationControlsProps {
  isLocationSharing: boolean;
  onToggleSharing: (enabled: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
  nearbyCount: number;
  coachCount: number;
  playerCount: number;
  isSearching?: boolean;
}

export function LocationControls({
  isLocationSharing,
  onToggleSharing,
  searchQuery,
  onSearchChange,
  onSearch,
  nearbyCount,
  coachCount,
  playerCount,
  isSearching = false
}: LocationControlsProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm border">
      {/* Location Sharing Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="location-sharing" className="text-sm font-medium">
            Share Location
          </Label>
        </div>
        <Switch
          id="location-sharing"
          checked={isLocationSharing}
          onCheckedChange={onToggleSharing}
        />
      </div>
      
      {/* Search for Courts */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Find Tennis Courts & Venues</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Search for courts, clubs, or parks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={isSearching}
          />
          <Button 
            onClick={onSearch} 
            size="sm" 
            disabled={!searchQuery.trim() || isSearching}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Nearby Stats */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Nearby Players</Label>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {nearbyCount} total
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3" />
            {coachCount} coaches
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {playerCount} players
          </Badge>
        </div>
      </div>
    </div>
  );
}
