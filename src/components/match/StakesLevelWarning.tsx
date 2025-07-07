import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StakesLevelWarningProps {
  playerLevel: number;
  opponentLevel: number;
  stakesAmount: number;
  sessionType: 'social' | 'competitive' | 'training';
}

export function StakesLevelWarning({ 
  playerLevel, 
  opponentLevel, 
  stakesAmount,
  sessionType 
}: StakesLevelWarningProps) {
  const levelDiff = Math.abs(playerLevel - opponentLevel);
  const isPlayerHigher = playerLevel > opponentLevel;
  
  // Import level balance functions
  const { canPlayersStake, calculateAdjustedStake, getLevelDifferenceCategory } = require('@/utils/gameEconomics');
  
  if (sessionType === 'training' || stakesAmount === 0) {
    return null;
  }
  
  // Check if staking is allowed
  if (!canPlayersStake(playerLevel, opponentLevel)) {
    return (
      <Alert className="border-l-4 border-l-red-500">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Stakes Blocked:</strong> Cannot stake against players with more than 10 level difference.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Calculate adjustments
  const adjustedStake = calculateAdjustedStake(stakesAmount, playerLevel, opponentLevel);
  const category = getLevelDifferenceCategory(playerLevel, opponentLevel);
  
  if (category === 'equal_levels') {
    return null; // No warning needed for fair matches
  }
  
  const reductionPercent = Math.round(((stakesAmount - adjustedStake) / stakesAmount) * 100);
  
  return (
    <Alert className="border-l-4 border-l-amber-500">
      <Shield className="h-4 w-4 text-amber-600" />
      <AlertDescription>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Level {playerLevel} vs Level {opponentLevel}
            </Badge>
            {reductionPercent > 0 && (
              <Badge variant="secondary" className="text-xs">
                {reductionPercent}% stake reduction
              </Badge>
            )}
          </div>
          
          {isPlayerHigher ? (
            <div className="text-amber-800">
              <strong>Higher Level Warning:</strong> Reduced stakes and rewards when playing lower level opponents.
              <br />
              <span className="text-sm">
                Adjusted stake: {adjustedStake} tokens (was {stakesAmount})
              </span>
            </div>
          ) : (
            <div className="text-green-800 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>
                <strong>Challenge Bonus:</strong> Extra XP for facing a higher level opponent!
              </span>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}