import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ClubSubscription {
  id: string;
  club_id: string;
  stripe_subscription_id: string | null;
  tier_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClubUsage {
  id: string;
  club_id: string;
  tracking_date: string;
  active_members: number;
  active_coaches: number;
  sessions_created: number;
  updated_at: string;
}

export function useClubSubscription(clubId: string) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<ClubSubscription | null>(null);
  const [usage, setUsage] = useState<ClubUsage | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user || !clubId) return;

    try {
      console.log('🏆 [SUBSCRIPTION] Fetching subscription for club:', clubId);
      
      const { data: subData, error: subError } = await supabase
        .from('club_subscriptions')
        .select('*')
        .eq('club_id', clubId)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        throw subError;
      }

      console.log('🏆 [SUBSCRIPTION] Subscription data:', subData);
      setSubscription(subData);

      // Fetch current usage
      const { data: usageData, error: usageError } = await supabase
        .from('club_usage_tracking')
        .select('*')
        .eq('club_id', clubId)
        .eq('tracking_date', new Date().toISOString().split('T')[0])
        .single();

      if (usageError && usageError.code !== 'PGRST116') {
        console.error('🏆 [SUBSCRIPTION] Usage error:', usageError);
      } else {
        console.log('🏆 [SUBSCRIPTION] Usage data:', usageData);
        setUsage(usageData);
      }

    } catch (error) {
      console.error('🏆 [SUBSCRIPTION] Error fetching subscription:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (tierId: string) => {
    if (!user || !clubId) {
      throw new Error('User or club not available');
    }

    try {
      console.log('🏆 [SUBSCRIPTION] Creating subscription for tier:', tierId);
      
      const { data, error } = await supabase.functions.invoke('create-club-subscription', {
        body: { clubId, tierId }
      });

      if (error) throw error;

      if (data?.checkoutUrl) {
        // Open Stripe checkout in a new tab
        window.open(data.checkoutUrl, '_blank');
        return data;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('🏆 [SUBSCRIPTION] Error creating subscription:', error);
      toast.error('Failed to create subscription');
      throw error;
    }
  };

  const upgradeSubscription = async (newTierId: string) => {
    if (!user || !clubId) {
      throw new Error('User or club not available');
    }

    try {
      console.log('🏆 [SUBSCRIPTION] Upgrading subscription to tier:', newTierId);
      
      const { data, error } = await supabase.functions.invoke('upgrade-club-subscription', {
        body: { clubId, newTierId }
      });

      if (error) throw error;

      toast.success(`Subscription upgraded to ${data.newTier} successfully!`);
      await fetchSubscription(); // Refresh data
      return data;
    } catch (error) {
      console.error('🏆 [SUBSCRIPTION] Error upgrading subscription:', error);
      toast.error('Failed to upgrade subscription');
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    if (!user || !clubId) {
      throw new Error('User or club not available');
    }

    try {
      console.log('🏆 [SUBSCRIPTION] Opening customer portal for club:', clubId);
      
      const { data, error } = await supabase.functions.invoke('club-customer-portal', {
        body: { clubId }
      });

      if (error) throw error;

      if (data?.portalUrl) {
        // Open customer portal in a new tab
        window.open(data.portalUrl, '_blank');
        return data;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('🏆 [SUBSCRIPTION] Error opening customer portal:', error);
      toast.error('Failed to open customer portal');
      throw error;
    }
  };

  const updateUsageTracking = async () => {
    if (!user || !clubId) return;

    try {
      console.log('🏆 [SUBSCRIPTION] Updating usage tracking for club:', clubId);
      
      const { error } = await supabase.rpc('update_club_usage_tracking', {
        club_id_param: clubId
      });

      if (error) throw error;

      await fetchSubscription(); // Refresh data
    } catch (error) {
      console.error('🏆 [SUBSCRIPTION] Error updating usage tracking:', error);
    }
  };

  useEffect(() => {
    if (user && clubId) {
      fetchSubscription();
    }
  }, [user, clubId]);

  return {
    subscription,
    usage,
    loading,
    createSubscription,
    upgradeSubscription,
    openCustomerPortal,
    updateUsageTracking,
    refetch: fetchSubscription
  };
}