
import React from 'react';
import { SearchResult } from '@/hooks/useSearchUsers';
import { UserCard } from '@/components/search/UserCard';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, Users, UserCheck } from 'lucide-react';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  type: 'players' | 'coaches';
}

export function SearchResults({ results, isLoading, type }: SearchResultsProps) {
  if (isLoading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-white/30 shadow-lg">
        <CardContent className="p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-tennis-green-primary" />
          <h3 className="text-xl font-semibold text-tennis-green-dark mb-2">
            Searching for {type}...
          </h3>
          <p className="text-tennis-green-dark/70">
            Finding the best matches for you
          </p>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    const IconComponent = type === 'coaches' ? UserCheck : Users;
    
    return (
      <Card className="bg-tennis-green-bg/30 border-tennis-green-bg/50">
        <CardContent className="p-12 text-center">
          <IconComponent className="h-16 w-16 mx-auto mb-6 text-tennis-green-medium" />
          <h3 className="text-2xl font-semibold text-tennis-green-dark mb-3">
            No {type} found
          </h3>
          <p className="text-tennis-green-dark/70 text-lg">
            Try adjusting your search criteria or filters to find more results.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-tennis-green-primary rounded-full flex items-center justify-center">
            <Search className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-tennis-green-dark">
              {results.length} {type} found
            </h3>
            <p className="text-tennis-green-dark/70 text-sm">
              Best matches for your search
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {results.map((user) => (
          <div key={user.id} className="transform transition-all duration-200 hover:scale-[1.02]">
            <UserCard user={user} type={type} />
          </div>
        ))}
      </div>
    </div>
  );
}
