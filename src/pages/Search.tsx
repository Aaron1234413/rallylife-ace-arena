
import React, { useState } from 'react';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { useSearchUsers } from '@/hooks/useSearchUsers';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('players');
  const [filters, setFilters] = useState({
    level: 'all',
    location: '',
    skillLevel: 'all',
    coachingFocus: 'all'
  });

  const { 
    data: searchResults, 
    isLoading, 
    refetch 
  } = useSearchUsers({
    query: searchQuery,
    userType: selectedTab === 'coaches' ? 'coach' : 'player',
    filters
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    refetch();
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    refetch();
  };

  return (
    <div className="min-h-screen bg-tennis-green-bg">
      {/* Header */}
      <div className="bg-tennis-green-primary text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-tennis-green-primary rounded-full"></div>
            </div>
            <h1 className="text-2xl font-bold">RallyLife</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-center mb-8 text-gray-900">SEARCH</h2>
          
          {/* Search Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger 
                value="players" 
                className="data-[state=active]:bg-tennis-green-primary data-[state=active]:text-white"
              >
                Players
              </TabsTrigger>
              <TabsTrigger 
                value="tournaments" 
                className="data-[state=active]:bg-tennis-green-primary data-[state=active]:text-white"
              >
                Tournaments
              </TabsTrigger>
              <TabsTrigger 
                value="coaches" 
                className="data-[state=active]:bg-tennis-green-primary data-[state=active]:text-white"
              >
                Coaches
              </TabsTrigger>
            </TabsList>

            {/* Search Input */}
            <div className="relative mb-6">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-12 text-lg border-gray-300 focus:border-tennis-green-primary focus:ring-tennis-green-primary"
              />
            </div>

            {/* Players Tab */}
            <TabsContent value="players" className="space-y-6">
              <SearchFilters
                type="players"
                filters={filters}
                onFiltersChange={handleFilterChange}
              />
              <SearchResults
                results={searchResults || []}
                isLoading={isLoading}
                type="players"
              />
            </TabsContent>

            {/* Tournaments Tab */}
            <TabsContent value="tournaments" className="space-y-6">
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Coming Soon</h3>
                  <p className="text-gray-500">Tournament search will be available in a future update.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Coaches Tab */}
            <TabsContent value="coaches" className="space-y-6">
              <SearchFilters
                type="coaches"
                filters={filters}
                onFiltersChange={handleFilterChange}
              />
              <SearchResults
                results={searchResults || []}
                isLoading={isLoading}
                type="coaches"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
