
export interface MomentumState {
  score: number; // -100 to +100, where +100 is maximum player momentum
  trend: 'rising' | 'falling' | 'stable';
  intensity: 'low' | 'medium' | 'high';
  description: string;
  confidence: number; // 0-1, how confident we are in this assessment
}

export interface MomentumFactors {
  scoreDifference: number;
  recentPerformance: number;
  setProgress: number;
  matchContext: number;
}

export const trackMomentum = (
  sets: Array<{playerScore: string; opponentScore: string; completed: boolean}>,
  currentSet: number,
  tennisAnalysis?: any
): MomentumState => {
  const completedSets = sets.filter(set => set.completed);
  
  if (completedSets.length === 0) {
    return {
      score: 0,
      trend: 'stable',
      intensity: 'low',
      description: 'Match just started',
      confidence: 0.5
    };
  }

  const factors = calculateMomentumFactors(completedSets, tennisAnalysis);
  const score = calculateMomentumScore(factors);
  
  return {
    score,
    trend: determineTrend(completedSets),
    intensity: determineIntensity(Math.abs(score)),
    description: generateMomentumDescription(score, factors),
    confidence: calculateConfidence(completedSets.length)
  };
};

const calculateMomentumFactors = (
  sets: Array<{playerScore: string; opponentScore: string; completed: boolean}>,
  tennisAnalysis?: any
): MomentumFactors => {
  // Score difference factor (-50 to +50)
  const scoreDifference = calculateScoreDifference(sets);
  
  // Recent performance (how player did in last 1-2 sets)
  const recentPerformance = calculateRecentPerformance(sets);
  
  // Set progress (early sets vs late sets have different psychological impact)
  const setProgress = sets.length * 10; // 10 points per completed set
  
  // Match context (breaks, comebacks, etc.)
  const matchContext = tennisAnalysis ? calculateMatchContext(tennisAnalysis) : 0;
  
  return {
    scoreDifference,
    recentPerformance,
    setProgress,
    matchContext
  };
};

const calculateScoreDifference = (sets: Array<{playerScore: string; opponentScore: string}>): number => {
  let totalDiff = 0;
  
  sets.forEach((set, index) => {
    const playerScore = parseInt(set.playerScore);
    const opponentScore = parseInt(set.opponentScore);
    const setDiff = playerScore - opponentScore;
    
    // Weight recent sets more heavily
    const weight = index === sets.length - 1 ? 1.5 : 1.0;
    totalDiff += setDiff * weight;
  });
  
  return Math.max(-50, Math.min(50, totalDiff * 5)); // Scale and cap
};

const calculateRecentPerformance = (sets: Array<{playerScore: string; opponentScore: string}>): number => {
  if (sets.length === 0) return 0;
  
  // Look at last 2 sets
  const recentSets = sets.slice(-2);
  let performance = 0;
  
  recentSets.forEach(set => {
    const playerScore = parseInt(set.playerScore);
    const opponentScore = parseInt(set.opponentScore);
    
    if (playerScore > opponentScore) {
      performance += 20; // Win gives +20
    } else {
      performance -= 15; // Loss gives -15
    }
    
    // Bonus for dominant wins/losses
    const margin = Math.abs(playerScore - opponentScore);
    if (margin >= 3) {
      performance += playerScore > opponentScore ? 10 : -10;
    }
  });
  
  return Math.max(-30, Math.min(30, performance));
};

const calculateMatchContext = (tennisAnalysis: any): number => {
  let context = 0;
  
  if (tennisAnalysis.doubleBreakBonus) context += 15;
  if (tennisAnalysis.comebackBonus) context += 20;
  if (tennisAnalysis.clutchBonus) context += 25;
  
  return context;
};

const calculateMomentumScore = (factors: MomentumFactors): number => {
  const total = factors.scoreDifference + 
                factors.recentPerformance + 
                factors.matchContext;
                
  return Math.max(-100, Math.min(100, total));
};

const determineTrend = (sets: Array<{playerScore: string; opponentScore: string}>): 'rising' | 'falling' | 'stable' => {
  if (sets.length < 2) return 'stable';
  
  const lastTwo = sets.slice(-2);
  const secondLast = parseInt(lastTwo[0].playerScore) - parseInt(lastTwo[0].opponentScore);
  const last = parseInt(lastTwo[1].playerScore) - parseInt(lastTwo[1].opponentScore);
  
  const diff = last - secondLast;
  
  if (diff > 1) return 'rising';
  if (diff < -1) return 'falling';
  return 'stable';
};

const determineIntensity = (absScore: number): 'low' | 'medium' | 'high' => {
  if (absScore >= 60) return 'high';
  if (absScore >= 30) return 'medium';
  return 'low';
};

const generateMomentumDescription = (score: number, factors: MomentumFactors): string => {
  if (score > 60) return 'Dominating the match';
  if (score > 30) return 'Strong momentum';
  if (score > 10) return 'Slight advantage';
  if (score > -10) return 'Even match';
  if (score > -30) return 'Facing pressure';
  if (score > -60) return 'Under pressure';
  return 'Struggling to find rhythm';
};

const calculateConfidence = (setsPlayed: number): number => {
  // More sets = higher confidence in momentum assessment
  return Math.min(1.0, 0.3 + (setsPlayed * 0.2));
};
