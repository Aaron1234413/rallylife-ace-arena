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
  };
  player_stats?: {
    current_level: number;
    current_hp: number;
    max_hp: number;
    total_xp_earned: number;
    last_activity: string;
    sessions_this_week: number;
  };
}

export function useCoachClients() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['coach-clients', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // For now, return mock data since we need actual coach-player relationships
      // In a real implementation, coaches would send invitations to players
      const mockClients = [
        {
          id: '1',
          player_id: 'mock-player-1',
          coach_id: user.id,
          relationship_type: 'coaching',
          status: 'active',
          created_at: new Date().toISOString(),
          player_profile: {
            id: 'mock-player-1',
            full_name: 'Sarah Johnson',
            avatar_url: null
          },
          player_stats: {
            current_level: 15,
            current_hp: 85,
            max_hp: 100,
            total_xp_earned: 1500,
            last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            sessions_this_week: 3
          }
        },
        {
          id: '2',
          player_id: 'mock-player-2',
          coach_id: user.id,
          relationship_type: 'coaching',
          status: 'active',
          created_at: new Date().toISOString(),
          player_profile: {
            id: 'mock-player-2',
            full_name: 'Mike Chen',
            avatar_url: null
          },
          player_stats: {
            current_level: 8,
            current_hp: 92,
            max_hp: 100,
            total_xp_earned: 800,
            last_activity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            sessions_this_week: 2
          }
        },
        {
          id: '3',
          player_id: 'mock-player-3',
          coach_id: user.id,
          relationship_type: 'coaching',
          status: 'premium',
          created_at: new Date().toISOString(),
          player_profile: {
            id: 'mock-player-3',
            full_name: 'Emma Davis',
            avatar_url: null
          },
          player_stats: {
            current_level: 22,
            current_hp: 100,
            max_hp: 100,
            total_xp_earned: 2200,
            last_activity: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            sessions_this_week: 4
          }
        }
      ];

      return mockClients;
    },
    enabled: !!user,
  });

  const sendInvitationMutation = useMutation({
    mutationFn: async ({ playerEmail, message }: { playerEmail: string; message?: string }) => {
      const { data, error } = await supabase.rpc('send_coach_invitation', {
        player_email_param: playerEmail,
        message_param: message
      });

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
    sendInvitation: sendInvitationMutation.mutate,
    isSendingInvitation: sendInvitationMutation.isPending
  };
}