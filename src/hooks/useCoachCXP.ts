
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CoachCXP {
  id: string;
  coach_id: string;
  current_cxp: number;
  total_cxp_earned: number;
  current_level: number;
  cxp_to_next_level: number;
  coaching_tier: string;
  commission_rate: number;
  tools_unlocked: string[];
  certifications_unlocked: string[];
  created_at: string;
  updated_at: string;
}

export interface CXPActivity {
  id: string;
  coach_id: string;
  activity_type: string;
  cxp_earned: number;
  description: string | null;
  source_player_id: string | null;
  metadata: any;
  created_at: string;
}

interface CXPResult {
  cxp_earned: number;
  total_cxp: number;
  current_level: number;
  level_up: boolean;
  levels_gained: number;
  current_cxp_in_level: number;
  cxp_to_next_level: number;
  coaching_tier: string;
  commission_rate: number;
  tools_unlocked: string[];
  certifications_unlocked: string[];
}

export function useCoachCXP() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cxpData, isLoading: cxpLoading, error: cxpError } = useQuery({
    queryKey: ['coach-cxp'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coach_cxp')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching coach CXP:', error);
        throw error;
      }

      return data as CoachCXP | null;
    },
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['cxp-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cxp_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching CXP activities:', error);
        throw error;
      }

      return data as CXPActivity[];
    },
  });

  const addCXPMutation = useMutation({
    mutationFn: async ({
      cxpAmount,
      activityType,
      description,
      sourcePlayerId,
      metadata
    }: {
      cxpAmount: number;
      activityType: string;
      description?: string;
      sourcePlayerId?: string;
      metadata?: any;
    }) => {
      const { data, error } = await supabase.rpc('add_cxp', {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        cxp_amount: cxpAmount,
        activity_type: activityType,
        description,
        source_player_id: sourcePlayerId,
        metadata
      });

      if (error) {
        console.error('Error adding CXP:', error);
        throw error;
      }

      return data as CXPResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['coach-cxp'] });
      queryClient.invalidateQueries({ queryKey: ['cxp-activities'] });
      
      if (result.level_up) {
        toast({
          title: "Level Up! 🎉",
          description: `Congratulations! You've reached level ${result.current_level} (${result.coaching_tier})`,
        });
      } else {
        toast({
          title: "CXP Earned",
          description: `+${result.cxp_earned} CXP earned!`,
        });
      }
    },
    onError: (error) => {
      console.error('Failed to add CXP:', error);
      toast({
        title: "Error",
        description: "Failed to add CXP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const initializeCXP = async () => {
    try {
      const { data, error } = await supabase.rpc('initialize_coach_cxp', {
        user_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) {
        console.error('Error initializing coach CXP:', error);
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['coach-cxp'] });
      return data;
    } catch (error) {
      console.error('Failed to initialize CXP:', error);
      throw error;
    }
  };

  return {
    cxpData,
    activities,
    loading: cxpLoading || activitiesLoading,
    addCXP: addCXPMutation.mutate,
    addCXPLoading: addCXPMutation.isPending,
    initializeCXP,
    error: cxpError
  };
}
