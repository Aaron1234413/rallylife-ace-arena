import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TokenPoolData {
  monthly_allocation: number;
  current_balance: number;
  used_this_month: number;
  rollover_tokens: number;
  purchased_tokens: number;
  expires_at: string;
  month_year: string;
}

interface TokenUsageBreakdown {
  coaching_sessions: number;
  court_bookings: number;
  service_bookings: number;
  other: number;
}

export function useClubTokenPool(clubId: string) {
  const [tokenPoolData, setTokenPoolData] = useState<TokenPoolData | null>(null);
  const [usageBreakdown, setUsageBreakdown] = useState<TokenUsageBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clubId) {
      fetchTokenPoolData();
      fetchUsageBreakdown();
    }
  }, [clubId]);

  const fetchTokenPoolData = async () => {
    try {
      setLoading(true);
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

      // First, ensure the monthly token pool exists for current month
      await initializeMonthlyPoolIfNeeded(clubId, currentMonth);

      // Fetch the current month's token pool
      const { data: poolData, error: poolError } = await supabase
        .from('club_token_pools')
        .select('*')
        .eq('club_id', clubId)
        .eq('month_year', currentMonth)
        .single();

      if (poolError) throw poolError;

      if (poolData) {
        const current_balance = 
          (poolData.allocated_tokens || 0) + 
          (poolData.rollover_tokens || 0) + 
          (poolData.purchased_tokens || 0) - 
          (poolData.used_tokens || 0);

        setTokenPoolData({
          monthly_allocation: poolData.allocated_tokens || 0,
          current_balance: Math.max(0, current_balance),
          used_this_month: poolData.used_tokens || 0,
          rollover_tokens: poolData.rollover_tokens || 0,
          purchased_tokens: poolData.purchased_tokens || 0,
          expires_at: poolData.expires_at || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
          month_year: poolData.month_year
        });
      }
    } catch (err) {
      console.error('Error fetching token pool data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch token pool data');
      
      // Fallback to default free tier allocation
      setTokenPoolData({
        monthly_allocation: 5000, // Free tier allocation
        current_balance: 5000,
        used_this_month: 0,
        rollover_tokens: 0,
        purchased_tokens: 0,
        expires_at: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
        month_year: new Date().toISOString().slice(0, 7)
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageBreakdown = async () => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      // Fetch court bookings usage for this month
      const { data: courtBookings, error: courtError } = await supabase
        .from('club_court_bookings')
        .select('tokens_used')
        .eq('club_id', clubId)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      if (courtError) throw courtError;

      // Fetch coach bookings usage for this month
      const { data: coachBookings, error: coachError } = await supabase
        .from('coach_bookings')
        .select('total_cost_tokens')
        .eq('club_id', clubId)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      if (coachError) throw coachError;

      const court_bookings = courtBookings?.reduce((sum, booking) => sum + (booking.tokens_used || 0), 0) || 0;
      const coaching_sessions = coachBookings?.reduce((sum, booking) => sum + (booking.total_cost_tokens || 0), 0) || 0;
      
      // For now, we'll calculate other usage as the remainder
      const totalUsed = (tokenPoolData?.used_this_month || 0);
      const knownUsage = court_bookings + coaching_sessions;
      const other = Math.max(0, totalUsed - knownUsage);

      setUsageBreakdown({
        coaching_sessions,
        court_bookings,
        service_bookings: 0, // Will implement when services are connected
        other
      });

    } catch (err) {
      console.error('Error fetching usage breakdown:', err);
      setUsageBreakdown({
        coaching_sessions: 0,
        court_bookings: 0,
        service_bookings: 0,
        other: 0
      });
    }
  };

  const initializeMonthlyPoolIfNeeded = async (clubId: string, monthYear: string) => {
    try {
      // Check if pool already exists
      const { data: existingPool } = await supabase
        .from('club_token_pools')
        .select('id')
        .eq('club_id', clubId)
        .eq('month_year', monthYear)
        .single();

      if (!existingPool) {
        // Get club subscription to determine tier
        const { data: subscription } = await supabase
          .from('club_subscriptions')
          .select('tier_id')
          .eq('club_id', clubId)
          .eq('status', 'active')
          .single();

        // Set allocation based on tier (matching the subscription tiers)
        let allocation = 5000; // Default free tier
        if (subscription?.tier_id) {
          switch (subscription.tier_id) {
            case 'core':
              allocation = 50000;
              break;
            case 'plus':
              allocation = 150000;
              break;
            case 'pro':
              allocation = 300000;
              break;
            default:
              allocation = 5000; // community/free tier
          }
        }

        // Calculate rollover from previous month (for plus/pro plans)
        let rolloverTokens = 0;
        if (subscription?.tier_id === 'plus' || subscription?.tier_id === 'pro') {
          const previousMonth = new Date();
          previousMonth.setMonth(previousMonth.getMonth() - 1);
          const prevMonthYear = previousMonth.toISOString().slice(0, 7);

          const { data: prevPool } = await supabase
            .from('club_token_pools')
            .select('*')
            .eq('club_id', clubId)
            .eq('month_year', prevMonthYear)
            .single();

          if (prevPool) {
            const prevBalance = 
              (prevPool.allocated_tokens || 0) + 
              (prevPool.rollover_tokens || 0) + 
              (prevPool.purchased_tokens || 0) - 
              (prevPool.used_tokens || 0);
            
            // Cap rollover at 1x monthly allocation
            rolloverTokens = Math.min(Math.max(0, prevBalance), allocation);
          }
        }

        // Create the monthly pool
        const { error: insertError } = await supabase
          .from('club_token_pools')
          .insert({
            club_id: clubId,
            month_year: monthYear,
            allocated_tokens: allocation,
            rollover_tokens: rolloverTokens,
            used_tokens: 0,
            purchased_tokens: 0,
            expires_at: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
          });

        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Error initializing monthly token pool:', err);
    }
  };

  const refreshData = async () => {
    await fetchTokenPoolData();
    await fetchUsageBreakdown();
  };

  // Token management functions
  const checkTokenAvailability = (requiredTokens: number): boolean => {
    return (tokenPoolData?.current_balance || 0) >= requiredTokens;
  };

  const getAvailableTokens = (): number => {
    return tokenPoolData?.current_balance || 0;
  };

  const processTokenRedemption = async (tokensToUse: number, description: string = 'Token redemption') => {
    if (!checkTokenAvailability(tokensToUse)) {
      throw new Error('Insufficient tokens');
    }

    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Update the token pool usage
      const { error } = await supabase
        .from('club_token_pools')
        .update({ 
          used_tokens: (tokenPoolData?.used_this_month || 0) + tokensToUse 
        })
        .eq('club_id', clubId)
        .eq('month_year', currentMonth);

      if (error) throw error;

      // Refresh data after successful redemption
      await refreshData();
      
      return { success: true };
    } catch (err) {
      console.error('Error processing token redemption:', err);
      throw err;
    }
  };

  const purchaseTokens = async (tokenAmount: number) => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Update the token pool with purchased tokens
      const { error } = await supabase
        .from('club_token_pools')
        .update({ 
          purchased_tokens: (tokenPoolData?.purchased_tokens || 0) + tokenAmount 
        })
        .eq('club_id', clubId)
        .eq('month_year', currentMonth);

      if (error) throw error;

      // Refresh data after successful purchase
      await refreshData();
      
      return { success: true };
    } catch (err) {
      console.error('Error purchasing tokens:', err);
      throw err;
    }
  };

  // For backward compatibility with existing components
  const currentPool = tokenPoolData ? {
    current_balance: tokenPoolData.current_balance,
    monthly_allocation: tokenPoolData.monthly_allocation,
    used_this_month: tokenPoolData.used_this_month,
    allocated_tokens: tokenPoolData.monthly_allocation,
    used_tokens: tokenPoolData.used_this_month,
    overdraft_tokens: 0,
    purchased_tokens: tokenPoolData.purchased_tokens,
    rollover_tokens: tokenPoolData.rollover_tokens,
    month_year: tokenPoolData.month_year
  } : null;

  return {
    tokenPoolData,
    usageBreakdown,
    loading,
    error,
    refreshData,
    checkTokenAvailability,
    getAvailableTokens,
    processTokenRedemption,
    purchaseTokens,
    currentPool // For backward compatibility
  };
}