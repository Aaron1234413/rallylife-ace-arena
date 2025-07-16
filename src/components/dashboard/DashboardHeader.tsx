import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Zap, Target } from 'lucide-react';

interface DashboardHeaderProps {
  tokens: number;
  xp: number;
  level: number;
  hp: number;
  maxHp: number;
}

export function DashboardHeader({ tokens, xp, level, hp, maxHp }: DashboardHeaderProps) {
  const hpPercentage = Math.round((hp / maxHp) * 100);

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-tennis-green-light/20 rounded-full mx-auto mb-2">
            <Trophy className="h-5 w-5 text-tennis-green-medium" />
          </div>
          <p className="text-2xl font-bold text-tennis-green-dark">{level}</p>
          <p className="text-xs text-tennis-green-dark/70">Level</p>
        </CardContent>
      </Card>

      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-tennis-green-light/20 rounded-full mx-auto mb-2">
            <Zap className="h-5 w-5 text-tennis-green-medium" />
          </div>
          <p className="text-2xl font-bold text-tennis-green-dark">{hpPercentage}%</p>
          <p className="text-xs text-tennis-green-dark/70">Energy</p>
        </CardContent>
      </Card>

      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-tennis-green-light/20 rounded-full mx-auto mb-2">
            <Target className="h-5 w-5 text-tennis-green-medium" />
          </div>
          <p className="text-2xl font-bold text-tennis-green-dark">{tokens}</p>
          <p className="text-xs text-tennis-green-dark/70">Tokens</p>
        </CardContent>
      </Card>
    </div>
  );
}