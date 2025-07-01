import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Star, Award } from 'lucide-react';
import { AcademyProgress } from '@/hooks/useAcademyProgress';

interface AcademyProgressTrackerProps {
  progress: AcademyProgress;
}

const LEVEL_NAMES = [
  { level: 1, name: 'Rookie', icon: '🎾', color: 'bg-gray-100 text-gray-700' },
  { level: 2, name: 'Court Cadet', icon: '⚡', color: 'bg-blue-100 text-blue-700' },
  { level: 3, name: 'Baseline Scholar', icon: '📚', color: 'bg-green-100 text-green-700' },
  { level: 4, name: 'Net Navigator', icon: '🧭', color: 'bg-purple-100 text-purple-700' },
  { level: 5, name: 'Serve Specialist', icon: '🎯', color: 'bg-orange-100 text-orange-700' },
  { level: 6, name: 'Rally Expert', icon: '🏆', color: 'bg-red-100 text-red-700' },
  { level: 7, name: 'Tennis Master', icon: '👑', color: 'bg-yellow-100 text-yellow-700' },
];

export const AcademyProgressTracker: React.FC<AcademyProgressTrackerProps> = ({
  progress
}) => {
  const currentLevelInfo = LEVEL_NAMES.find(l => l.level === progress.level) || LEVEL_NAMES[0];
  const nextLevelInfo = LEVEL_NAMES.find(l => l.level === progress.level + 1);
  
  // Calculate XP within current level (assuming 100 XP per level)
  const xpForCurrentLevel = (progress.level - 1) * 100;
  const xpForNextLevel = progress.level * 100;
  const currentLevelXP = progress.totalXP - xpForCurrentLevel;
  const xpNeededForNext = xpForNextLevel - progress.totalXP;
  const progressToNext = (currentLevelXP / 100) * 100;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-tennis-green-light/20">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-tennis-green-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-tennis-green-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-tennis-green-dark">Level Progress</h3>
              <p className="text-sm text-tennis-green-medium">Your academy journey</p>
            </div>
          </div>

          {/* Current Level */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{currentLevelInfo.icon}</span>
              <div>
                <div className="text-2xl font-bold text-tennis-green-dark">
                  Level {progress.level}
                </div>
                <Badge className={currentLevelInfo.color}>
                  {currentLevelInfo.name}
                </Badge>
              </div>
            </div>
          </div>

          {/* Progress to Next Level */}
          {nextLevelInfo && (
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-tennis-green-medium">Progress to {nextLevelInfo.name}</span>
                  <span className="font-medium text-tennis-green-dark">
                    {currentLevelXP}/100 XP
                  </span>
                </div>
                <Progress value={progressToNext} className="h-2" />
                <div className="text-center text-xs text-tennis-green-medium">
                  {xpNeededForNext} XP needed for next level
                </div>
              </div>
            </div>
          )}

          {/* Level Preview */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {LEVEL_NAMES.slice(Math.max(0, progress.level - 2), progress.level + 1).map((levelInfo) => (
              <div
                key={levelInfo.level}
                className={`text-center p-2 rounded-lg ${
                  levelInfo.level === progress.level
                    ? 'bg-tennis-green-primary/10 border border-tennis-green-primary/20'
                    : levelInfo.level < progress.level
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="text-lg">{levelInfo.icon}</div>
                <div className="text-xs font-medium text-tennis-green-dark">
                  L{levelInfo.level}
                </div>
                <div className="text-xs text-tennis-green-medium truncate">
                  {levelInfo.name}
                </div>
              </div>
            ))}
          </div>

          {/* Achievement Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-tennis-green-dark">
                  {progress.totalXP}
                </span>
              </div>
              <div className="text-xs text-tennis-green-medium">Total XP</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Award className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-tennis-green-dark">
                  {progress.quizzesCompleted}
                </span>
              </div>
              <div className="text-xs text-tennis-green-medium">Quizzes Done</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};