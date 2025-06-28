
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  skill_level?: string;
  current_level?: number;
  location?: string;
  bio?: string;
  playing_style?: string;
}

export interface SearchFilters {
  level: string;
  location: string;
  skillLevel: string;
  coachingFocus: string;
}

export interface UseSearchUsersParams {
  query: string;
  userType: 'player' | 'coach' | 'all';
  filters: SearchFilters;
}

export function useSearchUsers({ query, userType, filters }: UseSearchUsersParams) {
  return useQuery({
    queryKey: ['searchUsers', query, userType, filters],
    queryFn: async () => {
      if (!query || query.length < 2) {
        return [];
      }

      try {
        // Base query for profiles
        let profileQuery = supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            avatar_url,
            role
          `)
          .ilike('full_name', `%${query}%`);

        // Filter by user type
        if (userType !== 'all') {
          profileQuery = profileQuery.eq('role', userType);
        }

        const { data: profiles, error: profileError } = await profileQuery;

        if (profileError) {
          console.error('Error fetching profiles:', profileError);
          return [];
        }

        if (!profiles || profiles.length === 0) {
          return [];
        }

        // For players, get additional data from player_profiles and player_xp
        if (userType === 'player' || userType === 'all') {
          const playerIds = profiles
            .filter(p => p.role === 'player')
            .map(p => p.id);

          if (playerIds.length > 0) {
            // Get player profile data
            const { data: playerProfiles } = await supabase
              .from('player_profiles')
              .select('id, skill_level, location, bio, playing_style')
              .in('id', playerIds);

            // Get player XP data
            const { data: playerXP } = await supabase
              .from('player_xp')
              .select('player_id, current_level')
              .in('player_id', playerIds);

            // Merge the data
            const results: SearchResult[] = profiles.map(profile => {
              const playerProfile = playerProfiles?.find(pp => pp.id === profile.id);
              const xpData = playerXP?.find(xp => xp.player_id === profile.id);

              return {
                id: profile.id,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                role: profile.role,
                skill_level: playerProfile?.skill_level,
                current_level: xpData?.current_level,
                location: playerProfile?.location,
                bio: playerProfile?.bio,
                playing_style: playerProfile?.playing_style
              };
            });

            // Apply filters
            let filteredResults = results;

            if (filters.skillLevel && filters.skillLevel !== 'all') {
              filteredResults = filteredResults.filter(r => r.skill_level === filters.skillLevel);
            }

            if (filters.location) {
              filteredResults = filteredResults.filter(r => 
                r.location?.toLowerCase().includes(filters.location.toLowerCase())
              );
            }

            return filteredResults;
          }
        }

        // For coaches or when no additional data is needed
        return profiles.map(profile => ({
          id: profile.id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          role: profile.role
        })) as SearchResult[];

      } catch (error) {
        console.error('Error in useSearchUsers:', error);
        return [];
      }
    },
    enabled: query.length >= 2
  });
}
