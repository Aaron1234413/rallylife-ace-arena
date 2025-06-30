
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PerformanceBooster {
  id: string;
  name: string;
  description: string;
  token_price: number;
  effect_type: 'match' | 'training' | 'social' | 'recovery' | 'coaching';
  effect_data: any;
  cooldown_hours: number;
  icon_name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  is_active: boolean;
  created_at: string;
}

export interface UserPerformanceBooster {
  id: string;
  user_id: string;
  booster_id: string;
  purchased_at: string;
  expires_at: string | null;
  used_at: string | null;
  is_active: boolean;
  effect_applied: boolean;
  performance_boosters: PerformanceBooster;
}

export interface BoosterCooldown {
  id: string;
  user_id: string;
  booster_id: string;
  last_purchased_at: string;
  cooldown_expires_at: string;
  created_at: string;
}

export function usePerformanceBoosters() {
  const queryClient = useQueryClient();

  // Get all available boosters
  const { data: boosters = [], isLoading: boostersLoading } = useQuery({
    queryKey: ['performance-boosters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_boosters')
        .select('*')
        .eq('is_active', true)
        .order('rarity', { ascending: false })
        .order('token_price', { ascending: true });

      if (error) throw error;
      return data as PerformanceBooster[];
    },
  });

  // Get user's owned boosters
  const { data: userBoosters = [], isLoading: userBoostersLoading } = useQuery({
    queryKey: ['user-performance-boosters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_performance_boosters')
        .select(`
          *,
          performance_boosters (*)
        `)
        .eq('is_active', true)
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      return data as UserPerformanceBooster[];
    },
  });

  // Get user's cooldowns
  const { data: cooldowns = [], isLoading: cooldownsLoading } = useQuery({
    queryKey: ['booster-cooldowns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booster_cooldowns')
        .select('*')
        .gt('cooldown_expires_at', new Date().toISOString());

      if (error) throw error;
      return data as BoosterCooldown[];
    },
  });

  // Purchase booster mutation
  const purchaseBoosterMutation = useMutation({
    mutationFn: async ({ boosterId, tokenPrice }: { boosterId: string; tokenPrice: number }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Check if user has enough tokens
      const { data: tokenData } = await supabase
        .from('token_balances')
        .select('regular_tokens')
        .eq('player_id', user.user.id)
        .single();

      if (!tokenData || tokenData.regular_tokens < tokenPrice) {
        throw new Error('Insufficient tokens');
      }

      // Check cooldown
      const { data: cooldownData } = await supabase
        .from('booster_cooldowns')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('booster_id', boosterId)
        .gt('cooldown_expires_at', new Date().toISOString())
        .single();

      if (cooldownData) {
        throw new Error('Booster is on cooldown');
      }

      // Start transaction - spend tokens
      const { error: spendError } = await supabase.rpc('spend_tokens', {
        user_id: user.user.id,
        amount: tokenPrice,
        token_type: 'regular',
        source: 'performance_booster',
        description: 'Performance booster purchase'
      });

      if (spendError) throw spendError;

      // Add booster to user's inventory
      const { data: userBooster, error: boosterError } = await supabase
        .from('user_performance_boosters')
        .insert({
          user_id: user.user.id,
          booster_id: boosterId
        })
        .select()
        .single();

      if (boosterError) throw boosterError;

      // Add cooldown
      const cooldownExpiry = new Date();
      const { data: boosterData } = await supabase
        .from('performance_boosters')
        .select('cooldown_hours')
        .eq('id', boosterId)
        .single();

      if (boosterData) {
        cooldownExpiry.setHours(cooldownExpiry.getHours() + boosterData.cooldown_hours);
      }

      await supabase
        .from('booster_cooldowns')
        .insert({
          user_id: user.user.id,
          booster_id: boosterId,
          last_purchased_at: new Date().toISOString(),
          cooldown_expires_at: cooldownExpiry.toISOString()
        });

      return userBooster;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-performance-boosters'] });
      queryClient.invalidateQueries({ queryKey: ['booster-cooldowns'] });
      queryClient.invalidateQueries({ queryKey: ['player-tokens'] });
      toast.success('Performance booster purchased successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to purchase booster');
    },
  });

  // Use booster mutation
  const useBoosterMutation = useMutation({
    mutationFn: async (userBoosterId: string) => {
      const { error } = await supabase
        .from('user_performance_boosters')
        .update({
          used_at: new Date().toISOString(),
          effect_applied: true
        })
        .eq('id', userBoosterId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-performance-boosters'] });
      toast.success('Booster activated!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to activate booster');
    },
  });

  return {
    boosters,
    userBoosters,
    cooldowns,
    loading: boostersLoading || userBoostersLoading || cooldownsLoading,
    purchaseBooster: purchaseBoosterMutation.mutate,
    purchaseLoading: purchaseBoosterMutation.isPending,
    useBooster: useBoosterMutation.mutate,
    useBoosterLoading: useBoosterMutation.isPending,
  };
}
