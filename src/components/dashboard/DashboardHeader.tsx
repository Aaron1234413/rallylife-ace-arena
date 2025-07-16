import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Trophy, Coins } from 'lucide-react';

interface DashboardHeaderProps {
  tokens: number;
  xp: number;
  level: number;
  hp: number;
  maxHp: number;
}

export function DashboardHeader({ tokens, xp, level, hp, maxHp }: DashboardHeaderProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {/* HP Card */}
      <Card className="bg-gradient-to-br from-pink-500 to-pink-600 border-none shadow-lg">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full mx-auto mb-2">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <p className="text-2xl font-bold text-white">{hp}</p>
          <p className="text-xs text-white/80">Health Points</p>
        </CardContent>
      </Card>

      {/* XP/Level Card */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none shadow-lg">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full mx-auto mb-2">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <p className="text-2xl font-bold text-white">{level}</p>
          <p className="text-xs text-white/80">Level</p>
        </CardContent>
      </Card>

      {/* Tokens Card */}
      <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 border-none shadow-lg">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full mx-auto mb-2">
            <Coins className="h-5 w-5 text-white" />
          </div>
          <p className="text-2xl font-bold text-white">{tokens}</p>
          <p className="text-xs text-white/80">Tokens</p>
        </CardContent>
      </Card>
    </div>
  );
}