
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SelectedOpponent } from '@/components/match/OpponentSearchSelector';
import { analyzeOpponent, analyzeDoublesOpponents, estimateDifficulty, OpponentAnalysis, DoublesOpponentAnalysis } from '@/services/opponentAnalyzer';
import { calculateMatchRewards, RewardCalculation } from '@/utils/rewardCalculator';
import { analyzeTennisMatch, calculateTennisMultiplier, TennisAnalysis } from '@/services/tennisScoreAnalyzer';
import { trackMomentum, MomentumState } from '@/services/momentumTracker';
import { supabase } from '@/integrations/supabase/client';

interface MatchRewardsState {
  rewards: RewardCalculation | null;
  opponentAnalysis: OpponentAnalysis | null;
  doublesAnalysis: DoublesOpponentAnalysis | null;
  tennisAnalysis: TennisAnalysis | null;
  momentum: MomentumState | null;
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
  sets?: Array<{playerScore: string; opponentScore: string; completed: boolean}>;
  currentSet?: number;
}

export function useMatchRewards({
  opponent,
  isDoubles = false,
  partner,
  opponent1,
  opponent2,
  sets = [],
  currentSet = 0
}: UseMatchRewardsParams = {}) {
  const { user } = useAuth();
  const [state, setState] = useState<MatchRewardsState>({
    rewards: null,
    opponentAnalysis: null,
    doublesAnalysis: null,
    tennisAnalysis: null,
    momentum: null,
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

      // Analyze tennis-specific factors
      const tennisAnalysis = analyzeTennisMatch(sets, currentSet, isDoubles);
      const momentum = trackMomentum(sets, currentSet, tennisAnalysis);

      if (isDoubles && (opponent1 || opponent2)) {
        // Doubles analysis
        const doublesAnalysis = await analyzeDoublesOpponents(partner, opponent1, opponent2);
        
        let rewards = calculateMatchRewards(
          playerLevel,
          doublesAnalysis.averageOpponentLevel,
          playerSkill,
          'intermediate', // Use default for average
          true // isDoubles
        );

        // Apply tennis-specific multipliers
        const tennisMultiplier = calculateTennisMultiplier(tennisAnalysis);
        rewards = applyTennisMultiplier(rewards, tennisMultiplier);

        setState(prev => ({
          ...prev,
          rewards,
          doublesAnalysis,
          tennisAnalysis,
          momentum,
          playerLevel,
          playerSkill,
          loading: false
        }));

      } else if (!isDoubles && opponent) {
        // Singles analysis
        const opponentAnalysis = await analyzeOpponent(opponent);
        
        // Add difficulty estimation
        opponentAnalysis.estimatedDifficulty = estimateDifficulty(playerLevel, opponentAnalysis.level);
        
        let rewards = calculateMatchRewards(
          playerLevel,
          opponentAnalysis.level,
          playerSkill,
          opponentAnalysis.skillLevel,
          false // isDoubles
        );

        // Apply tennis-specific multipliers
        const tennisMultiplier = calculateTennisMultiplier(tennisAnalysis);
        rewards = applyTennisMultiplier(rewards, tennisMultiplier);

        setState(prev => ({
          ...prev,
          rewards,
          opponentAnalysis,
          tennisAnalysis,
          momentum,
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
          tennisAnalysis,
          momentum,
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

  const applyTennisMultiplier = (rewards: RewardCalculation, tennisMultiplier: number): RewardCalculation => {
    return {
      ...rewards,
      winXP: Math.round(rewards.winXP * tennisMultiplier),
      winHP: Math.round(rewards.winHP * Math.min(tennisMultiplier, 1.5)), // Cap HP multiplier
      winTokens: Math.round(rewards.winTokens * tennisMultiplier),
      loseXP: Math.round(rewards.loseXP * Math.min(tennisMultiplier, 1.3)), // Cap lose XP multiplier
      loseTokens: Math.round(rewards.loseTokens * Math.min(tennisMultiplier, 1.2)), // Cap lose token multiplier
      difficultyMultiplier: rewards.difficultyMultiplier * tennisMultiplier
    };
  };

  useEffect(() => {
    calculateRewards();
  }, [user, opponent, isDoubles, partner, opponent1, opponent2, sets, currentSet]);

  return {
    ...state,
    recalculateRewards: calculateRewards
  };
}
