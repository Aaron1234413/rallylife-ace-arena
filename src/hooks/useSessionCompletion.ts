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
          // Add tokens (if any) - using placeholder for now since add_tokens function doesn't exist
          if (reward.tokens_earned > 0 || reward.tokens_returned > 0) {
            console.log(`Would add ${reward.tokens_earned + reward.tokens_returned} tokens to user ${reward.participant_id}`);
            // TODO: Implement token addition when add_tokens function is available
          }

          // Add XP - using placeholder for now since add_xp function doesn't exist
          if (reward.xp_earned > 0) {
            console.log(`Would add ${reward.xp_earned} XP to user ${reward.participant_id}`);
            // TODO: Implement XP addition when add_xp function is available
          }

          // Reduce HP (if applicable) - using placeholder for now since reduce_hp function doesn't exist
          if (reward.hp_reduction > 0) {
            console.log(`Would reduce ${reward.hp_reduction} HP from user ${reward.participant_id}`);
            // TODO: Implement HP reduction when reduce_hp function is available
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
      const { error } = await supabase
        .from('sessions')
        .update({
          status: 'active',
          session_started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('creator_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error starting session:', error);
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