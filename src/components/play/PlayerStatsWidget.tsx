import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Coins, Trophy, Heart, Zap } from 'lucide-react';

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
  loading = false
}: PlayerStatsWidgetProps) {
  const xpProgress = xpToNext > 0 ? (currentXP / (currentXP + xpToNext)) * 100 : 100;
  const hpProgress = (hp / maxHP) * 100;
  const winRate = totalMatches > 0 ? Math.round((matchesWon / totalMatches) * 100) : 0;

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
            </div>
            <Progress 
              value={hpProgress} 
              className="h-2 bg-tennis-green-subtle"
            />
            <p className="text-xs text-tennis-green-medium">
              {hp}/{maxHP} HP
            </p>
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
  );
}