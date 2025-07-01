import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Target, 
  Trophy, 
  Calendar,
  Zap,
  Brain,
  TrendingUp
} from 'lucide-react';
import { AcademyTokenDisplay } from './AcademyTokenDisplay';
import { AcademyProgressTracker } from './AcademyProgressTracker';
import { AcademyProgress } from '@/hooks/useAcademyProgress';

interface AcademyDashboardProps {
  progress: AcademyProgress;
  onStartQuiz: (type: 'daily' | 'practice') => void;
}

export const AcademyDashboard: React.FC<AcademyDashboardProps> = ({
  progress,
  onStartQuiz
}) => {
  const streakDays = Math.floor((Date.now() - new Date(progress.lastActivity).getTime()) / (1000 * 60 * 60 * 24));
  const isToday = new Date().toDateString() === new Date(progress.lastActivity).toDateString();
  const currentStreak = isToday ? progress.dailyStreak : 0;

  return (
    <div className="min-h-screen bg-tennis-green-bg p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 bg-tennis-green-primary rounded-full flex items-center justify-center">
            <span className="text-white text-xl">🎾</span>
          </div>
          <h1 className="text-3xl font-bold text-tennis-green-dark">RAKO Academy</h1>
        </div>
        <p className="text-tennis-green-medium">Master tennis knowledge. Earn rewards. Climb the ranks.</p>
      </div>

      {/* Welcome & Level Display */}
      <Card className="bg-white/90 backdrop-blur-sm border-tennis-green-light/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-tennis-green-dark">
                Welcome back, Scholar!
              </h2>
              <p className="text-tennis-green-medium mt-1">
                You're on a roll! Keep up the great work.
              </p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="mb-2 bg-tennis-green-primary text-white">
                Level {progress.level}
              </Badge>
              <p className="text-sm text-tennis-green-dark font-medium">
                {progress.levelName}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Display & Progress */}
      <div className="grid gap-4 md:grid-cols-2">
        <AcademyTokenDisplay 
          dailyTokensEarned={progress.dailyTokensEarned}
          dailyTokenLimit={10}
        />
        <AcademyProgressTracker progress={progress} />
      </div>

      {/* Daily Streak */}
      <Card className="bg-white/90 backdrop-blur-sm border-tennis-green-light/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-tennis-green-dark">Daily Streak</p>
                <p className="text-sm text-tennis-green-medium">
                  {currentStreak > 0 ? `${currentStreak} days strong!` : 'Start your streak today'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">{currentStreak}</div>
              <div className="text-xs text-tennis-green-medium">🔥</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Daily Drill */}
        <Card className="bg-white/90 backdrop-blur-sm border-tennis-green-light/20 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
              <Target className="h-5 w-5 text-tennis-green-primary" />
              Daily Drill
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-tennis-green-medium">
                Complete today's focused 5-question drill
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-tennis-green-dark">Reward:</span>
                <Badge variant="outline" className="text-xs">+3 tokens</Badge>
              </div>
            </div>
            <Button 
              onClick={() => onStartQuiz('daily')}
              className="w-full bg-tennis-green-primary hover:bg-tennis-green-dark"
              disabled={progress.dailyTokensEarned >= 10}
            >
              <Zap className="h-4 w-4 mr-2" />
              {progress.dailyTokensEarned >= 10 ? 'Daily Limit Reached' : 'Start Daily Drill'}
            </Button>
          </CardContent>
        </Card>

        {/* Practice Quiz */}
        <Card className="bg-white/90 backdrop-blur-sm border-tennis-green-light/20 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
              <Brain className="h-5 w-5 text-blue-600" />
              Practice Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-tennis-green-medium">
                Test your knowledge with unlimited practice
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-tennis-green-dark">Reward:</span>
                <Badge variant="outline" className="text-xs">+1 token</Badge>
              </div>
            </div>
            <Button 
              onClick={() => onStartQuiz('practice')}
              variant="outline"
              className="w-full border-tennis-green-primary text-tennis-green-primary hover:bg-tennis-green-primary hover:text-white"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Practice Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Academy Progress Bar */}
      <Card className="bg-white/90 backdrop-blur-sm border-tennis-green-light/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <TrendingUp className="h-5 w-5 text-tennis-green-primary" />
            Academy Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-tennis-green-medium">Overall Progress</span>
              <span className="font-medium text-tennis-green-dark">
                Level {progress.level} • {progress.totalXP} XP
              </span>
            </div>
            <Progress 
              value={(progress.totalXP % 100)} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-tennis-green-medium">
              <span>Current Level</span>
              <span>{100 - (progress.totalXP % 100)} XP to next level</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <div className="text-lg font-bold text-tennis-green-dark">{progress.quizzesCompleted}</div>
              <div className="text-xs text-tennis-green-medium">Quizzes Completed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{currentStreak}</div>
              <div className="text-xs text-tennis-green-medium">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{Math.floor(progress.totalXP / 100)}</div>
              <div className="text-xs text-tennis-green-medium">Levels Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};