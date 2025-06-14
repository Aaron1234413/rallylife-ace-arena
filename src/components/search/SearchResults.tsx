
import React from 'react';
import { SearchResult } from '@/hooks/useSearchUsers';
import { UserCard } from '@/components/search/UserCard';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search } from 'lucide-react';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  type: 'players' | 'coaches';
}

export function SearchResults({ results, isLoading, type }: SearchResultsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-tennis-green-primary" />
          <p className="text-gray-600">Searching for {type}...</p>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No {type} found</h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or filters to find more results.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {results.length} {type} found
        </h3>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {results.map((user) => (
          <UserCard key={user.id} user={user} type={type} />
        ))}
      </div>
    </div>
  );
}
