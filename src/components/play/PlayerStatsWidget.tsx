import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Coins, Trophy, Heart, Zap, Info, TrendingDown } from 'lucide-react';

interface PlayerStatsWidgetProps {
  level: number;
  currentXP: number;
  xpToNext: number;
  tokens: number;
  hp: number;
  maxHP: number;
  matchesWon: number;
  totalMatches: number;
  loading?: boolean;
  recentHPLoss?: number; // HP lost from recent sessions
  lastActivity?: string; // For recovery recommendations
}

export function PlayerStatsWidget({ 
  level, 
  currentXP, 
  xpToNext, 
  tokens, 
  hp, 
  maxHP, 
  matchesWon, 
  totalMatches,
  loading = false,
  recentHPLoss = 0,
  lastActivity
}: PlayerStatsWidgetProps) {
  const xpProgress = xpToNext > 0 ? (currentXP / (currentXP + xpToNext)) * 100 : 100;
  const hpProgress = (hp / maxHP) * 100;
  const winRate = totalMatches > 0 ? Math.round((matchesWon / totalMatches) * 100) : 0;
  
  // HP status and recovery recommendations
  const hpStatus = hp <= 30 ? 'critical' : hp <= 50 ? 'low' : hp <= 70 ? 'medium' : 'good';
  const needsRecovery = hp < maxHP;
  
  const getRecoveryRecommendation = () => {
    if (hp >= maxHP) return null;
    if (hp <= 30) return "🚨 Critical HP! Rest or use recovery items immediately";
    if (hp <= 50) return "⚠️ Low HP - Consider resting before challenging";
    if (hp <= 70) return "💡 Moderate HP - Recovery recommended soon";
    return "✨ Good HP - Light recovery would help";
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-tennis-green-primary/5 to-tennis-green-accent/10 border-tennis-green-primary/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-16"></div>
                <div className="h-6 bg-muted rounded w-12"></div>
                <div className="h-2 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="bg-gradient-to-r from-tennis-green-primary/5 to-tennis-green-accent/10 border-tennis-green-primary/20 shadow-lg">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Level & XP */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-tennis-green-primary" />
              <span className="text-sm font-medium text-tennis-green-dark">Level {level}</span>
            </div>
            <Progress 
              value={xpProgress} 
              className="h-2 bg-tennis-green-subtle" 
            />
            <p className="text-xs text-tennis-green-medium">
              {currentXP}/{currentXP + xpToNext} XP
            </p>
          </div>

          {/* Tokens */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-tennis-yellow" />
              <span className="text-sm font-medium text-tennis-green-dark">Tokens</span>
            </div>
            <p className="text-lg font-bold text-tennis-yellow">{tokens}</p>
            <p className="text-xs text-tennis-green-medium">Available</p>
          </div>

          {/* HP */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-hp-red" />
              <span className="text-sm font-medium text-tennis-green-dark">Health</span>
              {recentHPLoss > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="destructive" className="text-xs px-1 py-0">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      -{recentHPLoss}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Recent HP loss from session</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {needsRecovery && (
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{getRecoveryRecommendation()}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <Progress 
              value={hpProgress} 
              className="h-2 bg-tennis-green-subtle" 
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-tennis-green-medium">
                {hp}/{maxHP} HP
              </p>
              {hpStatus === 'critical' && (
                <Badge variant="destructive" className="text-xs">Critical</Badge>
              )}
              {hpStatus === 'low' && (
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">Low</Badge>
              )}
            </div>
          </div>

          {/* Win Rate */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-tennis-green-primary" />
              <span className="text-sm font-medium text-tennis-green-dark">Win Rate</span>
            </div>
            <p className="text-lg font-bold text-tennis-green-primary">{winRate}%</p>
            <p className="text-xs text-tennis-green-medium">
              {matchesWon}/{totalMatches} wins
            </p>
          </div>
        </div>
        
        {/* Recovery Recommendation Banner */}
        {needsRecovery && (
          <div className="mt-4 pt-4 border-t border-tennis-green-primary/10">
            <div className="flex items-start gap-2">
              <Heart className="h-4 w-4 text-hp-red mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">Recovery Tip</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getRecoveryRecommendation()}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}