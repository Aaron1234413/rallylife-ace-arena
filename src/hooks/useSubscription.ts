import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface SubscriptionData {
  isSubscribed: boolean;
  tier: 'free' | 'pro' | 'premium';
  expiresAt?: string;
  features: {
    maxClubs: number;
    maxSessions: number;
    premiumFeatures: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
  };
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    isSubscribed: false,
    tier: 'free',
    features: {
      maxClubs: 1,
      maxSessions: 5,
      premiumFeatures: false,
      advancedAnalytics: false,
      prioritySupport: false
    }
  });
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Subscription check error:', error);
        return;
      }

      if (data?.subscribed) {
        const tier = data.subscription_tier?.toLowerCase() || 'pro';
        setSubscription({
          isSubscribed: true,
          tier: tier as 'pro' | 'premium',
          expiresAt: data.subscription_end,
          features: getFeaturesByTier(tier)
        });
      } else {
        setSubscription({
          isSubscribed: false,
          tier: 'free',
          features: getFeaturesByTier('free')
        });
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFeaturesByTier = (tier: string) => {
    switch (tier) {
      case 'premium':
        return {
          maxClubs: -1, // unlimited
          maxSessions: -1, // unlimited
          premiumFeatures: true,
          advancedAnalytics: true,
          prioritySupport: true
        };
      case 'pro':
        return {
          maxClubs: 5,
          maxSessions: 50,
          premiumFeatures: true,
          advancedAnalytics: true,
          prioritySupport: false
        };
      default:
        return {
          maxClubs: 1,
          maxSessions: 5,
          premiumFeatures: false,
          advancedAnalytics: false,
          prioritySupport: false
        };
    }
  };

  const createCheckoutSession = async (priceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to create checkout session');
    }
  };

  const manageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open customer portal');
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  return {
    subscription,
    loading,
    checkSubscription,
    createCheckoutSession,
    manageSubscription
  };
}