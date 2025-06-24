
export interface TennisAnalysis {
  doubleBreakBonus: boolean;
  comebackBonus: boolean;
  clutchBonus: boolean;
  breakCount: number;
  isComeback: boolean;
  isFinalSet: boolean;
  momentumShift: 'player' | 'opponent' | 'neutral';
  description: string;
}

export interface SetScore {
  playerScore: string;
  opponentScore: string;
  completed: boolean;
}

export const analyzeTennisMatch = (
  sets: SetScore[],
  currentSet: number,
  isDoubles: boolean = false
): TennisAnalysis => {
  const completedSets = sets.filter(set => set.completed);
  const analysis: TennisAnalysis = {
    doubleBreakBonus: false,
    comebackBonus: false,
    clutchBonus: false,
    breakCount: 0,
    isComeback: false,
    isFinalSet: false,
    momentumShift: 'neutral',
    description: ''
  };

  if (completedSets.length === 0) {
    return analysis;
  }

  // Analyze breaks (approximate from score differences)
  analysis.breakCount = analyzeBreaks(completedSets);
  analysis.doubleBreakBonus = analysis.breakCount >= 2;

  // Analyze comeback potential
  analysis.isComeback = analyzeComeback(completedSets);
  analysis.comebackBonus = analysis.isComeback;

  // Analyze clutch situations
  const maxSets = isDoubles ? 3 : 5; // Best of 3 for doubles, best of 5 for singles
  const isMatchPoint = completedSets.length >= (maxSets - 1);
  analysis.isFinalSet = isMatchPoint;
  analysis.clutchBonus = isMatchPoint && isPlayerWinning(completedSets);

  // Calculate momentum
  analysis.momentumShift = calculateMomentum(completedSets);

  // Generate description
  analysis.description = generateAnalysisDescription(analysis);

  return analysis;
};

const analyzeBreaks = (sets: SetScore[]): number => {
  let breakCount = 0;
  
  sets.forEach(set => {
    const playerScore = parseInt(set.playerScore);
    const opponentScore = parseInt(set.opponentScore);
    
    // Rough break detection: if player won 6-3 or better, likely broke serve
    if (playerScore >= 6 && (playerScore - opponentScore) >= 2) {
      breakCount++;
    }
    
    // Double break: winning 6-2, 6-1, 6-0
    if (playerScore >= 6 && opponentScore <= 2) {
      breakCount += 0.5; // Extra half point for dominant set
    }
  });
  
  return Math.floor(breakCount);
};

const analyzeComeback = (sets: SetScore[]): boolean => {
  if (sets.length < 2) return false;
  
  // Check if player lost first set but won subsequent sets
  const firstSet = sets[0];
  const playerLostFirst = parseInt(firstSet.opponentScore) > parseInt(firstSet.playerScore);
  
  if (!playerLostFirst) return false;
  
  // Check if player won any subsequent sets
  const subsequentWins = sets.slice(1).some(set => 
    parseInt(set.playerScore) > parseInt(set.opponentScore)
  );
  
  return subsequentWins;
};

const isPlayerWinning = (sets: SetScore[]): boolean => {
  const playerWins = sets.filter(set => 
    parseInt(set.playerScore) > parseInt(set.opponentScore)
  ).length;
  
  const opponentWins = sets.length - playerWins;
  return playerWins > opponentWins;
};

const calculateMomentum = (sets: SetScore[]): 'player' | 'opponent' | 'neutral' => {
  if (sets.length === 0) return 'neutral';
  
  const lastSet = sets[sets.length - 1];
  const playerScore = parseInt(lastSet.playerScore);
  const opponentScore = parseInt(lastSet.opponentScore);
  
  const scoreDiff = playerScore - opponentScore;
  
  if (scoreDiff >= 3) return 'player';
  if (scoreDiff <= -3) return 'opponent';
  return 'neutral';
};

const generateAnalysisDescription = (analysis: TennisAnalysis): string => {
  const bonuses = [];
  
  if (analysis.doubleBreakBonus) {
    bonuses.push('Double Break Advantage');
  }
  
  if (analysis.comebackBonus) {
    bonuses.push('Comeback Story');
  }
  
  if (analysis.clutchBonus) {
    bonuses.push('Clutch Performance');
  }
  
  if (bonuses.length === 0) {
    return 'Standard Match';
  }
  
  return bonuses.join(' + ');
};

export const calculateTennisMultiplier = (analysis: TennisAnalysis): number => {
  let multiplier = 1.0;
  
  if (analysis.doubleBreakBonus) {
    multiplier += 0.5; // +50% for double breaks
  }
  
  if (analysis.comebackBonus) {
    multiplier += 0.3; // +30% for comebacks
  }
  
  if (analysis.clutchBonus) {
    multiplier *= 2.0; // 2x for clutch/final set wins
  }
  
  return Math.min(4.0, multiplier); // Cap at 4x multiplier
};
