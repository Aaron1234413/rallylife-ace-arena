import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Coins, Trophy, Heart, Zap, TrendingDown, Coffee, Activity } from 'lucide-react';

interface PlayerStatsWidgetProps {
  level: number;
  currentXP: number;
  xpToNext: number;
  tokens: number;
  hp: number;
  maxHP: number;
  matchesWon: number;
  totalMatches: number;
  recentHPActivities?: Array<{
    activity_type: string;
    hp_change: number;
    created_at: string;
    description: string;
  }>;
  loading?: boolean;
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
  recentHPActivities = [],
  loading = false
}: PlayerStatsWidgetProps) {
  const xpProgress = xpToNext > 0 ? (currentXP / (currentXP + xpToNext)) * 100 : 100;
  const hpProgress = (hp / maxHP) * 100;
  const winRate = totalMatches > 0 ? Math.round((matchesWon / totalMatches) * 100) : 0;
  
  // HP analysis
  const isLowHP = hpProgress < 30;
  const recentSessionImpacts = recentHPActivities
    .filter(activity => activity.activity_type.includes('session') || activity.activity_type === 'challenge')
    .slice(0, 3);
  
  const getHPRecoveryRecommendation = () => {
    if (hp >= maxHP) return null;
    if (hp < 20) return { urgency: 'high', message: 'Critical: Rest or use health packs immediately' };
    if (hp < 50) return { urgency: 'medium', message: 'Consider resting or light recovery activities' };
    if (hp < 80) return { urgency: 'low', message: 'Good health, light activities recommended' };
    return null;
  };
  
  const recoveryRec = getHPRecoveryRecommendation();

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
              <Heart className={`h-4 w-4 ${isLowHP ? 'text-red-500' : 'text-hp-red'}`} />
              <span className="text-sm font-medium text-tennis-green-dark">Health</span>
              {recentSessionImpacts.length > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <TrendingDown className="h-3 w-3 text-orange-500" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-medium text-xs">Recent Session Impacts:</p>
                      {recentSessionImpacts.map((activity, i) => (
                        <p key={i} className="text-xs">
                          {activity.hp_change > 0 ? '+' : ''}{activity.hp_change} HP - {activity.description}
                        </p>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <Progress 
              value={hpProgress} 
              className="h-2 bg-tennis-green-subtle"
              indicatorClassName={isLowHP ? 'bg-red-500' : undefined}
            />
            <div className="flex items-center justify-between">
              <p className={`text-xs ${isLowHP ? 'text-red-600' : 'text-tennis-green-medium'}`}>
                {hp}/{maxHP} HP
              </p>
              {isLowHP && (
                <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                  Low
                </Badge>
              )}
            </div>
            {recoveryRec && (
              <div className="flex items-start gap-1 mt-1">
                <Coffee className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className={`text-xs ${
                  recoveryRec.urgency === 'high' ? 'text-red-600' : 
                  recoveryRec.urgency === 'medium' ? 'text-orange-600' : 'text-blue-600'
                }`}>
                  {recoveryRec.message}
                </p>
              </div>
            )}
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
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}