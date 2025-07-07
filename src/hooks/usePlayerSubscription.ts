import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface PlayerSubscription {
  id: string;
  player_id: string;
  plan_type: 'free' | 'premium' | 'pro';
  monthly_token_allocation: number;
  max_clubs_allowed: number;
  status: 'active' | 'cancelled' | 'past_due';
  stripe_subscription_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
  updated_at: string;
}

const PLAN_CONFIGS = {
  free: { tokens: 500, clubs: 1, price: 0 },
  premium: { tokens: 2500, clubs: 3, price: 4.99 },
  pro: { tokens: 6000, clubs: 5, price: 9.99 }
};

export function usePlayerSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<PlayerSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('player_subscriptions')
        .select('*')
        .eq('player_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return;
      }

      if (data) {
        setSubscription(data as PlayerSubscription);
      } else {
        // Create default free subscription
        await createFreeSubscription();
      }
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFreeSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('player_subscriptions')
        .insert({
          player_id: user.id,
          plan_type: 'free',
          monthly_token_allocation: PLAN_CONFIGS.free.tokens,
          max_clubs_allowed: PLAN_CONFIGS.free.clubs,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      setSubscription(data as PlayerSubscription);
    } catch (error) {
      console.error('Error creating free subscription:', error);
    }
  };

  const createSubscription = async (planType: 'premium' | 'pro') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-player-subscription', {
        body: { 
          plan_type: planType,
          monthly_token_allocation: PLAN_CONFIGS[planType].tokens,
          max_clubs_allowed: PLAN_CONFIGS[planType].clubs
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to create subscription');
    }
  };

  const cancelSubscription = async () => {
    try {
      const { error } = await supabase.functions.invoke('cancel-player-subscription');
      
      if (error) throw error;
      
      await fetchSubscription();
      toast.success('Subscription cancelled successfully');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('player-customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open customer portal');
    }
  };

  const getPlanConfig = (planType: 'free' | 'premium' | 'pro') => {
    return PLAN_CONFIGS[planType];
  };

  const canJoinMoreClubs = () => {
    if (!subscription) return false;
    // This would need to check actual club count
    return true; // Placeholder
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  return {
    subscription,
    loading,
    createSubscription,
    cancelSubscription,
    openCustomerPortal,
    getPlanConfig,
    canJoinMoreClubs,
    refetch: fetchSubscription
  };
}