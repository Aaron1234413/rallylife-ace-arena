
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useCoachingChallenges() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['coaching-challenges'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('coaching_challenges')
        .select(`
          *,
          coach_profiles:profiles!coach_id(full_name, avatar_url),
          player_profiles:profiles!player_id(full_name, avatar_url)
        `)
        .or(`coach_id.eq.${user.id},player_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
}

export function useCreateCoachingChallenge() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      playerId,
      challengeType,
      title,
      description,
      targetValue,
      dueDate,
      rewardXp,
      rewardTokens
    }: {
      playerId: string;
      challengeType: string;
      title: string;
      description: string;
      targetValue: number;
      dueDate?: string;
      rewardXp?: number;
      rewardTokens?: number;
    }) => {
      const { data, error } = await supabase.rpc('create_coaching_challenge', {
        player_user_id: playerId,
        challenge_type: challengeType,
        title,
        description,
        target_value: targetValue,
        due_date: dueDate,
        reward_xp: rewardXp,
        reward_tokens: rewardTokens
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['coach-cxp'] });
    }
  });
}
