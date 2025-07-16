import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Trophy } from 'lucide-react';
import { useLevelingSystem } from '@/hooks/useLevelingSystem';

interface XPProgressProps {
  currentXP: number;
  level: number;
  className?: string;
  showDetails?: boolean;
}

export function XPProgress({ currentXP, level, className, showDetails = true }: XPProgressProps) {
  const { getXPProgress } = useLevelingSystem();
  
  const progress = getXPProgress(currentXP, level);

  if (!showDetails) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="font-medium">Level {level}</span>
          <span className="text-muted-foreground">
            {progress.xpInLevel}/{progress.xpRequiredForLevel} XP
          </span>
        </div>
        <Progress value={progress.progressPercentage} className="h-2" />
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
          Experience Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Level Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-tennis-green-primary" />
            <span className="text-2xl font-bold text-tennis-green-dark">
              Level {level}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total XP</p>
            <p className="font-semibold">{currentXP.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Level {level} Progress
            </span>
            <span className="font-medium">
              {progress.xpInLevel.toLocaleString()}/{progress.xpRequiredForLevel.toLocaleString()} XP
            </span>
          </div>
          <Progress value={progress.progressPercentage} className="h-3" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Level {level}</span>
            <span>{progress.xpToNextLevel.toLocaleString()} XP to Level {level + 1}</span>
          </div>
        </div>

        {/* Next Level Preview */}
        <div className="p-3 bg-tennis-green-bg/30 rounded-lg border border-tennis-green-light/20">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-4 w-4 text-tennis-green-medium" />
            <span className="font-medium text-tennis-green-dark">Next Level</span>
          </div>
          <p className="text-sm text-tennis-green-dark/70">
            Reach level {level + 1} to unlock new features and rewards!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}