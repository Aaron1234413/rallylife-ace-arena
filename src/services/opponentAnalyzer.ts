
import { supabase } from '@/integrations/supabase/client';
import { SelectedOpponent } from '@/components/match/OpponentSearchSelector';

export interface OpponentAnalysis {
  id?: string;
  name: string;
  level: number;
  skillLevel: string;
  isManual: boolean;
  estimatedDifficulty: 'much_easier' | 'easier' | 'similar' | 'harder' | 'much_harder';
  confidenceLevel: 'low' | 'medium' | 'high';
}

export interface DoublesOpponentAnalysis {
  partner?: OpponentAnalysis;
  opponent1?: OpponentAnalysis;
  opponent2?: OpponentAnalysis;
  averageOpponentLevel: number;
  teamBalance: 'favor_you' | 'balanced' | 'favor_them';
}

const DEFAULT_LEVEL = 10;
const DEFAULT_SKILL = 'intermediate';

export const analyzeOpponent = async (opponent: SelectedOpponent): Promise<OpponentAnalysis> => {
  if (!opponent) {
    throw new Error('No opponent provided');
  }

  // Manual opponents get default values
  if (opponent.isManual || !opponent.id) {
    return {
      id: opponent.id,
      name: opponent.name,
      level: DEFAULT_LEVEL,
      skillLevel: DEFAULT_SKILL,
      isManual: true,
      estimatedDifficulty: 'similar',
      confidenceLevel: 'low'
    };
  }

  try {
    // Get opponent's profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', opponent.id)
      .single();

    if (profileError || !profile) {
      console.warn('Could not fetch opponent profile:', profileError);
      return {
        id: opponent.id,
        name: opponent.name,
        level: DEFAULT_LEVEL,
        skillLevel: DEFAULT_SKILL,
        isManual: false,
        estimatedDifficulty: 'similar',
        confidenceLevel: 'low'
      };
    }

    // Get opponent's XP data (level)
    const { data: xpData, error: xpError } = await supabase
      .from('player_xp')
      .select('current_level')
      .eq('player_id', opponent.id)
      .single();

    // Get opponent's skill level from player_profiles
    const { data: playerData, error: playerError } = await supabase
      .from('player_profiles')
      .select('skill_level')
      .eq('id', opponent.id)
      .single();

    const level = xpData?.current_level || DEFAULT_LEVEL;
    const skillLevel = playerData?.skill_level || DEFAULT_SKILL;

    console.log('Opponent analysis:', {
      id: opponent.id,
      name: opponent.name,
      level,
      skillLevel,
      xpError,
      playerError
    });

    return {
      id: opponent.id,
      name: opponent.name,
      level,
      skillLevel,
      isManual: false,
      estimatedDifficulty: 'similar', // Will be calculated relative to player
      confidenceLevel: xpError || playerError ? 'medium' : 'high'
    };

  } catch (error) {
    console.error('Error analyzing opponent:', error);
    return {
      id: opponent.id,
      name: opponent.name,
      level: DEFAULT_LEVEL,
      skillLevel: DEFAULT_SKILL,
      isManual: false,
      estimatedDifficulty: 'similar',
      confidenceLevel: 'low'
    };
  }
};

export const analyzeDoublesOpponents = async (
  partner: SelectedOpponent | null,
  opponent1: SelectedOpponent | null,
  opponent2: SelectedOpponent | null
): Promise<DoublesOpponentAnalysis> => {
  const analyses = await Promise.all([
    partner ? analyzeOpponent(partner) : null,
    opponent1 ? analyzeOpponent(opponent1) : null,
    opponent2 ? analyzeOpponent(opponent2) : null
  ]);

  const [partnerAnalysis, opponent1Analysis, opponent2Analysis] = analyses;

  // Calculate average opponent level
  const opponentLevels = [
    opponent1Analysis?.level,
    opponent2Analysis?.level
  ].filter(Boolean) as number[];

  const averageOpponentLevel = opponentLevels.length > 0 
    ? Math.round(opponentLevels.reduce((sum, level) => sum + level, 0) / opponentLevels.length)
    : DEFAULT_LEVEL;

  return {
    partner: partnerAnalysis || undefined,
    opponent1: opponent1Analysis || undefined,
    opponent2: opponent2Analysis || undefined,
    averageOpponentLevel,
    teamBalance: 'balanced' // Will be calculated based on team levels
  };
};

export const estimateDifficulty = (playerLevel: number, opponentLevel: number): OpponentAnalysis['estimatedDifficulty'] => {
  const diff = opponentLevel - playerLevel;
  
  if (diff >= 8) return 'much_harder';
  if (diff >= 3) return 'harder';
  if (diff <= -8) return 'much_easier';
  if (diff <= -3) return 'easier';
  return 'similar';
};
