import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { 
  Search, 
  Filter, 
  X, 
  MapPin,
  Star,
  Zap,
  Users
} from 'lucide-react';

interface LeaderboardFiltersProps {
  userType: 'player' | 'coach';
  onFiltersChange: (filters: LeaderboardFilters) => void;
  initialFilters?: Partial<LeaderboardFilters>;
}

export interface LeaderboardFilters {
  search: string;
  levelRange: [number, number];
  location: string;
  specialization: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  category: string;
  sortBy: 'rank' | 'recent_activity' | 'connections';
}

const defaultFilters: LeaderboardFilters = {
  search: '',
  levelRange: [1, 100],
  location: '',
  specialization: '',
  period: 'all_time',
  category: 'overall',
  sortBy: 'rank'
};

const coachSpecializations = [
  'Technique',
  'Strategy', 
  'Mental Game',
  'Fitness',
  'Serve & Volley',
  'Baseline',
  'Doubles',
  'Junior Development',
  'Advanced'
];

const leaderboardCategories = {
  player: [
    { value: 'overall', label: 'Overall XP', icon: Star },
    { value: 'recent', label: 'Recent Activity', icon: Zap },
    { value: 'weekly', label: 'Weekly Progress', icon: Users },
    { value: 'monthly', label: 'Monthly Leaders', icon: Users }
  ],
  coach: [
    { value: 'overall', label: 'Overall CXP', icon: Star },
    { value: 'crp', label: 'Reputation', icon: Star },
    { value: 'player_success', label: 'Player Success', icon: Users },
    { value: 'recent', label: 'Recent Activity', icon: Zap }
  ]
};

export function LeaderboardFilters({ userType, onFiltersChange, initialFilters }: LeaderboardFiltersProps) {
  const [filters, setFilters] = useState<LeaderboardFilters>({
    ...defaultFilters,
    ...initialFilters
  });
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const updateFilters = (updates: Partial<LeaderboardFilters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return value !== '';
    if (key === 'levelRange') return value[0] !== 1 || value[1] !== 100;
    if (key === 'location' || key === 'specialization') return value !== '';
    if (key === 'period') return value !== 'all_time';
    if (key === 'category') return value !== 'overall';
    if (key === 'sortBy') return value !== 'rank';
    return false;
  }).length;

  const categories = leaderboardCategories[userType];

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-light shadow-lg">
      <CardContent className="p-4 space-y-4">
        {/* Search and Quick Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-tennis-green-medium" />
            <Input
              placeholder={`Search ${userType}s by name...`}
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10 bg-white border-tennis-green-light focus:border-tennis-green-primary"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filters.category} onValueChange={(value) => updateFilters({ category: value })}>
              <SelectTrigger className="w-[160px] bg-white border-tennis-green-light">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-tennis-green-light">
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <category.icon className="h-4 w-4" />
                      {category.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.period} onValueChange={(value) => updateFilters({ period: value as any })}>
              <SelectTrigger className="w-[130px] bg-white border-tennis-green-light">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-tennis-green-light">
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="all_time">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="default"
                  className="relative border-tennis-green-light hover:bg-tennis-green-bg/20"
                >
                  <Filter className="h-4 w-4" />
                  {activeFilterCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-white border border-tennis-green-light shadow-lg" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-tennis-green-dark">Advanced Filters</h4>
                    {activeFilterCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 px-2 text-tennis-green-medium hover:text-tennis-green-dark"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>

                  {/* Level Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-tennis-green-dark">
                      Level Range: {filters.levelRange[0]} - {filters.levelRange[1]}
                    </label>
                    <Slider
                      value={filters.levelRange}
                      onValueChange={(value) => updateFilters({ levelRange: value as [number, number] })}
                      max={100}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-tennis-green-dark flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Location
                    </label>
                    <Input
                      placeholder="Enter city or region..."
                      value={filters.location}
                      onChange={(e) => updateFilters({ location: e.target.value })}
                      className="bg-white border-tennis-green-light"
                    />
                  </div>

                  {/* Coach Specialization */}
                  {userType === 'coach' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-tennis-green-dark">
                        Specialization
                      </label>
                      <Select value={filters.specialization} onValueChange={(value) => updateFilters({ specialization: value })}>
                        <SelectTrigger className="bg-white border-tennis-green-light">
                          <SelectValue placeholder="Select specialization..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-tennis-green-light">
                          <SelectItem value="">All Specializations</SelectItem>
                          {coachSpecializations.map((spec) => (
                            <SelectItem key={spec} value={spec.toLowerCase()}>
                              {spec}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Sort By */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-tennis-green-dark">
                      Sort By
                    </label>
                    <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value as any })}>
                      <SelectTrigger className="bg-white border-tennis-green-light">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-tennis-green-light">
                        <SelectItem value="rank">Rank</SelectItem>
                        <SelectItem value="recent_activity">Recent Activity</SelectItem>
                        <SelectItem value="connections">Connections</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="secondary" className="bg-tennis-green-bg text-tennis-green-dark">
                Search: {filters.search}
                <button
                  onClick={() => updateFilters({ search: '' })}
                  className="ml-1 hover:text-tennis-green-primary"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(filters.levelRange[0] !== 1 || filters.levelRange[1] !== 100) && (
              <Badge variant="secondary" className="bg-tennis-green-bg text-tennis-green-dark">
                Level: {filters.levelRange[0]}-{filters.levelRange[1]}
                <button
                  onClick={() => updateFilters({ levelRange: [1, 100] })}
                  className="ml-1 hover:text-tennis-green-primary"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.location && (
              <Badge variant="secondary" className="bg-tennis-green-bg text-tennis-green-dark">
                Location: {filters.location}
                <button
                  onClick={() => updateFilters({ location: '' })}
                  className="ml-1 hover:text-tennis-green-primary"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.specialization && (
              <Badge variant="secondary" className="bg-tennis-green-bg text-tennis-green-dark">
                Specialization: {filters.specialization}
                <button
                  onClick={() => updateFilters({ specialization: '' })}
                  className="ml-1 hover:text-tennis-green-primary"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}