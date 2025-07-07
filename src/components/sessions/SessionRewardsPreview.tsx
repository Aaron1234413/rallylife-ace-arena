import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Heart, Star, TrendingUp, TrendingDown } from 'lucide-react';

interface SessionRewardsPreviewProps {
  sessionType: 'social' | 'competitive' | 'training';
  playerLevel: number;
  opponentLevel?: number;
  stakesAmount: number;
  sessionDuration: number;
  className?: string;
}

export function SessionRewardsPreview({
  sessionType,
  playerLevel,
  opponentLevel = playerLevel,
  stakesAmount,
  sessionDuration,
  className
}: SessionRewardsPreviewProps) {
  // Import reward calculation functions
  const { calculateSessionRewards } = require('@/utils/rewardCalculator');
  const { getLevelDifferenceCategory } = require('@/utils/gameEconomics');
  
  const winRewards = calculateSessionRewards(
    sessionType,
    playerLevel,
    opponentLevel,
    true, // Winner
    stakesAmount,
    sessionDuration
  );
  
  const loseRewards = calculateSessionRewards(
    sessionType,
    playerLevel,
    opponentLevel,
    false, // Loser
    stakesAmount,
    sessionDuration
  );
  
  const levelDiff = Math.abs(playerLevel - opponentLevel);
  const category = getLevelDifferenceCategory(playerLevel, opponentLevel);
  const isPlayerHigher = playerLevel > opponentLevel;
  
  const getLevelBadge = () => {
    if (category === 'equal_levels') {
      return <Badge variant="outline" className="text-xs">Fair Match</Badge>;
    }
    if (isPlayerHigher) {
      return (
        <Badge variant="secondary" className="text-xs flex items-center gap-1">
          <TrendingDown className="h-3 w-3" />
          Easier Opponent
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="text-xs flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        Challenge Bonus
      </Badge>
    );
  };
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Reward Preview</CardTitle>
          {levelDiff > 2 && getLevelBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Winner Rewards */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-green-700 dark:text-green-400">
              Winner Rewards
            </h4>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs">
                <Star className="h-3 w-3 text-blue-600" />
                <span>{winRewards.winXP} XP</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Heart className="h-3 w-3 text-red-600" />
                <span>{winRewards.winHP > 0 ? '+' : ''}{winRewards.winHP} HP</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Coins className="h-3 w-3 text-yellow-600" />
                <span>{winRewards.winTokens} tokens</span>
              </div>
            </div>
          </div>
          
          {/* Loser Rewards */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-orange-700 dark:text-orange-400">
              Participation
            </h4>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs">
                <Star className="h-3 w-3 text-blue-600" />
                <span>{loseRewards.loseXP} XP</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Heart className="h-3 w-3 text-red-600" />
                <span>{loseRewards.loseHP} HP</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Coins className="h-3 w-3 text-yellow-600" />
                <span>{loseRewards.loseTokens} tokens</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stakes Info */}
        {stakesAmount > 0 && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Stakes: {stakesAmount} tokens • Rake: {Math.floor(stakesAmount * 0.1)} tokens
            </div>
          </div>
        )}
        
        {/* Level Advantage Warning */}
        {category !== 'equal_levels' && (
          <div className="text-xs text-gray-600 dark:text-gray-400 italic">
            {isPlayerHigher 
              ? "Reduced rewards for easier opponent" 
              : "Bonus XP for challenging higher level player!"
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
}