import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SubscriptionTier {
  id: string;
  name: string;
  price_monthly: number;
  member_limit: number;
  coach_limit: number;
  court_limit: number;
  token_allocation?: number;
  features: string[];
  created_at: string;
  updated_at: string;
}

export function useSubscriptionTiers() {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTiers = async () => {
    try {
      console.log('📊 [TIERS] Fetching subscription tiers...');
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      
      console.log('📊 [TIERS] Tiers fetched:', data?.length || 0);
      
      // Parse features JSON and ensure proper typing
      const parsedTiers = (data || []).map(tier => ({
        ...tier,
        features: Array.isArray(tier.features) ? tier.features : JSON.parse(tier.features as string)
      }));
      
      setTiers(parsedTiers);
    } catch (error) {
      console.error('📊 [TIERS] Error fetching tiers:', error);
      toast.error('Failed to load subscription tiers');
    } finally {
      setLoading(false);
    }
  };

  const getTierById = (tierId: string): SubscriptionTier | undefined => {
    return tiers.find(tier => tier.id === tierId);
  };

  const getTierLimits = (tierId: string) => {
    const tier = getTierById(tierId);
    return {
      memberLimit: tier?.member_limit || 50,
      coachLimit: tier?.coach_limit || 1,
      courtLimit: tier?.court_limit || 1,
      features: tier?.features || []
    };
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  return {
    tiers,
    loading,
    getTierById,
    getTierLimits,
    refreshTiers: fetchTiers
  };
}