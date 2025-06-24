
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

export interface SearchResult {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  level?: number;
  skill_level?: string;
  coaching_focus?: string;
  experience_years?: number;
  location?: string;
  match_percentage?: number;
  current_level?: number;
}

// Define explicit types for database responses to avoid infinite recursion
interface ProfileData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  player_profiles: Array<{
    skill_level: string | null;
    location: string | null;
  }> | null;
  coach_profiles: Array<{
    coaching_focus: string | null;
    experience_years: number | null;
    location: string | null;
  }> | null;
  player_xp: Array<{
    current_level: number | null;
  }> | null;
}

export function useSearchUsers({ query, userType, filters }: SearchParams) {
  return useQuery({
    queryKey: ['search-users', query, userType, filters],
    queryFn: async (): Promise<SearchResult[]> => {
      console.log('Searching users with:', { query, userType, filters });
      
      let baseQuery = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          role,
          player_profiles (
            skill_level,
            location
          ),
          coach_profiles (
            coaching_focus,
            experience_years,
            location
          ),
          player_xp (
            current_level
          )
        `)
        .eq('role', userType)
        .ilike('full_name', `%${query}%`)
        .limit(20);

      const { data, error } = await baseQuery;

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      console.log('Raw search results:', data);

      // Transform and filter the results
      const transformedResults: SearchResult[] = (data as ProfileData[] || []).map((user) => {
        const playerProfile = Array.isArray(user.player_profiles) ? user.player_profiles[0] : null;
        const coachProfile = Array.isArray(user.coach_profiles) ? user.coach_profiles[0] : null;
        const playerXP = Array.isArray(user.player_xp) ? user.player_xp[0] : null;
        
        // Calculate a simple match percentage (placeholder logic)
        const matchPercentage = Math.floor(Math.random() * 40) + 60; // 60-100%

        return {
          id: user.id,
          full_name: user.full_name || 'Unknown User',
          avatar_url: user.avatar_url || undefined,
          role: user.role,
          skill_level: playerProfile?.skill_level || undefined,
          location: playerProfile?.location || coachProfile?.location || undefined,
          coaching_focus: coachProfile?.coaching_focus || undefined,
          experience_years: coachProfile?.experience_years || undefined,
          match_percentage: matchPercentage,
          current_level: playerXP?.current_level || 1
        };
      });

      // Apply additional filters
      let filteredResults = transformedResults;

      if (filters.skillLevel !== 'all' && userType === 'player') {
        filteredResults = filteredResults.filter(user => 
          user.skill_level === filters.skillLevel
        );
      }

      if (filters.coachingFocus !== 'all' && userType === 'coach') {
        filteredResults = filteredResults.filter(user => 
          user.coaching_focus === filters.coachingFocus
        );
      }

      if (filters.location.trim()) {
        filteredResults = filteredResults.filter(user => 
          user.location?.toLowerCase().includes(filters.location.toLowerCase())
        );
      }

      console.log('Filtered search results:', filteredResults);
      return filteredResults;
    },
    enabled: !!query || Object.values(filters).some(f => f !== 'all' && f !== ''),
  });
}
