import { useState } from 'react';
import { useUnifiedSessions } from './useUnifiedSessions';
import { toast } from 'sonner';

interface CompletionData {
  winnerId?: string;
  winningTeam?: string;
  durationMinutes: number;
  sessionNotes?: string;
  sessionRating?: number;
}

export function useSessionCompletion() {
  const [isCompleting, setIsCompleting] = useState(false);
  const { completeSession: completeUnifiedSession, getSessionParticipants } = useUnifiedSessions();

  const completeSession = async (sessionId: string, data: CompletionData): Promise<boolean> => {
    setIsCompleting(true);
    try {
      // Use the unified session completion with enhanced data
      const success = await completeUnifiedSession(
        sessionId,
        data.durationMinutes,
        data.winnerId,
        data.winningTeam
      );

      if (success) {
        toast.success('Session completed successfully! 🏆');
        return true;
      } else {
        toast.error('Failed to complete session');
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

  const selectWinners = async (sessionId: string, winnerId?: string, winningTeam?: string) => {
    // This can be used for winner selection logic
    return { winnerId, winningTeam };
  };

  const calculateRewards = (
    participants: number, 
    durationMinutes: number, 
    stakesAmount: number
  ) => {
    // Calculate XP rewards based on duration and participation
    const baseXP = Math.min(durationMinutes * 2, 100); // 2 XP per minute, max 100
    const participationBonus = participants * 5; // 5 XP per participant
    const totalXP = baseXP + participationBonus;

    // Calculate token distribution
    const platformFee = Math.floor(stakesAmount * 0.1); // 10% platform fee
    const winnerPayout = stakesAmount - platformFee;

    // Estimated HP consumption (3-5 HP per 30 minutes)
    const estimatedHP = Math.ceil((durationMinutes / 30) * 4);

    return {
      xp: totalXP,
      tokens: winnerPayout,
      hpConsumed: estimatedHP,
      platformFee
    };
  };

  return {
    completeSession,
    selectWinners,
    calculateRewards,
    isCompleting,
    getSessionParticipants
  };
}