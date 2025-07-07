
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SelectedOpponent } from '@/components/match/OpponentSearchSelector';
import { analyzeOpponent, analyzeDoublesOpponents, estimateDifficulty, OpponentAnalysis, DoublesOpponentAnalysis } from '@/services/opponentAnalyzer';
import { calculateSessionRewards, RewardCalculation } from '@/utils/rewardCalculator';
import { supabase } from '@/integrations/supabase/client';

interface MatchRewardsState {
  rewards: RewardCalculation | null;
  opponentAnalysis: OpponentAnalysis | null;
  doublesAnalysis: DoublesOpponentAnalysis | null;
  playerLevel: number;
  playerSkill: string;
  loading: boolean;
  error: string | null;
}

interface UseMatchRewardsParams {
  opponent?: SelectedOpponent | null;
  isDoubles?: boolean;
  partner?: SelectedOpponent | null;
  opponent1?: SelectedOpponent | null;
  opponent2?: SelectedOpponent | null;
}

export function useMatchRewards({
  opponent,
  isDoubles = false,
  partner,
  opponent1,
  opponent2
}: UseMatchRewardsParams = {}) {
  const { user } = useAuth();
  const [state, setState] = useState<MatchRewardsState>({
    rewards: null,
    opponentAnalysis: null,
    doublesAnalysis: null,
    playerLevel: 1,
    playerSkill: 'intermediate',
    loading: false,
    error: null
  });

  const calculateRewards = async () => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Get player's current level and skill
      const [xpData, playerData] = await Promise.all([
        supabase
          .from('player_xp')
          .select('current_level')
          .eq('id', user.id)
          .single(),
        supabase
          .from('player_profiles')
          .select('skill_level')
          .eq('id', user.id)
          .single()
      ]);

      const playerLevel = xpData.data?.current_level || 1;
      const playerSkill = playerData.data?.skill_level || 'intermediate';

      if (isDoubles && (opponent1 || opponent2)) {
        // Doubles analysis
        const doublesAnalysis = await analyzeDoublesOpponents(partner, opponent1, opponent2);
        
        const rewards = calculateSessionRewards(
          'competitive', // Assuming competitive for doubles
          playerLevel,
          doublesAnalysis.averageOpponentLevel,
          true, // Assume winner for preview
          0 // No stakes for preview
        );

        setState(prev => ({
          ...prev,
          rewards,
          doublesAnalysis,
          playerLevel,
          playerSkill,
          loading: false
        }));

      } else if (!isDoubles && opponent) {
        // Singles analysis
        const opponentAnalysis = await analyzeOpponent(opponent);
        
        // Add difficulty estimation
        opponentAnalysis.estimatedDifficulty = estimateDifficulty(playerLevel, opponentAnalysis.level);
        
        const rewards = calculateSessionRewards(
          'competitive', // Assuming competitive for match rewards
          playerLevel,
          opponentAnalysis.level,
          true, // Assume winner for preview
          0 // No stakes for preview
        );

        setState(prev => ({
          ...prev,
          rewards,
          opponentAnalysis,
          playerLevel,
          playerSkill,
          loading: false
        }));

      } else {
        // No opponents selected yet
        setState(prev => ({
          ...prev,
          rewards: null,
          opponentAnalysis: null,
          doublesAnalysis: null,
          playerLevel,
          playerSkill,
          loading: false
        }));
      }

    } catch (error) {
      console.error('Error calculating match rewards:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to calculate match rewards'
      }));
    }
  };

  useEffect(() => {
    calculateRewards();
  }, [user, opponent, isDoubles, partner, opponent1, opponent2]);

  return {
    ...state,
    recalculateRewards: calculateRewards
  };
}
