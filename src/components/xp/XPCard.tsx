
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Trophy } from 'lucide-react';
import { XPDisplay } from './XPDisplay';

interface XPCardProps {
  currentLevel: number;
  currentXP: number;
  totalXPEarned: number;
  xpToNextLevel: number;
  className?: string;
}

export function XPCard({ 
  currentLevel,
  currentXP,
  totalXPEarned,
  xpToNextLevel,
  className 
}: XPCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
          Experience Points
        </CardTitle>
      </CardHeader>
      <CardContent>
        <XPDisplay
          currentLevel={currentLevel}
          currentXP={currentXP}
          xpToNextLevel={xpToNextLevel}
          totalXPEarned={totalXPEarned}
          size="large"
          showLevel={true}
          showProgress={true}
        />
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-yellow-600" />
            <span className="font-semibold text-yellow-800">Level {currentLevel}</span>
          </div>
          <p className="text-sm text-yellow-700">
            Keep earning XP by playing matches, training, and engaging with the community!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
