import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface SessionCompletionData {
  duration_seconds: number;
  winner_data: {
    winner_id?: string;
    winning_team?: string[];
    is_draw?: boolean;
    total_stakes: number;
    platform_fee: number;
    winner_payout: number;
    base_xp: number;
    hp_reduction: number;
  };
  ended_at: string;
}

interface RewardCalculation {
  participant_id: string;
  tokens_earned: number;
  tokens_returned: number;
  xp_earned: number;
  hp_reduction: number;
  is_winner: boolean;
}

export function useSessionCompletion() {
  const { user } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);

  const calculateRewards = (
    participants: any[],
    completionData: SessionCompletionData
  ): RewardCalculation[] => {
    const { winner_data } = completionData;
    
    return participants.map(participant => {
      const isWinner = winner_data.winner_id === participant.user_id;
      const isDraw = winner_data.is_draw;
      
      let tokensEarned = 0;
      let tokensReturned = 0;
      
      if (isDraw) {
        // Return stakes to all participants
        tokensReturned = participant.tokens_paid;
      } else if (isWinner) {
        // Winner gets the payout
        tokensEarned = winner_data.winner_payout;
      }
      // Losers get nothing back in non-draw scenarios
      
      return {
        participant_id: participant.user_id,
        tokens_earned: tokensEarned,
        tokens_returned: tokensReturned,
        xp_earned: winner_data.base_xp + (isWinner ? 20 : 0), // Bonus XP for winner
        hp_reduction: winner_data.hp_reduction,
        is_winner: isWinner
      };
    });
  };

  const selectWinners = async (
    sessionId: string,
    winnerIds: string[]
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          winner_id: winnerIds[0], // For now, single winner
          winning_team: winnerIds.length > 1 ? winnerIds : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('creator_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error selecting winners:', error);
      return false;
    }
  };

  const completeSession = async (
    sessionId: string,
    participants: any[],
    completionData: SessionCompletionData
  ): Promise<boolean> => {
    if (!user) return false;

    setIsCompleting(true);

    try {
      // Use the proper database RPC function for completing sessions
      const { data, error } = await supabase
        .rpc('complete_session', {
          session_id_param: sessionId,
          winner_id_param: completionData.winner_data.winner_id || null
        });

      if (error) throw error;

      if (data && typeof data === 'object' && data !== null && 'success' in data && data.success) {
        toast.success('Session completed successfully!');
        return true;
      } else {
        const errorMessage = typeof data === 'object' && data !== null && 'message' in data 
          ? String(data.message) 
          : 'Failed to complete session';
        toast.error(errorMessage);
        return false;
      }
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to complete session');
      return false;
    } finally {
      setIsCompleting(false);
    }
  };

  // Remove the manual reward processing since the RPC handles it
  const legacyCompleteSession = async (
    sessionId: string,
    participants: any[],
    completionData: SessionCompletionData
  ): Promise<boolean> => {
    if (!user) return false;

    setIsCompleting(true);

    try {
      // Calculate rewards for all participants
      const rewards = calculateRewards(participants, completionData);
      
      // Update session status and completion data
      const { error: sessionError } = await supabase
        .from('sessions')
        .update({
          status: 'completed',
          completed_at: completionData.ended_at,
          session_ended_at: completionData.ended_at,
          winner_id: completionData.winner_data.winner_id || null,
          winning_team: completionData.winner_data.winning_team || null,
          session_result: {
            duration_seconds: completionData.duration_seconds,
            is_draw: completionData.winner_data.is_draw,
            total_stakes: completionData.winner_data.total_stakes,
            platform_fee: completionData.winner_data.platform_fee,
            rewards: JSON.stringify(rewards)
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('creator_id', user.id);

      if (sessionError) throw sessionError;

      // Process rewards for each participant
      const rewardPromises = rewards.map(async (reward) => {
        try {
          // Add tokens (if any)
          if (reward.tokens_earned > 0 || reward.tokens_returned > 0) {
            const totalTokens = reward.tokens_earned + reward.tokens_returned;
            const { error: tokenError } = await supabase
              .rpc('add_tokens', {
                user_id: reward.participant_id,
                amount: totalTokens,
                token_type: 'regular',
                source: 'session_completion',
                description: `Session rewards: ${reward.tokens_earned} earned, ${reward.tokens_returned} returned`
              });

            if (tokenError) {
              console.error('Error adding tokens:', tokenError);
              // Continue processing other rewards
            }
          }

          // Add XP
          if (reward.xp_earned > 0) {
            const { error: xpError } = await supabase
              .rpc('add_xp', {
                user_id: reward.participant_id,
                xp_amount: reward.xp_earned,
                activity_type: 'session_completion',
                description: `Session completion XP${reward.is_winner ? ' (Winner bonus)' : ''}`
              });

            if (xpError) {
              console.error('Error adding XP:', xpError);
              // Continue processing other rewards
            }
          }

          // Reduce HP (if applicable) - use negative amount for reduction
          if (reward.hp_reduction > 0) {
            const { error: hpError } = await supabase
              .rpc('restore_hp', {
                user_id: reward.participant_id,
                restoration_amount: -reward.hp_reduction,
                activity_type: 'session_hp_loss',
                description: `HP loss from challenge session`
              });

            if (hpError) {
              console.error('Error reducing HP:', hpError);
              // Continue processing other rewards
            }
          }
        } catch (rewardError) {
          console.error(`Error processing rewards for participant ${reward.participant_id}:`, rewardError);
          // Continue processing other participants even if one fails
        }
      });

      await Promise.allSettled(rewardPromises);

      toast.success('Session completed successfully!');
      return true;

    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to complete session');
      return false;
    } finally {
      setIsCompleting(false);
    }
  };

  const startSession = async (sessionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Use the proper database RPC function for starting sessions
      const { data, error } = await supabase
        .rpc('start_session', {
          session_id_param: sessionId,
          starter_id_param: user.id
        });

      if (error) throw error;
      
      if (data && typeof data === 'object' && data !== null && 'success' in data && data.success) {
        toast.success('Session started successfully!');
        return true;
      } else {
        const errorMessage = typeof data === 'object' && data !== null && 'message' in data 
          ? String(data.message) 
          : 'Failed to start session';
        toast.error(errorMessage);
        return false;
      }
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
      return false;
    }
  };

  return {
    completeSession,
    selectWinners,
    calculateRewards,
    startSession,
    isCompleting
  };
}