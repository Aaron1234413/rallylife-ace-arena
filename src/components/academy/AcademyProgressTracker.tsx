
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AcademyProgressTrackerProps {
  currentLevel: number;
  currentXP: number;
  xpToNext: number;
}

export const AcademyProgressTracker: React.FC<AcademyProgressTrackerProps> = ({
  currentLevel,
  currentXP,
  xpToNext
}) => {
  const totalXPForLevel = currentXP + xpToNext;
  const progressPercentage = totalXPForLevel > 0 ? (currentXP / totalXPForLevel) * 100 : 0;
  
  const currentLevelName = getLevelName(currentLevel);
  const nextLevelName = getLevelName(currentLevel + 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
          <Trophy className="h-5 w-5" />
          Academy Level Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Level Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-tennis-green-dark rounded-full flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-300 fill-current" />
            </div>
            <div>
              <div className="font-semibold text-tennis-green-dark">
                {currentLevelName}
              </div>
              <div className="text-sm text-gray-600">
                Level {currentLevel} of 7
              </div>
            </div>
          </div>
          <Badge className="bg-tennis-green-light text-tennis-green-dark">
            {currentXP} XP
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress to {nextLevelName}</span>
            <span className="font-medium">{currentXP}/{totalXPForLevel} XP</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-3"
            indicatorClassName="bg-tennis-green-medium"
          />
          <div className="text-xs text-gray-500 text-center">
            {xpToNext} XP needed for next level
          </div>
        </div>

        {/* Level Benefits Preview */}
        <div className="bg-tennis-green-bg p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-tennis-green-dark" />
            <span className="text-sm font-medium text-tennis-green-dark">
              Next Level Unlock: {nextLevelName}
            </span>
          </div>
          <div className="text-xs text-gray-600">
            {getLevelBenefits(currentLevel + 1)}
          </div>
        </div>

        {/* Level Ladder Preview */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, index) => {
            const level = index + 1;
            const isUnlocked = level <= currentLevel;
            const isCurrent = level === currentLevel;
            
            return (
              <div
                key={level}
                className={`text-center p-2 rounded-lg text-xs ${
                  isCurrent 
                    ? 'bg-tennis-green-dark text-white' 
                    : isUnlocked
                    ? 'bg-tennis-green-light text-tennis-green-dark'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <div className="font-semibold">{level}</div>
                <div className="text-[10px] leading-tight">
                  {getLevelName(level).split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

function getLevelName(level: number): string {
  const levels = {
    1: 'Rookie',
    2: 'Court Cadet',
    3: 'Baseline Scholar',
    4: 'Net Navigator',
    5: 'Service Specialist',
    6: 'Strategy Master',
    7: 'Tennis Professor'
  };
  return levels[level as keyof typeof levels] || 'Master';
}

function getLevelBenefits(level: number): string {
  const benefits = {
    2: 'Unlock strategy questions and earn bonus tokens',
    3: 'Access to tennis history content and achievement badges',
    4: 'Advanced serving techniques and video lessons',
    5: 'Professional match analysis and expert tips',
    6: 'Coaching scenarios and tournament preparation',
    7: 'Master all tennis knowledge and unlock special content'
  };
  return benefits[level as keyof typeof benefits] || 'Complete tennis mastery!';
}
