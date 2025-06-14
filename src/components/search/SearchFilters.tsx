
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SearchFiltersProps {
  type: 'players' | 'coaches';
  filters: {
    level: string;
    location: string;
    skillLevel: string;
    coachingFocus: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function SearchFilters({ type, filters, onFiltersChange }: SearchFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Level Filter for Players */}
          {type === 'players' && (
            <div className="space-y-2">
              <Label htmlFor="level-filter">Level</Label>
              <Select 
                value={filters.level} 
                onValueChange={(value) => updateFilter('level', value)}
              >
                <SelectTrigger id="level-filter">
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  <SelectItem value="1">Level 1.0</SelectItem>
                  <SelectItem value="2">Level 2.0</SelectItem>
                  <SelectItem value="3">Level 3.0</SelectItem>
                  <SelectItem value="4">Level 4.0</SelectItem>
                  <SelectItem value="5">Level 5.0</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Skill Level Filter for Players */}
          {type === 'players' && (
            <div className="space-y-2">
              <Label htmlFor="skill-filter">Skill Level</Label>
              <Select 
                value={filters.skillLevel} 
                onValueChange={(value) => updateFilter('skillLevel', value)}
              >
                <SelectTrigger id="skill-filter">
                  <SelectValue placeholder="All skill levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All skill levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Coaching Focus Filter for Coaches */}
          {type === 'coaches' && (
            <div className="space-y-2">
              <Label htmlFor="focus-filter">Coaching Focus</Label>
              <Select 
                value={filters.coachingFocus} 
                onValueChange={(value) => updateFilter('coachingFocus', value)}
              >
                <SelectTrigger id="focus-filter">
                  <SelectValue placeholder="All specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All specialties</SelectItem>
                  <SelectItem value="technique">Technique</SelectItem>
                  <SelectItem value="strategy">Strategy</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="mental_game">Mental Game</SelectItem>
                  <SelectItem value="junior_development">Junior Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Location Filter */}
          <div className="space-y-2">
            <Label htmlFor="location-filter">Location</Label>
            <Input
              id="location-filter"
              type="text"
              placeholder="Enter location..."
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              className="focus:border-tennis-green-primary focus:ring-tennis-green-primary"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
