import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClubSubscription {
  id: string;
  club_id: string;
  tier_id: string;
  status: string;
  stripe_subscription_id?: string;
  current_period_start?: string;
  current_period_end?: string;
}

export interface ClubUsage {
  active_members: number;
  active_coaches: number;
  sessions_created: number;
  tracking_date: string;
}

export function useClubSubscription(clubId: string) {
  const [subscription, setSubscription] = useState<ClubSubscription | null>(null);
  const [usage, setUsage] = useState<ClubUsage | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!clubId) return;

    try {
      const { data, error } = await supabase
        .from('club_subscriptions')
        .select('*')
        .eq('club_id', clubId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // Mock subscription for development - default to community tier
      setSubscription({
        id: 'mock-sub',
        club_id: clubId,
        tier_id: 'community',
        status: 'active',
        stripe_subscription_id: 'sub_mock'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    try {
      const { data, error } = await supabase
        .from('club_usage_tracking')
        .select('*')
        .eq('club_id', clubId)
        .order('tracking_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUsage(data);
    } catch (error) {
      console.error('Error fetching usage:', error);
      // Mock usage data
      setUsage({
        active_members: 5,
        active_coaches: 2,
        sessions_created: 12,
        tracking_date: new Date().toISOString()
      });
    }
  };

  const updateUsageTracking = async () => {
    try {
      await supabase.functions.invoke('update-club-usage', {
        body: { club_id: clubId }
      });
      await fetchUsage();
    } catch (error) {
      console.error('Error updating usage:', error);
    }
  };

  const createSubscription = async (tierId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-club-subscription', {
        body: { club_id: clubId, tier_id: tierId }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to create subscription');
    }
  };

  const upgradeSubscription = async (tierId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('upgrade-club-subscription', {
        body: { club_id: clubId, tier_id: tierId }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast.error('Failed to upgrade subscription');
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('club-customer-portal', {
        body: { club_id: clubId }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open customer portal');
    }
  };

  useEffect(() => {
    fetchSubscription();
    fetchUsage();
  }, [clubId]);

  return { 
    subscription, 
    usage, 
    loading, 
    updateUsageTracking,
    createSubscription,
    upgradeSubscription,
    openCustomerPortal
  };
}