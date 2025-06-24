
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface User {
  id: string;
  full_name: string;
  avatar_url: string | null;
  skill_level?: string;
  location?: string;
  current_level?: number;
}

export function useUserSearch(query: string) {
  const { user: currentUser } = useAuth();

  const result = useQuery({
    queryKey: ['user-search', query],
    queryFn: async () => {
      if (!query.trim() || query.length < 2) return [];
      
      console.log('Searching users with query:', query);
      
      let baseQuery = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          player_profiles (
            skill_level,
            location
          ),
          player_xp (
            current_level
          )
        `)
        .eq('role', 'player')
        .ilike('full_name', `%${query}%`)
        .limit(20);

      // Exclude current user from search results
      if (currentUser?.id) {
        baseQuery = baseQuery.neq('id', currentUser.id);
      }

      const { data, error } = await baseQuery;

      if (error) {
        console.error('User search error:', error);
        throw error;
      }

      console.log('User search results:', data);

      // Transform the results with explicit typing
      const transformedResults: User[] = (data || []).map((user: any) => {
        const playerProfile = Array.isArray(user.player_profiles) ? user.player_profiles[0] : null;
        const playerXP = Array.isArray(user.player_xp) ? user.player_xp[0] : null;
        
        return {
          id: user.id,
          full_name: user.full_name || 'Unknown User',
          avatar_url: user.avatar_url,
          skill_level: playerProfile?.skill_level,
          location: playerProfile?.location,
          current_level: playerXP?.current_level || 1
        };
      });

      return transformedResults;
    },
    enabled: !!query.trim() && query.length >= 2,
  });

  return {
    users: result.data || [],
    isLoading: result.isLoading,
    error: result.error
  };
}
