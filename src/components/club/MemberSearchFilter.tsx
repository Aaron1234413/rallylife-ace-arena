import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Search, Filter, X } from 'lucide-react';

interface MemberSearchFilterProps {
  onSearch: (filters: SearchFilters) => void;
  totalMembers: number;
  filteredCount: number;
}

export interface SearchFilters {
  searchTerm: string;
  utrRange: [number, number];
  ustaRange: [number, number];
  showOnlyLookingToPlay: boolean;
  location: string;
}

export function MemberSearchFilter({ 
  onSearch, 
  totalMembers, 
  filteredCount 
}: MemberSearchFilterProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    utrRange: [1, 16.5],
    ustaRange: [1, 7],
    showOnlyLookingToPlay: false,
    location: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onSearch(updated);
  };

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      searchTerm: '',
      utrRange: [1, 16.5],
      ustaRange: [1, 7],
      showOnlyLookingToPlay: false,
      location: ''
    };
    setFilters(defaultFilters);
    onSearch(defaultFilters);
  };

  const hasActiveFilters = filters.searchTerm || 
    filters.utrRange[0] > 1 || filters.utrRange[1] < 16.5 ||
    filters.ustaRange[0] > 1 || filters.ustaRange[1] < 7 ||
    filters.showOnlyLookingToPlay || 
    filters.location;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Find Members</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {filteredCount} of {totalMembers}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-tennis-green-medium" />
          <Input
            placeholder="Search by name..."
            value={filters.searchTerm}
            onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Looking to Play Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="looking-to-play" className="text-sm font-medium">
            Show only players looking to play
          </Label>
          <Switch
            id="looking-to-play"
            checked={filters.showOnlyLookingToPlay}
            onCheckedChange={(checked) => updateFilters({ showOnlyLookingToPlay: checked })}
          />
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            {/* Location Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Location</Label>
              <Input
                placeholder="Filter by location..."
                value={filters.location}
                onChange={(e) => updateFilters({ location: e.target.value })}
              />
            </div>

            {/* UTR Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                UTR Range: {filters.utrRange[0]} - {filters.utrRange[1]}
              </Label>
              <Slider
                value={filters.utrRange}
                onValueChange={(value) => updateFilters({ utrRange: value as [number, number] })}
                min={1}
                max={16.5}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* USTA Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                USTA Range: {filters.ustaRange[0]} - {filters.ustaRange[1]}
              </Label>
              <Slider
                value={filters.ustaRange}
                onValueChange={(value) => updateFilters({ ustaRange: value as [number, number] })}
                min={1}
                max={7}
                step={0.5}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="w-full flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}