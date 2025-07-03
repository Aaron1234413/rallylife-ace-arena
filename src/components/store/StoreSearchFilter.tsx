
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StoreSearchFilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: StoreFilters) => void;
}

interface StoreFilters {
  priceRange: 'all' | 'low' | 'medium' | 'high';
  tokenType: 'all' | 'regular' | 'premium';
  availability: 'all' | 'available' | 'owned';
}

export function StoreSearchFilter({ onSearch, onFilterChange }: StoreSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<StoreFilters>({
    priceRange: 'all',
    tokenType: 'all',
    availability: 'all'
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (key: keyof StoreFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: StoreFilters = {
      priceRange: 'all',
      tokenType: 'all',
      availability: 'all'
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== 'all').length;

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search store items..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-4 border-gray-300 focus:border-tennis-green-primary focus:ring-tennis-green-primary"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="h-8 text-xs border-gray-300 hover:border-tennis-green-primary hover:text-tennis-green-primary"
        >
          <SlidersHorizontal className="h-3 w-3 mr-1" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 bg-tennis-green-primary text-white text-xs flex items-center justify-center">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-xs text-gray-500 hover:text-gray-700"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="bg-white/95 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Price Range</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'low', label: '1-50' },
                    { value: 'medium', label: '51-200' },
                    { value: 'high', label: '200+' }
                  ].map(option => (
                    <Button
                      key={option.value}
                      variant={filters.priceRange === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('priceRange', option.value)}
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Token Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Token Type</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'regular', label: 'Regular' },
                    { value: 'premium', label: 'Premium' }
                  ].map(option => (
                    <Button
                      key={option.value}
                      variant={filters.tokenType === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('tokenType', option.value)}
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Availability</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'available', label: 'Available' },
                    { value: 'owned', label: 'Owned' }
                  ].map(option => (
                    <Button
                      key={option.value}
                      variant={filters.availability === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('availability', option.value)}
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
