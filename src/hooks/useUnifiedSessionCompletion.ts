import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface CompletionData {
  platform_fee_rate?: number;
  session_duration_minutes?: number;
  notes?: string;
}

interface RewardTransaction {
  participant_name: string;
  transaction_type: string;
  amount: number;
  before_value: number;
  after_value: number;
  calculation_data: any;
  created_at: string;
}

interface CompletionResult {
  success: boolean;
  session_id?: string;
  total_stakes?: number;
  platform_fee?: number;
  net_payout?: number;
  winner_id?: string;
  winning_team?: string[];
  completed_at?: string;
  error?: string;
  rollback?: boolean;
}

export function useUnifiedSessionCompletion() {
  const { user } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const validateCompletion = async (
    sessionId: string,
    winnerId?: string
  ): Promise<{ valid: boolean; error?: string; participant_count?: number }> => {
    if (!user) {
      return { valid: false, error: 'User not authenticated' };
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.rpc('validate_session_completion', {
        session_id_param: sessionId,
        winner_id_param: winnerId || null
      });

      if (error) {
        console.error('Validation error:', error);
        return { valid: false, error: error.message };
      }

      return data as { valid: boolean; error?: string; participant_count?: number };
    } catch (error) {
      console.error('Error validating completion:', error);
      return { valid: false, error: 'Validation failed' };
    } finally {
      setIsValidating(false);
    }
  };

  const completeSession = async (
    sessionId: string,
    winnerId?: string,
    winningTeam?: string[],
    completionData: CompletionData = {}
  ): Promise<CompletionResult> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Validate first
    const validation = await validateCompletion(sessionId, winnerId);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    setIsCompleting(true);
    try {
      const { data, error } = await supabase.rpc('complete_session_unified', {
        session_id_param: sessionId,
        winner_id_param: winnerId || null,
        winning_team_param: winningTeam ? JSON.stringify(winningTeam) : null,
        completion_data: completionData as any
      });

      if (error) {
        console.error('Completion error:', error);
        toast.error(`Failed to complete session: ${error.message}`);
        return { success: false, error: error.message };
      }

      const result = data as any as CompletionResult;
      
      if (result.success) {
        toast.success('Session completed successfully!', {
          description: `${result.net_payout || 0} tokens distributed to winner`
        });
      } else {
        toast.error(result.error || 'Failed to complete session');
        if (result.rollback) {
          toast.info('All changes have been rolled back');
        }
      }

      return result;
    } catch (error) {
      console.error('Error completing session:', error);
      const errorMsg = 'Failed to complete session';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsCompleting(false);
    }
  };

  const getRewardAudit = async (sessionId: string): Promise<RewardTransaction[]> => {
    try {
      const { data, error } = await supabase.rpc('get_session_reward_audit', {
        session_id_param: sessionId
      });

      if (error) {
        console.error('Error fetching reward audit:', error);
        return [];
      }

      return (data || []) as RewardTransaction[];
    } catch (error) {
      console.error('Error fetching reward audit:', error);
      return [];
    }
  };

  const previewRewards = async (
    sessionId: string,
    winnerId?: string
  ): Promise<{
    total_stakes: number;
    platform_fee: number;
    net_payout: number;
    participant_count: number;
  } | null> => {
    try {
      // Get session and participant data for preview
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('session_type, title')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      const { data: participants, error: participantsError } = await supabase
        .from('session_participants')
        .select('stakes_contributed')
        .eq('session_id', sessionId);

      if (participantsError) throw participantsError;

      const totalStakes = participants.reduce((sum, p) => sum + (p.stakes_contributed || 0), 0);
      const platformFee = Math.floor(totalStakes * 0.1);
      const netPayout = totalStakes - platformFee;

      return {
        total_stakes: totalStakes,
        platform_fee: platformFee,
        net_payout: netPayout,
        participant_count: participants.length
      };
    } catch (error) {
      console.error('Error previewing rewards:', error);
      return null;
    }
  };

  return {
    completeSession,
    validateCompletion,
    getRewardAudit,
    previewRewards,
    isCompleting,
    isValidating
  };
}