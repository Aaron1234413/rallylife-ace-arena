
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trophy, Target, Flame, TrendingUp } from 'lucide-react';
import { TokenDisplay } from '@/components/tokens/TokenDisplay';
import { AcademyProgressTracker } from './AcademyProgressTracker';
import { AcademyTokenDisplay } from './AcademyTokenDisplay';

interface AcademyDashboardProps {
  academyData: any;
  tokenData: any;
  onStartQuiz: (category?: string) => void;
}

export const AcademyDashboard: React.FC<AcademyDashboardProps> = ({
  academyData,
  tokenData,
  onStartQuiz
}) => {
  const currentLevel = academyData?.current_level || 1;
  const levelName = getLevelName(currentLevel);
  const dailyTokensEarned = 7; // TODO: Calculate from today's activities
  const dailyStreak = 5; // TODO: Get from user data

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-tennis-green-dark flex items-center justify-center gap-2">
          🎾 RAKO Academy
        </h1>
        <p className="text-tennis-green-medium">
          Welcome back! Ready to serve up some knowledge?
        </p>
      </div>

      {/* User Status Card */}
      <Card className="bg-gradient-to-r from-tennis-green-light to-tennis-green-medium text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Welcome back!</h2>
              <p className="text-tennis-green-bg opacity-90">
                Level: {levelName} (Level {currentLevel}/7)
              </p>
            </div>
            <Trophy className="h-8 w-8 text-yellow-300" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-300" />
              <span>Streak: {dailyStreak} days</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-300" />
              <span>Today: {dailyTokensEarned}/10 tokens</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Display */}
      <AcademyTokenDisplay 
        dailyEarned={dailyTokensEarned}
        dailyLimit={10}
        totalTokens={tokenData?.regular_tokens || 0}
      />

      {/* Progress Tracker */}
      <AcademyProgressTracker 
        currentLevel={currentLevel}
        currentXP={academyData?.current_xp || 0}
        xpToNext={academyData?.xp_to_next || 100}
      />

      {/* Quick Access Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Daily Drill */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
              <BookOpen className="h-5 w-5" />
              Daily Drill
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-tennis-green-bg p-3 rounded-lg">
              <h4 className="font-semibold text-tennis-green-dark">
                Tennis Rules Basics
              </h4>
              <p className="text-sm text-gray-600">
                Master the fundamentals of tennis scoring and rules
              </p>
            </div>
            <Button 
              onClick={() => onStartQuiz('rules')}
              className="w-full bg-tennis-green-dark hover:bg-tennis-green-medium"
            >
              Start Drill - 5 tokens
            </Button>
          </CardContent>
        </Card>

        {/* Quick Quiz */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
              <Target className="h-5 w-5" />
              Quick Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-tennis-yellow-light p-3 rounded-lg">
              <h4 className="font-semibold text-tennis-green-dark">
                Random Tennis Trivia
              </h4>
              <p className="text-sm text-gray-600">
                Test your knowledge with surprise questions
              </p>
            </div>
            <Button 
              onClick={() => onStartQuiz()}
              variant="outline"
              className="w-full border-tennis-green-dark text-tennis-green-dark hover:bg-tennis-green-light"
            >
              Play Now - 1-3 tokens
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Academy Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <TrendingUp className="h-5 w-5" />
            Academy Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress to next level</span>
              <Badge variant="secondary">65% Complete</Badge>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-tennis-green-medium transition-all duration-300"
                style={{ width: '65%' }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Current: {levelName}</span>
              <span>Next: {getLevelName(currentLevel + 1)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
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
  return levels[level as keyof typeof levels] || 'Unknown';
}
