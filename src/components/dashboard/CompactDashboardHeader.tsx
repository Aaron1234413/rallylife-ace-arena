import React from 'react';
import { Trophy, Heart, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CompactDashboardHeaderProps {
  tokens: number;
  xp: number;
  level: number;
  hp: number;
  maxHp: number;
  xpToNextLevel: number;
}

export function CompactDashboardHeader({ tokens, xp, level, hp, maxHp, xpToNextLevel }: CompactDashboardHeaderProps) {
  const hpPercentage = Math.round((hp / maxHp) * 100);
  const xpForCurrentLevel = xp;
  const xpNeededForNext = xpForCurrentLevel + xpToNextLevel;
  const xpProgressPercentage = xpNeededForNext > 0 ? (xpForCurrentLevel / xpNeededForNext) * 100 : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        {/* Level */}
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
            <Trophy className="h-4 w-4 text-yellow-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">{level}</span>
              <span className="text-xs text-muted-foreground">LVL</span>
            </div>
            {xpToNextLevel > 0 && (
              <Progress value={xpProgressPercentage} className="h-1 w-16" />
            )}
          </div>
        </div>

        {/* HP */}
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
            <Heart className="h-4 w-4 text-red-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">{hpPercentage}%</span>
              <span className="text-xs text-muted-foreground">HP</span>
            </div>
            <Progress value={hpPercentage} className="h-1 w-16" />
          </div>
        </div>

        {/* Tokens */}
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center justify-center w-8 h-8 bg-tennis-green-light rounded-full">
            <Target className="h-4 w-4 text-tennis-green-dark" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">{tokens}</span>
              <span className="text-xs text-muted-foreground">TKN</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}