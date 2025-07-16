import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Heart, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DashboardHeaderProps {
  tokens: number;
  xp: number;
  level: number;
  hp: number;
  maxHp: number;
  xpToNextLevel: number;
}

export function DashboardHeader({ tokens, xp, level, hp, maxHp, xpToNextLevel }: DashboardHeaderProps) {
  const hpPercentage = Math.round((hp / maxHp) * 100);
  const xpForCurrentLevel = xp;
  const xpNeededForNext = xpForCurrentLevel + xpToNextLevel;
  const xpProgressPercentage = xpNeededForNext > 0 ? (xpForCurrentLevel / xpNeededForNext) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {/* Level Card with XP Progress */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-400/90 to-orange-500/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/20 to-transparent"></div>
        <CardContent className="p-6 text-center relative z-10">
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mx-auto mb-3 shadow-lg">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{level}</p>
          <p className="text-sm text-white/90 mb-3">Level</p>
          {xpToNextLevel > 0 && (
            <div className="space-y-2">
              <Progress value={xpProgressPercentage} className="h-2 bg-white/20" indicatorClassName="bg-white" />
              <p className="text-xs text-white/80">{xpToNextLevel} XP to next level</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* HP Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-red-400/90 to-pink-500/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-red-300/20 to-transparent"></div>
        <CardContent className="p-6 text-center relative z-10">
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mx-auto mb-3 shadow-lg">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{hpPercentage}%</p>
          <p className="text-sm text-white/90 mb-3">HP</p>
          <Progress value={hpPercentage} className="h-2 bg-white/20" indicatorClassName="bg-white" />
        </CardContent>
      </Card>

      {/* Tokens Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-400/90 to-teal-500/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-300/20 to-transparent"></div>
        <CardContent className="p-6 text-center relative z-10">
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mx-auto mb-3 shadow-lg">
            <Target className="h-6 w-6 text-white" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{tokens}</p>
          <p className="text-sm text-white/90">Tokens</p>
        </CardContent>
      </Card>
    </div>
  );
}