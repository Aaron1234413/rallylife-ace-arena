import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CoachSubscription {
  id: string;
  coach_id: string;
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
  free: { tokens: 1000, clubs: 1, price: 0 },
  premium: { tokens: 3500, clubs: 3, price: 7.99 },
  pro: { tokens: 8000, clubs: 5, price: 14.99 }
};

export function useCoachSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<CoachSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('coach_subscriptions')
        .select('*')
        .eq('coach_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return;
      }

      if (data) {
        setSubscription(data as CoachSubscription);
      } else {
        // Create default free subscription for coaches
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
        .from('coach_subscriptions')
        .insert({
          coach_id: user.id,
          plan_type: 'free',
          monthly_token_allocation: PLAN_CONFIGS.free.tokens,
          max_clubs_allowed: PLAN_CONFIGS.free.clubs,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      setSubscription(data as CoachSubscription);
    } catch (error) {
      console.error('Error creating free subscription:', error);
    }
  };

  const createSubscription = async (planType: 'premium' | 'pro') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-coach-subscription', {
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
      const { error } = await supabase.functions.invoke('cancel-coach-subscription');
      
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
      const { data, error } = await supabase.functions.invoke('coach-customer-portal');
      
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

  const canManageMoreClubs = () => {
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
    canManageMoreClubs,
    refetch: fetchSubscription
  };
}