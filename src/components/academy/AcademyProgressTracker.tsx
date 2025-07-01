import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Star, Award, Trophy, Crown, Zap, ChevronUp } from 'lucide-react';
import { AcademyProgress } from '@/hooks/useAcademyProgress';

interface AcademyProgressTrackerProps {
  progress: AcademyProgress;
}

const LEVEL_SYSTEM = [
  { level: 1, name: 'Rookie', icon: '🎾', color: 'bg-gray-100 text-gray-700', xpRequired: 0, description: 'Welcome to tennis!' },
  { level: 2, name: 'Court Cadet', icon: '⚡', color: 'bg-blue-100 text-blue-700', xpRequired: 100, description: 'Learning the basics' },
  { level: 3, name: 'Baseline Scholar', icon: '📚', color: 'bg-green-100 text-green-700', xpRequired: 250, description: 'Understanding fundamentals' },
  { level: 4, name: 'Net Navigator', icon: '🧭', color: 'bg-purple-100 text-purple-700', xpRequired: 450, description: 'Exploring advanced concepts' },
  { level: 5, name: 'Serve Specialist', icon: '🎯', color: 'bg-orange-100 text-orange-700', xpRequired: 700, description: 'Mastering techniques' },
  { level: 6, name: 'Rally Expert', icon: '🏆', color: 'bg-red-100 text-red-700', xpRequired: 1000, description: 'Elite knowledge' },
  { level: 7, name: 'Tennis Master', icon: '👑', color: 'bg-yellow-100 text-yellow-700', xpRequired: 1400, description: 'Peak expertise' },
];

export const AcademyProgressTracker: React.FC<AcademyProgressTrackerProps> = ({
  progress
}) => {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentLevelInfo = LEVEL_SYSTEM.find(l => l.level === progress.level) || LEVEL_SYSTEM[0];
  const nextLevelInfo = LEVEL_SYSTEM.find(l => l.level === progress.level + 1);
  
  const currentLevelXP = currentLevelInfo.xpRequired;
  const nextLevelXP = nextLevelInfo?.xpRequired || currentLevelXP + 200;
  const xpInCurrentLevel = progress.totalXP - currentLevelXP;
  const xpNeededForNext = nextLevelXP - currentLevelXP;
  const progressToNext = Math.max(0, Math.min(100, (xpInCurrentLevel / xpNeededForNext) * 100));

  // Level up animation effect
  useEffect(() => {
    const lastLevel = localStorage.getItem('lastKnownLevel');
    if (lastLevel && parseInt(lastLevel) < progress.level) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
    localStorage.setItem('lastKnownLevel', progress.level.toString());
  }, [progress.level]);

  return (
    <>
      {/* Level Up Celebration */}
      {showLevelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="bg-white max-w-md mx-4 animate-scale-in">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">{currentLevelInfo.icon}</div>
              <h2 className="text-3xl font-bold text-tennis-green-dark mb-2">Level Up!</h2>
              <p className="text-xl font-semibold text-tennis-green-primary mb-4">
                {currentLevelInfo.name}
              </p>
              <p className="text-tennis-green-medium mb-6">{currentLevelInfo.description}</p>
              <div className="flex justify-center">
                <Badge className="bg-tennis-green-primary text-white text-lg px-4 py-2">
                  🎉 New abilities unlocked!
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Progress Card */}
      <Card className="bg-white/90 backdrop-blur-sm border-tennis-green-light/20 overflow-hidden">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-tennis-green-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-tennis-green-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-tennis-green-dark">Academy Level</h3>
                  <p className="text-sm text-tennis-green-medium">Your learning progress</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2"
              >
                <ChevronUp className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Current Level Display */}
            <div className="text-center space-y-3">
              <div className="relative">
                <div className="text-4xl mb-2">{currentLevelInfo.icon}</div>
                <div className="text-2xl font-bold text-tennis-green-dark">
                  Level {progress.level}
                </div>
                <Badge className={`${currentLevelInfo.color} border-0`}>
                  {currentLevelInfo.name}
                </Badge>
              </div>
              
              <p className="text-sm text-tennis-green-medium italic">
                "{currentLevelInfo.description}"
              </p>
            </div>

            {/* Progress to Next Level */}
            {nextLevelInfo && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-tennis-green-medium">Next Level:</span>
                    <span className="text-sm font-medium text-tennis-green-dark">{nextLevelInfo.name}</span>
                    <span className="text-lg">{nextLevelInfo.icon}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Progress value={progressToNext} className="h-3" />
                  <div className="flex justify-between text-xs text-tennis-green-medium">
                    <span>{progress.totalXP} XP</span>
                    <span>{nextLevelXP - progress.totalXP} XP to next level</span>
                  </div>
                </div>
              </div>
            )}

            {/* Expanded View */}
            {isExpanded && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                {/* Level Progression Preview */}
                <div className="space-y-3">
                  <h4 className="font-medium text-tennis-green-dark">Level Progression</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {LEVEL_SYSTEM.slice(Math.max(0, progress.level - 2), progress.level + 4).map((levelInfo) => (
                      <div
                        key={levelInfo.level}
                        className={`text-center p-3 rounded-lg border-2 transition-all ${
                          levelInfo.level === progress.level
                            ? 'border-tennis-green-primary bg-tennis-green-primary/10 scale-105'
                            : levelInfo.level < progress.level
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-gray-50 opacity-60'
                        }`}
                      >
                        <div className="text-2xl mb-1">{levelInfo.icon}</div>
                        <div className="text-xs font-medium text-tennis-green-dark">
                          L{levelInfo.level}
                        </div>
                        <div className="text-xs text-tennis-green-medium truncate">
                          {levelInfo.name}
                        </div>
                        {levelInfo.level <= progress.level && (
                          <div className="text-xs text-green-600 mt-1">✓</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Stats */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-lg font-bold text-tennis-green-dark">
                        {progress.totalXP}
                      </span>
                    </div>
                    <div className="text-xs text-tennis-green-medium">Total XP</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Award className="h-4 w-4 text-blue-500" />
                      <span className="text-lg font-bold text-tennis-green-dark">
                        {progress.quizzesCompleted}
                      </span>
                    </div>
                    <div className="text-xs text-tennis-green-medium">Quizzes</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Trophy className="h-4 w-4 text-orange-500" />
                      <span className="text-lg font-bold text-tennis-green-dark">
                        {progress.dailyStreak}
                      </span>
                    </div>
                    <div className="text-xs text-tennis-green-medium">Day Streak</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Zap className="h-4 w-4 text-purple-500" />
                      <span className="text-lg font-bold text-tennis-green-dark">
                        {Math.floor(progress.totalXP / 50)}
                      </span>
                    </div>
                    <div className="text-xs text-tennis-green-medium">Achievements</div>
                  </div>
                </div>

                {/* Next Level Benefits */}
                {nextLevelInfo && (
                  <div className="bg-tennis-green-bg/30 rounded-lg p-4">
                    <h5 className="font-medium text-tennis-green-dark mb-2">
                      🎯 Unlock at Level {nextLevelInfo.level}:
                    </h5>
                    <ul className="text-sm text-tennis-green-medium space-y-1">
                      <li>• New quiz categories</li>
                      <li>• Advanced question types</li>
                      <li>• Bonus token multipliers</li>
                      <li>• Exclusive achievements</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};