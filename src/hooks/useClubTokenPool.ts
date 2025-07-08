import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClubTokenPool {
  id: string;
  club_id: string;
  month_year: string;
  allocated_tokens: number; // Monthly allocation based on plan
  used_tokens: number; // Redeemed by members
  overdraft_tokens: number; // Negative balance (Pro plan only)
  purchased_tokens: number; // Additional token purchases
  rollover_tokens: number; // From previous month (Plus/Pro)
  expires_at?: string;
  created_at: string;
  updated_at: string;
  // Calculated fields
  available_balance?: number; // Calculated field
  can_redeem?: boolean; // Based on pool + overdraft
}

export interface TokenRedemption {
  id: string;
  club_id: string;
  player_id: string;
  service_type: string;
  service_details: any;
  tokens_used: number;
  cash_amount: number;
  total_service_value: number;
  redemption_percentage: number;
  created_at: string;
}

export function useClubTokenPool(clubId: string) {
  const [currentPool, setCurrentPool] = useState<ClubTokenPool | null>(null);
  const [redemptions, setRedemptions] = useState<TokenRedemption[]>([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

  const fetchTokenPool = async () => {
    if (!clubId) return;

    try {
      // Fetch current month's pool
      const { data: poolData, error: poolError } = await supabase
        .from('club_token_pools')
        .select('*')
        .eq('club_id', clubId)
        .eq('month_year', currentMonth)
        .single();

      if (poolError && poolError.code !== 'PGRST116') {
        console.error('Error fetching token pool:', poolError);
      } else if (poolData) {
        setCurrentPool(poolData);
      } else {
        // Initialize pool if it doesn't exist
        await initializeMonthlyPool();
      }

      // Fetch recent redemptions
      const { data: redemptionData, error: redemptionError } = await supabase
        .from('token_redemptions')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (redemptionError) {
        console.error('Error fetching redemptions:', redemptionError);
      } else {
        setRedemptions(redemptionData || []);
      }
    } catch (error) {
      console.error('Error in fetchTokenPool:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeMonthlyPool = async () => {
    try {
      const { error } = await supabase.rpc('initialize_monthly_token_pool', {
        club_id_param: clubId,
        month_year_param: currentMonth
      });

      if (error) throw error;
      
      // Refetch after initialization
      await fetchTokenPool();
    } catch (error) {
      console.error('Error initializing monthly pool:', error);
    }
  };

  const checkTokenAvailability = async (requestedTokens: number): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_token_availability', {
        club_id_param: clubId,
        requested_tokens: requestedTokens
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking token availability:', error);
      return false;
    }
  };

  const processTokenRedemption = async (
    playerId: string,
    serviceType: string,
    serviceDetails: any,
    tokensToUse: number,
    cashAmount: number,
    totalServiceValue: number
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('process_token_redemption', {
        club_id_param: clubId,
        player_id_param: playerId,
        service_type_param: serviceType,
        service_details_param: serviceDetails,
        tokens_to_use: tokensToUse,
        cash_amount_param: cashAmount,
        total_service_value_param: totalServiceValue
      });

      if (error) throw error;

      if (data) {
        toast.success('Token redemption successful');
        await fetchTokenPool(); // Refresh data
        return true;
      } else {
        toast.error('Insufficient tokens available');
        return false;
      }
    } catch (error) {
      console.error('Error processing token redemption:', error);
      toast.error('Failed to process token redemption');
      return false;
    }
  };

  const purchaseTokens = async (tokenAmount: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('purchase-club-tokens', {
        body: {
          club_id: clubId,
          token_amount: tokenAmount
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new window
        window.open(data.url, '_blank');
        toast.success('Redirecting to Stripe for payment...');
      }
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      toast.error('Failed to initiate token purchase');
    }
  };

  const getAvailableTokens = () => {
    if (!currentPool) return 0;
    
    return currentPool.allocated_tokens + 
           currentPool.rollover_tokens + 
           currentPool.purchased_tokens - 
           currentPool.used_tokens;
  };

  const getTokenPoolStats = () => {
    if (!currentPool) {
      return {
        totalAllocated: 0,
        totalUsed: 0,
        totalAvailable: 0,
        usagePercentage: 0,
        monthlySpend: 0
      };
    }

    const totalAllocated = currentPool.allocated_tokens + currentPool.rollover_tokens + currentPool.purchased_tokens;
    const totalUsed = currentPool.used_tokens;
    const totalAvailable = totalAllocated - totalUsed;
    const usagePercentage = totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0;
    const monthlySpend = redemptions
      .filter(r => r.created_at.startsWith(currentMonth))
      .reduce((sum, r) => sum + r.cash_amount, 0);

    return {
      totalAllocated,
      totalUsed,
      totalAvailable,
      usagePercentage,
      monthlySpend
    };
  };

  useEffect(() => {
    fetchTokenPool();
  }, [clubId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!clubId) return;

    const channel = supabase
      .channel('club-token-pool-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'club_token_pools',
          filter: `club_id=eq.${clubId}`
        },
        () => fetchTokenPool()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'token_redemptions',
          filter: `club_id=eq.${clubId}`
        },
        () => fetchTokenPool()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clubId]);

  return {
    currentPool,
    redemptions,
    loading,
    checkTokenAvailability,
    processTokenRedemption,
    purchaseTokens,
    getAvailableTokens,
    getTokenPoolStats,
    refetch: fetchTokenPool
  };
}