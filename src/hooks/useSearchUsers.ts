
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
  experience_years?: number;
  coaching_focus?: string;
  match_percentage?: number;
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
            // Get player profile data - use 'preferred_play_style' instead of 'playing_style'
            const { data: playerProfiles } = await supabase
              .from('player_profiles')
              .select('id, skill_level, location, bio, preferred_play_style')
              .in('id', playerIds);

            // Get player XP data
            const { data: playerXP } = await supabase
              .from('player_xp')
              .select('player_id, current_level')
              .in('player_id', playerIds);

            // Merge the data for players
            const playerResults: SearchResult[] = profiles
              .filter(p => p.role === 'player')
              .map(profile => {
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
                  playing_style: playerProfile?.preferred_play_style,
                  match_percentage: Math.floor(Math.random() * 40) + 60
                };
              });

            // Apply filters for players
            let filteredResults = playerResults;

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

        // For coaches, get additional data from coach_profiles
        if (userType === 'coach' || userType === 'all') {
          const coachIds = profiles
            .filter(p => p.role === 'coach')
            .map(p => p.id);

          if (coachIds.length > 0) {
            // Get coach profile data
            const { data: coachProfiles } = await supabase
              .from('coach_profiles')
              .select('id, coaching_focus, experience_years, location, bio')
              .in('id', coachIds);

            // Merge the data for coaches
            const coachResults: SearchResult[] = profiles
              .filter(p => p.role === 'coach')
              .map(profile => {
                const coachProfile = coachProfiles?.find(cp => cp.id === profile.id);

                return {
                  id: profile.id,
                  full_name: profile.full_name,
                  avatar_url: profile.avatar_url,
                  role: profile.role,
                  coaching_focus: coachProfile?.coaching_focus,
                  experience_years: coachProfile?.experience_years,
                  location: coachProfile?.location,
                  bio: coachProfile?.bio,
                  match_percentage: Math.floor(Math.random() * 40) + 60
                };
              });

            // Apply filters for coaches
            let filteredResults = coachResults;

            if (filters.coachingFocus && filters.coachingFocus !== 'all') {
              filteredResults = filteredResults.filter(r => r.coaching_focus === filters.coachingFocus);
            }

            if (filters.location) {
              filteredResults = filteredResults.filter(r => 
                r.location?.toLowerCase().includes(filters.location.toLowerCase())
              );
            }

            return filteredResults;
          }
        }

        // For mixed results or when no additional data is needed
        return profiles.map(profile => ({
          id: profile.id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          role: profile.role,
          match_percentage: Math.floor(Math.random() * 40) + 60
        })) as SearchResult[];

      } catch (error) {
        console.error('Error in useSearchUsers:', error);
        return [];
      }
    },
    enabled: query.length >= 2
  });
}
