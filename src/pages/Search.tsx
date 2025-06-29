
import React, { useState } from 'react';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { useSearchUsers } from '@/hooks/useSearchUsers';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Users, Trophy, UserCheck } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-tennis-neutral-100 via-tennis-neutral-50 to-white">
      {/* Header - Strategic neutral colors */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-tennis-neutral-200 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-tennis-info rounded-full flex items-center justify-center shadow-lg">
              <SearchIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="orbitron-heading text-display text-tennis-neutral-800">
                Rako Search
              </h1>
              <p className="poppins-body text-body text-tennis-neutral-600">
                Find players, coaches, and tournaments
              </p>
            </div>
          </div>
          
          {/* Search Input - Strategic neutral colors */}
          <div className="relative mb-6">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-tennis-neutral-500 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for players, coaches, or tournaments..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="poppins-body pl-12 h-14 text-body-lg border-tennis-neutral-300 focus:border-tennis-info focus:ring-tennis-info bg-white/90 backdrop-blur-sm shadow-sm"
            />
          </div>

          {/* Search Tabs - Strategic colors for different content types */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/90 backdrop-blur-sm border border-tennis-neutral-300 shadow-sm">
              <TabsTrigger 
                value="players" 
                className="poppins-body data-[state=active]:bg-tennis-info data-[state=active]:text-white flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Players
              </TabsTrigger>
              <TabsTrigger 
                value="tournaments" 
                className="poppins-body data-[state=active]:bg-tennis-yellow data-[state=active]:text-tennis-yellow-dark flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                Tournaments
              </TabsTrigger>
              <TabsTrigger 
                value="coaches" 
                className="poppins-body data-[state=active]:bg-tennis-primary data-[state=active]:text-white flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Coaches
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-tennis-neutral-200 p-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            {/* Players Tab */}
            <TabsContent value="players" className="space-y-6 mt-6">
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

            {/* Tournaments Tab - Yellow for premium/featured content */}
            <TabsContent value="tournaments" className="space-y-6 mt-6">
              <Card className="bg-tennis-yellow-light border-tennis-yellow">
                <CardContent className="p-12 text-center">
                  <Trophy className="h-16 w-16 mx-auto text-tennis-yellow-dark mb-4" />
                  <h3 className="orbitron-heading text-heading-lg text-tennis-yellow-dark mb-3">
                    Tournament Search Coming Soon
                  </h3>
                  <p className="poppins-body text-tennis-neutral-700 text-body-lg">
                    We're working on bringing you comprehensive tournament search and registration features. 
                    Stay tuned for exciting competitive opportunities!
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Coaches Tab */}
            <TabsContent value="coaches" className="space-y-6 mt-6">
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
