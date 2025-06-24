
import { useQuery } from '@tanstack/react-query';
import { fetchSearchResults, SearchResult } from '@/utils/searchUsers';

interface SearchFilters {
  level: string;
  location: string;
  skillLevel: string;
  coachingFocus: string;
}

interface SearchParams {
  query: string;
  userType: 'player' | 'coach';
  filters: SearchFilters;
}

export { SearchResult };

export function useSearchUsers({ query, userType, filters }: SearchParams) {
  return useQuery({
    queryKey: ['search-users', query, userType, filters],
    queryFn: (): Promise<SearchResult[]> => fetchSearchResults({ query, userType, filters }),
    enabled: !!query || Object.values(filters).some(f => f !== 'all' && f !== ''),
  });
}
