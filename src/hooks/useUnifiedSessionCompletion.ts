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
    console.group('🔍 Session Validation Started');
    console.log('📋 Validation Parameters:', {
      sessionId,
      winnerId,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });

    if (!user) {
      console.error('❌ Validation Failed: User not authenticated');
      console.groupEnd();
      return { valid: false, error: 'User not authenticated' };
    }

    setIsValidating(true);
    try {
      console.log('🚀 Calling validate_session_completion RPC...');
      const { data, error } = await supabase.rpc('validate_session_completion', {
        session_id_param: sessionId,
        winner_id_param: winnerId || null
      });

      console.log('📋 RPC Validation Response:', { data, error });

      if (error) {
        console.error('❌ RPC Validation Error:', error);
        console.groupEnd();
        return { valid: false, error: error.message };
      }

      console.log('✅ Validation Successful:', data);
      console.groupEnd();
      return data as { valid: boolean; error?: string; participant_count?: number };
    } catch (error) {
      console.error('💥 Validation Exception:', error);
      console.groupEnd();
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
    console.group('🏁 Session Completion Started');
    console.log('📋 Completion Parameters:', {
      sessionId,
      winnerId,
      winningTeam,
      completionData,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });

    if (!user) {
      console.error('❌ Completion Failed: User not authenticated');
      console.groupEnd();
      return { success: false, error: 'User not authenticated' };
    }

    // Validate first
    console.log('🔍 Starting validation phase...');
    const validation = await validateCompletion(sessionId, winnerId);
    if (!validation.valid) {
      console.error('❌ Validation failed, aborting completion:', validation.error);
      console.groupEnd();
      return { success: false, error: validation.error };
    }
    console.log('✅ Validation passed, proceeding with completion:', validation);

    setIsCompleting(true);
    try {
      console.log('🚀 Calling complete_session_unified RPC...');
      console.log('📤 RPC Payload:', {
        session_id_param: sessionId,
        winner_id_param: winnerId || null,
        winning_team_param: winningTeam || null,
        completion_data: completionData
      });

      const startTime = performance.now();
      const { data, error } = await supabase.rpc('complete_session_unified', {
        session_id_param: sessionId,
        winner_id_param: winnerId || null,
        winning_team_param: winningTeam || null,
        completion_data: completionData as any
      });
      const endTime = performance.now();

      console.log(`📋 RPC Response (${Math.round(endTime - startTime)}ms):`, { data, error });

      if (error) {
        console.error('💥 RPC Completion Error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast.error(`Failed to complete session: ${error.message}`);
        console.groupEnd();
        return { success: false, error: error.message };
      }

      const result = data as any as CompletionResult;
      console.log('📊 Completion Result Analysis:', {
        success: result.success,
        hasStakes: !!result.total_stakes,
        hasPayout: !!result.net_payout,
        hasWinner: !!result.winner_id,
        hasError: !!result.error,
        rollback: result.rollback
      });
      
      if (result.success) {
        console.log('🎉 Completion Successful!', {
          sessionId: result.session_id,
          totalStakes: result.total_stakes,
          platformFee: result.platform_fee,
          netPayout: result.net_payout,
          winnerId: result.winner_id,
          completedAt: result.completed_at
        });
        toast.success('Session completed successfully!', {
          description: `${result.net_payout || 0} tokens distributed to winner`
        });
      } else {
        console.error('❌ Completion Failed:', result.error);
        toast.error(result.error || 'Failed to complete session');
        if (result.rollback) {
          console.warn('🔄 Transaction Rolled Back');
          toast.info('All changes have been rolled back');
        }
      }

      console.groupEnd();
      return result;
    } catch (error) {
      console.error('💥 Completion Exception:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
      const errorMsg = 'Failed to complete session';
      toast.error(errorMsg);
      console.groupEnd();
      return { success: false, error: errorMsg };
    } finally {
      setIsCompleting(false);
    }
  };

  const getRewardAudit = async (sessionId: string): Promise<RewardTransaction[]> => {
    console.group('📊 Reward Audit Fetch');
    console.log('📋 Audit Parameters:', { sessionId, timestamp: new Date().toISOString() });
    
    try {
      const { data, error } = await supabase.rpc('get_session_reward_audit', {
        session_id_param: sessionId
      });

      console.log('📋 Audit RPC Response:', { data, error, count: data?.length });

      if (error) {
        console.error('❌ Audit Fetch Error:', error);
        console.groupEnd();
        return [];
      }

      console.log('✅ Audit Fetch Successful:', data);
      console.groupEnd();
      return (data || []) as RewardTransaction[];
    } catch (error) {
      console.error('💥 Audit Fetch Exception:', error);
      console.groupEnd();
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
    console.group('💰 Reward Preview Calculation');
    console.log('📋 Preview Parameters:', { sessionId, winnerId, timestamp: new Date().toISOString() });
    
    try {
      // Get session and participant data for preview
      console.log('🔍 Fetching session data...');
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('session_type, title')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        console.error('❌ Session fetch error:', sessionError);
        throw sessionError;
      }
      console.log('✅ Session data:', session);

      console.log('🔍 Fetching participants data...');
      const { data: participants, error: participantsError } = await supabase
        .from('session_participants')
        .select('stakes_contributed')
        .eq('session_id', sessionId);

      if (participantsError) {
        console.error('❌ Participants fetch error:', participantsError);
        throw participantsError;
      }
      console.log('✅ Participants data:', participants);

      // Calculate rewards
      console.log('🧮 Calculating rewards...');
      const totalStakes = participants.reduce((sum, p) => sum + (p.stakes_contributed || 0), 0);
      const platformFee = Math.floor(totalStakes * 0.1);
      const netPayout = totalStakes - platformFee;

      const preview = {
        total_stakes: totalStakes,
        platform_fee: platformFee,
        net_payout: netPayout,
        participant_count: participants.length
      };

      console.log('💰 Reward Calculation:', {
        totalStakes,
        platformFeeRate: '10%',
        platformFee,
        netPayout,
        participantCount: participants.length,
        hasWinner: !!winnerId
      });

      console.groupEnd();
      return preview;
    } catch (error) {
      console.error('💥 Preview calculation exception:', error);
      console.groupEnd();
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