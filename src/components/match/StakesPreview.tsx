
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Users, AlertCircle } from 'lucide-react';
import { RewardCalculation } from '@/utils/rewardCalculator';
import { OpponentAnalysis, DoublesOpponentAnalysis } from '@/services/opponentAnalyzer';

interface StakesPreviewProps {
  rewards: RewardCalculation | null;
  opponentAnalysis?: OpponentAnalysis | null;
  doublesAnalysis?: DoublesOpponentAnalysis | null;
  isDoubles?: boolean;
  loading?: boolean;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'much_easier': return 'bg-green-100 text-green-800 border-green-200';
    case 'easier': return 'bg-green-50 text-green-700 border-green-100';
    case 'similar': return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'harder': return 'bg-orange-50 text-orange-700 border-orange-100';
    case 'much_harder': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-100';
  }
};

const getDifficultyIcon = (difficulty: string) => {
  switch (difficulty) {
    case 'much_easier':
    case 'easier':
      return <TrendingDown className="h-3 w-3" />;
    case 'harder':
    case 'much_harder':
      return <TrendingUp className="h-3 w-3" />;
    default:
      return <Target className="h-3 w-3" />;
  }
};

export const StakesPreview: React.FC<StakesPreviewProps> = ({
  rewards,
  opponentAnalysis,
  doublesAnalysis,
  isDoubles = false,
  loading = false
}) => {
  if (loading) {
    return (
      <Card className="border-tennis-green-light">
        <CardContent className="p-4 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Calculating stakes...</p>
        </CardContent>
      </Card>
    );
  }

  if (!rewards) {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-4 text-center">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Select opponent to see match stakes</p>
        </CardContent>
      </Card>
    );
  }

  const analysis = isDoubles ? doublesAnalysis : opponentAnalysis;
  const difficultyText = isDoubles 
    ? `Level ${doublesAnalysis?.averageOpponentLevel || '?'} Team`
    : `Level ${opponentAnalysis?.level || '?'} ${opponentAnalysis?.estimatedDifficulty?.replace('_', ' ') || 'similar'}`;

  const multiplierText = rewards.difficultyMultiplier !== 1.0 
    ? `${rewards.difficultyMultiplier.toFixed(1)}x`
    : '';

  return (
    <Card className="border-tennis-green-light bg-gradient-to-r from-tennis-green-light/5 to-tennis-green-dark/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            {isDoubles ? <Users className="h-4 w-4" /> : <Target className="h-4 w-4" />}
            <span className="font-orbitron font-bold">Match Stakes</span>
          </div>
          {multiplierText && (
            <Badge variant="secondary" className="text-xs font-orbitron font-bold">
              {multiplierText} Multiplier
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Difficulty Assessment */}
        {analysis && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Difficulty:</span>
            <Badge 
              variant="outline" 
              className={`text-xs flex items-center gap-1 font-orbitron font-medium ${
                !isDoubles && opponentAnalysis?.estimatedDifficulty 
                  ? getDifficultyColor(opponentAnalysis.estimatedDifficulty)
                  : 'bg-blue-50 text-blue-700 border-blue-100'
              }`}
            >
              {!isDoubles && opponentAnalysis?.estimatedDifficulty 
                ? getDifficultyIcon(opponentAnalysis.estimatedDifficulty)
                : <Target className="h-3 w-3" />
              }
              {difficultyText}
            </Badge>
          </div>
        )}

        {/* Level Difference Info */}
        {rewards.levelDifference !== 0 && (
          <div className="text-xs text-gray-600 text-center bg-gray-50 rounded p-2">
            {rewards.levelDifference > 0 
              ? `+${rewards.levelDifference} levels higher → Bonus rewards!`
              : `${Math.abs(rewards.levelDifference)} levels lower → Reduced rewards`
            }
          </div>
        )}

        {/* Rewards Preview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-center">
              <div className="text-xs font-semibold text-green-800 mb-1 font-orbitron">If You Win</div>
              <div className="space-y-1">
                <div className="text-xs text-green-700 font-orbitron font-medium">🎮 +{rewards.winXP} XP</div>
                <div className="text-xs text-green-700 font-orbitron font-medium">❤️ +{rewards.winHP} HP</div>
                <div className="text-xs text-green-700 font-orbitron font-medium">🪙 +{rewards.winTokens} Tokens</div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-center">
              <div className="text-xs font-semibold text-red-800 mb-1 font-orbitron">If You Lose</div>
              <div className="space-y-1">
                <div className="text-xs text-red-700 font-orbitron font-medium">🎮 +{rewards.loseXP} XP</div>
                <div className="text-xs text-red-700 font-orbitron font-medium">❤️ {rewards.loseHP} HP</div>
                <div className="text-xs text-red-700 font-orbitron font-medium">🪙 +{rewards.loseTokens} Tokens</div>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Level */}
        {!isDoubles && opponentAnalysis && (
          <div className="text-center">
            <Badge 
              variant="outline" 
              className={`text-xs ${
                opponentAnalysis.confidenceLevel === 'high' 
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : opponentAnalysis.confidenceLevel === 'medium'
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              {opponentAnalysis.isManual ? 'External Player' : `${opponentAnalysis.confidenceLevel} confidence`}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
