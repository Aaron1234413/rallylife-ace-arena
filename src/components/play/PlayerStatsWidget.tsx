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
}

export function PlayerStatsWidget({ 
  level, 
  currentXP, 
  xpToNext, 
  tokens, 
  hp, 
  maxHP, 
  matchesWon, 
  totalMatches 
}: PlayerStatsWidgetProps) {
  const xpProgress = xpToNext > 0 ? (currentXP / (currentXP + xpToNext)) * 100 : 100;
  const hpProgress = (hp / maxHP) * 100;
  const winRate = totalMatches > 0 ? Math.round((matchesWon / totalMatches) * 100) : 0;

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Level & XP */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Level {level}</span>
            </div>
            <Progress value={xpProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {currentXP}/{currentXP + xpToNext} XP
            </p>
          </div>

          {/* Tokens */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Tokens</span>
            </div>
            <p className="text-lg font-bold text-yellow-600">{tokens}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </div>

          {/* HP */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Health</span>
            </div>
            <Progress value={hpProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {hp}/{maxHP} HP
            </p>
          </div>

          {/* Win Rate */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Win Rate</span>
            </div>
            <p className="text-lg font-bold text-primary">{winRate}%</p>
            <p className="text-xs text-muted-foreground">
              {matchesWon}/{totalMatches} wins
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}