import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ClubTokenAnalytics, MonthlyUsage, RedemptionByService, MemberTokenActivity } from '@/types/clubAnalytics';
import { toast } from 'sonner';

export const useClubAnalytics = (clubId: string) => {
  const [analytics, setAnalytics] = useState<ClubTokenAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch current token pool
      const { data: currentPool, error: poolError } = await supabase
        .from('club_token_pools')
        .select('*')
        .eq('club_id', clubId)
        .eq('month_year', new Date().toISOString().slice(0, 7))
        .single();

      if (poolError && poolError.code !== 'PGRST116') {
        throw poolError;
      }

      // Fetch monthly usage trend (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data: monthlyPools, error: monthlyError } = await supabase
        .from('club_token_pools')
        .select('*')
        .eq('club_id', clubId)
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('month_year', { ascending: true });

      if (monthlyError) throw monthlyError;

      const monthlyUsage: MonthlyUsage[] = (monthlyPools || []).map(pool => ({
        month: pool.month_year,
        allocated: pool.allocated_tokens,
        used: pool.used_tokens,
        purchased: pool.purchased_tokens,
        rollover: pool.rollover_tokens,
        efficiency_percentage: pool.allocated_tokens > 0 
          ? Math.round((pool.used_tokens / pool.allocated_tokens) * 100)
          : 0
      }));

      // Mock redemption breakdown (would come from transaction logs in real implementation)
      const redemptionBreakdown: RedemptionByService[] = [
        {
          service_type: 'court_booking',
          service_name: 'Court Bookings',
          tokens_redeemed: 1250,
          transaction_count: 45,
          percentage_of_total: 62.5,
          average_per_transaction: 28
        },
        {
          service_type: 'coaching',
          service_name: 'Coaching Sessions',
          tokens_redeemed: 480,
          transaction_count: 12,
          percentage_of_total: 24.0,
          average_per_transaction: 40
        },
        {
          service_type: 'events',
          service_name: 'Events & Tournaments',
          tokens_redeemed: 200,
          transaction_count: 8,
          percentage_of_total: 10.0,
          average_per_transaction: 25
        },
        {
          service_type: 'food_beverage',
          service_name: 'Food & Beverages',
          tokens_redeemed: 70,
          transaction_count: 15,
          percentage_of_total: 3.5,
          average_per_transaction: 5
        }
      ];

      // Mock member activity (would come from transaction logs in real implementation)
      const memberActivity: MemberTokenActivity[] = [
        {
          member_id: '1',
          member_name: 'John Smith',
          total_redeemed: 340,
          last_activity: '2024-01-07',
          favorite_service: 'Court Bookings',
          monthly_spending: 340,
          spending_limit: 500
        },
        {
          member_id: '2',
          member_name: 'Sarah Johnson',
          total_redeemed: 280,
          last_activity: '2024-01-06',
          favorite_service: 'Coaching Sessions',
          monthly_spending: 280,
          spending_limit: 400
        },
        {
          member_id: '3',
          member_name: 'Mike Wilson',
          total_redeemed: 195,
          last_activity: '2024-01-05',
          favorite_service: 'Court Bookings',
          monthly_spending: 195
        }
      ];

      // Calculate financial offset (tokens * $0.007 per token)
      const totalTokensUsed = currentPool?.used_tokens || 0;
      const financialOffset = totalTokensUsed * 0.007;

      const analyticsData: ClubTokenAnalytics = {
        current_pool: currentPool || {
          id: '',
          club_id: clubId,
          month_year: new Date().toISOString().slice(0, 7),
          allocated_tokens: 0,
          rollover_tokens: 0,
          purchased_tokens: 0,
          used_tokens: 0,
          overdraft_tokens: 0,
          expires_at: '',
          created_at: '',
          updated_at: ''
        },
        monthly_usage_trend: monthlyUsage,
        redemption_breakdown: redemptionBreakdown,
        member_activity: memberActivity,
        financial_offset: financialOffset
      };

      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error fetching club analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      toast.error('Failed to load club analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) {
      fetchAnalytics();
    }
  }, [clubId]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
};