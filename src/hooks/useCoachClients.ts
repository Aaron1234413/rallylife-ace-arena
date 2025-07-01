import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface CoachClient {
  id: string;
  player_id: string;
  coach_id: string;
  relationship_type: string;
  status: string;
  created_at: string;
  player_profile: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email?: string;
  };
  player_stats?: {
    current_level: number;
    current_hp: number;
    max_hp: number;
    total_xp_earned: number;
    last_activity: string;
  };
}

export function useCoachClients() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['coach-clients', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // Get coach-player relationships
      const { data: relationships, error: relError } = await supabase
        .from('coach_player_relationships')
        .select(`
          *,
          player_profile:profiles!coach_player_relationships_player_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('coach_id', user.id)
        .eq('status', 'active');

      if (relError) throw relError;

      // Get additional player stats for each client
      const clientsWithStats = await Promise.all(
        (relationships || []).map(async (rel) => {
          // Get player XP data
          const { data: xpData } = await supabase
            .from('player_xp')
            .select('current_level, total_xp_earned')
            .eq('player_id', rel.player_id)
            .single();

          // Get player HP data
          const { data: hpData } = await supabase
            .from('player_hp')
            .select('current_hp, max_hp, last_activity')
            .eq('player_id', rel.player_id)
            .single();

          // Get recent activity count
          const { count: recentSessions } = await supabase
            .from('activity_logs')
            .select('*', { count: 'exact', head: true })
            .eq('player_id', rel.player_id)
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

          return {
            ...rel,
            player_stats: {
              current_level: xpData?.current_level || 1,
              current_hp: hpData?.current_hp || 100,
              max_hp: hpData?.max_hp || 100,
              total_xp_earned: xpData?.total_xp_earned || 0,
              last_activity: hpData?.last_activity || new Date().toISOString(),
              sessions_this_week: recentSessions || 0
            }
          };
        })
      );

      return clientsWithStats as CoachClient[];
    },
    enabled: !!user,
  });

  const addClientMutation = useMutation({
    mutationFn: async (playerId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('coach_player_relationships')
        .insert({
          coach_id: user.id,
          player_id: playerId,
          relationship_type: 'coaching',
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-clients'] });
    }
  });

  return {
    clients: clients || [],
    isLoading,
    error,
    addClient: addClientMutation.mutate,
    isAddingClient: addClientMutation.isPending
  };
}