import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ActivityItem {
  id: string;
  type: 'cxp' | 'token' | 'crp' | 'assignment' | 'appointment' | 'challenge';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
  player_name?: string;
  reward_amount?: number;
}

export function useCoachRecentActivity() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['coach-recent-activity', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const activities: ActivityItem[] = [];

      // Get recent CXP activities
      const { data: cxpActivities } = await supabase
        .from('cxp_activities')
        .select(`
          *,
          source_player:profiles!cxp_activities_source_player_id_fkey(full_name)
        `)
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (cxpActivities) {
        activities.push(...cxpActivities.map(activity => ({
          id: `cxp-${activity.id}`,
          type: 'cxp' as const,
          title: `Earned ${activity.cxp_earned} CXP`,
          description: activity.description || activity.activity_type,
          timestamp: activity.created_at,
          player_name: activity.source_player?.full_name,
          reward_amount: activity.cxp_earned,
          metadata: activity.metadata
        })));
      }

      // Get recent token transactions
      const { data: tokenTransactions } = await supabase
        .from('coach_token_transactions')
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (tokenTransactions) {
        activities.push(...tokenTransactions.map(transaction => ({
          id: `token-${transaction.id}`,
          type: 'token' as const,
          title: `${transaction.transaction_type === 'earn' ? 'Earned' : 'Spent'} ${transaction.amount} CTK`,
          description: transaction.description || `Token ${transaction.transaction_type}`,
          timestamp: transaction.created_at,
          reward_amount: transaction.amount,
          metadata: transaction.metadata
        })));
      }

      // Get recent CRP activities
      const { data: crpActivities } = await supabase
        .from('crp_activities')
        .select(`
          *,
          source_player:profiles!crp_activities_source_player_id_fkey(full_name)
        `)
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (crpActivities) {
        activities.push(...crpActivities.map(activity => ({
          id: `crp-${activity.id}`,
          type: 'crp' as const,
          title: `${activity.crp_change > 0 ? 'Gained' : 'Lost'} ${Math.abs(activity.crp_change)} CRP`,
          description: activity.description || activity.activity_type,
          timestamp: activity.created_at,
          player_name: activity.source_player?.full_name,
          reward_amount: activity.crp_change,
          metadata: activity.metadata
        })));
      }

      // Get recent training assignments
      const { data: assignments } = await supabase
        .from('player_training_assignments')
        .select(`
          *,
          training_plans(name),
          player_profiles:profiles!player_training_assignments_player_id_fkey(full_name)
        `)
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (assignments) {
        activities.push(...assignments.map(assignment => ({
          id: `assignment-${assignment.id}`,
          type: 'assignment' as const,
          title: assignment.status === 'completed' ? 'Training completed' : 'Training assigned',
          description: assignment.training_plans?.name || 'Training plan',
          timestamp: assignment.status === 'completed' ? assignment.completed_at : assignment.created_at,
          player_name: assignment.player_profiles?.full_name,
          metadata: assignment
        })));
      }

      // Sort all activities by timestamp
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
    },
    enabled: !!user,
  });
}