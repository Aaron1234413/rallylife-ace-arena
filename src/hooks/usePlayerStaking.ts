import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlayerStake {
  id: string;
  club_id: string;
  staker_id: string;
  target_player_id: string;
  stake_type: string;
  stake_amount_tokens: number;
  odds_multiplier: number;
  stake_status: string;
  description: string;
  expires_at?: string;
  resolved_at?: string;
  payout_amount: number;
  created_at: string;
  updated_at: string;
  // Joined data
  staker_name?: string;
  staker_avatar?: string;
  target_player_name?: string;
  target_player_avatar?: string;
}

export function usePlayerStaking(clubId: string) {
  const [activeStakes, setActiveStakes] = useState<PlayerStake[]>([]);
  const [myStakes, setMyStakes] = useState<PlayerStake[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveStakes = async () => {
    if (!clubId) return;

    try {
      const { data, error } = await supabase
        .from('player_stakes')
        .select('*')
        .eq('club_id', clubId)
        .eq('stake_status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get names separately
      const stakesWithNames = await Promise.all(
        (data || []).map(async (stake) => {
          const [stakerProfile, targetProfile] = await Promise.all([
            supabase.from('profiles').select('full_name, avatar_url').eq('id', stake.staker_id).single(),
            supabase.from('profiles').select('full_name, avatar_url').eq('id', stake.target_player_id).single()
          ]);

          return {
            ...stake,
            staker_name: stakerProfile.data?.full_name || 'Unknown',
            staker_avatar: stakerProfile.data?.avatar_url,
            target_player_name: targetProfile.data?.full_name || 'Unknown',
            target_player_avatar: targetProfile.data?.avatar_url
          };
        })
      );

      setActiveStakes(stakesWithNames);
    } catch (error) {
      console.error('Error fetching active stakes:', error);
      toast.error('Failed to load active stakes');
    }
  };

  const fetchMyStakes = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data, error } = await supabase
        .from('player_stakes')
        .select('*')
        .eq('club_id', clubId)
        .eq('staker_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get target player names separately
      const stakesWithNames = await Promise.all(
        (data || []).map(async (stake) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', stake.target_player_id)
            .single();

          return {
            ...stake,
            target_player_name: profileData?.full_name || 'Unknown',
            target_player_avatar: profileData?.avatar_url
          };
        })
      );

      setMyStakes(stakesWithNames);
    } catch (error) {
      console.error('Error fetching my stakes:', error);
    }
  };

  const createStake = async (stakeData: {
    target_player_id: string;
    stake_type: string;
    stake_amount_tokens: number;
    odds_multiplier: number;
    description: string;
    expires_at?: Date;
  }): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('create_player_stake', {
        club_id_param: clubId,
        target_player_id_param: stakeData.target_player_id,
        stake_type_param: stakeData.stake_type,
        stake_amount_param: stakeData.stake_amount_tokens,
        odds_multiplier_param: stakeData.odds_multiplier,
        description_param: stakeData.description,
        expires_at_param: stakeData.expires_at?.toISOString()
      });

      if (error) throw error;

      toast.success('Stake created successfully');
      await fetchActiveStakes();
      await fetchMyStakes();
      return data;
    } catch (error) {
      console.error('Error creating stake:', error);
      toast.error('Failed to create stake');
      return null;
    }
  };

  const resolveStake = async (stakeId: string, outcomeWon: boolean): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('resolve_player_stake', {
        stake_id_param: stakeId,
        outcome_won: outcomeWon
      });

      if (error) throw error;

      const result = data as { outcome: string; payout_amount: number };
      toast.success(
        `Stake resolved: ${result.outcome}${result.payout_amount > 0 ? ` - Payout: ${result.payout_amount} tokens` : ''}`
      );
      
      await fetchActiveStakes();
      await fetchMyStakes();
      return true;
    } catch (error) {
      console.error('Error resolving stake:', error);
      toast.error('Failed to resolve stake');
      return false;
    }
  };

  const getStakeStats = () => {
    const totalStaked = activeStakes.reduce((sum, stake) => sum + stake.stake_amount_tokens, 0);
    const totalPotentialPayout = activeStakes.reduce(
      (sum, stake) => sum + Math.round(stake.stake_amount_tokens * stake.odds_multiplier), 0
    );
    
    const myTotalStaked = myStakes.reduce((sum, stake) => sum + stake.stake_amount_tokens, 0);
    const myWinnings = myStakes
      .filter(stake => stake.stake_status === 'won')
      .reduce((sum, stake) => sum + stake.payout_amount, 0);

    return {
      activeStakesCount: activeStakes.length,
      totalStaked,
      totalPotentialPayout,
      myTotalStaked,
      myWinnings,
      myActiveStakes: myStakes.filter(stake => stake.stake_status === 'active').length
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchActiveStakes(), fetchMyStakes()]);
      setLoading(false);
    };

    loadData();
  }, [clubId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!clubId) return;

    const channel = supabase
      .channel('player-stakes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'player_stakes',
          filter: `club_id=eq.${clubId}`
        },
        () => {
          fetchActiveStakes();
          fetchMyStakes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clubId]);

  return {
    activeStakes,
    myStakes,
    loading,
    createStake,
    resolveStake,
    getStakeStats,
    refetch: async () => {
      await Promise.all([fetchActiveStakes(), fetchMyStakes()]);
    }
  };
}