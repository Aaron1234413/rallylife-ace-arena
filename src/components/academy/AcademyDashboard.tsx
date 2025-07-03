import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Calendar,
  Zap,
  TrendingUp,
  Coins,
  CheckCircle
} from 'lucide-react';
import { AcademyTokenDisplay } from './AcademyTokenDisplay';
import { DailyCheckIn } from './DailyCheckIn';
import { AcademyMilestones } from './AcademyMilestones';
import { KnowledgePointsDisplay } from './KnowledgePointsDisplay';
import { AcademyProgress } from '@/hooks/useAcademyProgressDB';

interface AcademyDashboardProps {
  progress: AcademyProgress;
  onStartQuiz: () => void;
}

export const AcademyDashboard: React.FC<AcademyDashboardProps> = ({
  progress,
  onStartQuiz
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Check if user has checked in today
  const today = new Date().toDateString();
  const lastCheckIn = (progress as any).last_check_in_date;
  const hasCheckedInToday = lastCheckIn && new Date(lastCheckIn).toDateString() === today;
  
  const consecutiveCheckIns = (progress as any).consecutive_check_ins || 0;
  const knowledgePoints = (progress as any).knowledge_points || 0;
  const knowledgeLevel = (progress as any).knowledge_level || 1;
  const handleCheckInComplete = () => {
    // Refresh the component to reflect new data
    setRefreshKey(prev => prev + 1);
  };

  const streakDays = Math.floor((Date.now() - new Date(progress.last_activity).getTime()) / (1000 * 60 * 60 * 24));
  const isToday = new Date().toDateString() === new Date(progress.last_activity).toDateString();
  const currentStreak = consecutiveCheckIns;

  return (
    <div className="min-h-screen bg-tennis-green-bg p-4 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 bg-tennis-green-primary rounded-full flex items-center justify-center">
            <span className="text-white text-xl">🎾</span>
          </div>
          <h1 className="text-3xl font-bold text-tennis-green-dark">Tennis Knowledge Hub</h1>
        </div>
        <p className="text-tennis-green-medium">Master tennis knowledge. Earn tokens. Build your streak.</p>
      </div>

      {/* Welcome & Level Display */}
      <Card className="bg-white/90 backdrop-blur-sm border-tennis-green-light/20 animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-tennis-green-dark">
                Welcome back, Scholar!
              </h2>
              <p className="text-tennis-green-medium mt-1">
                Ready for today's tennis knowledge challenge?
              </p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="mb-2 bg-tennis-green-primary text-white">
                Level {progress.level}
              </Badge>
              <p className="text-sm text-tennis-green-dark font-medium">
                {progress.level_name}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Check-in and Token Display */}
      <div className="grid gap-4 md:grid-cols-2">
        <DailyCheckIn
          currentStreak={currentStreak}
          hasCheckedInToday={hasCheckedInToday}
          onCheckInComplete={handleCheckInComplete}
        />
        
        <AcademyTokenDisplay 
          dailyTokensEarned={progress.daily_tokens_earned}
          dailyTokenLimit={10}
        />
      </div>

      {/* Knowledge Points and Daily Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <KnowledgePointsDisplay
          knowledgePoints={knowledgePoints}
          knowledgeLevel={knowledgeLevel}
        />

        {/* Daily Streak */}
        <Card className="bg-white/90 backdrop-blur-sm border-tennis-green-light/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-tennis-green-dark">Check-in Streak</p>
                <p className="text-sm text-tennis-green-medium">
                  {currentStreak > 0 ? `${currentStreak} days 🔥` : 'Start today!'}
                </p>
              </div>
            </div>
            <div className="text-right mt-2">
              <div className="text-2xl font-bold text-orange-600">{currentStreak}</div>
            </div>
          </CardContent>
        </Card>

        {/* Level Progress */}
        <Card className="bg-white/90 backdrop-blur-sm border-tennis-green-light/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-tennis-green-dark">Level Progress</p>
                <p className="text-sm text-tennis-green-medium">
                  {progress.total_xp} total XP
                </p>
              </div>
            </div>
            <Progress 
              value={(progress.total_xp % 100)} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-tennis-green-medium mt-1">
              <span>Level {progress.level}</span>
              <span>{100 - (progress.total_xp % 100)} XP to next</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academy Milestones */}
      <AcademyMilestones progress={progress} />

      {/* Main Daily Quiz Card */}
      <Card className="bg-gradient-to-r from-tennis-green-primary to-tennis-green-accent border-tennis-green-light shadow-lg animate-scale-in">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Daily Tennis Quiz</h3>
                <p className="text-white/90 mb-2">
                  5 questions • 3 minutes • Earn tokens & XP
                </p>
                <div className="flex items-center gap-3">
                  <Badge className="bg-white/20 text-white border-white/30">
                    <Coins className="h-3 w-3 mr-1" />
                    +5 Tokens
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30">
                    +50 XP
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              onClick={onStartQuiz}
              size="lg"
              className="bg-white text-tennis-green-primary hover:bg-white/90 font-semibold"
              disabled={progress.daily_tokens_earned >= 10}
            >
              {progress.daily_tokens_earned >= 10 ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Completed Today
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Start Quiz
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <Card className="bg-white/90 backdrop-blur-sm border-tennis-green-light/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <TrendingUp className="h-5 w-5 text-tennis-green-primary" />
            Today's Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-tennis-green-dark">{progress.quizzes_completed}</div>
              <div className="text-xs text-tennis-green-medium">Total Quizzes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{currentStreak}</div>
              <div className="text-xs text-tennis-green-medium">Check-in Streak</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{knowledgePoints}</div>
              <div className="text-xs text-tennis-green-medium">Knowledge Points</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{Math.floor(progress.total_xp / 100)}</div>
              <div className="text-xs text-tennis-green-medium">Levels Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            {!hasCheckedInToday ? (
              <>
                <p className="text-lg font-medium text-gray-800">🎯 Ready to Learn?</p>
                <p className="text-gray-600">Check in and complete today's quiz to earn rewards!</p>
              </>
            ) : currentStreak < 3 ? (
              <>
                <p className="text-lg font-medium text-gray-800">🔥 Great Start!</p>
                <p className="text-gray-600">Keep checking in to build your learning streak!</p>
              </>
            ) : currentStreak < 7 ? (
              <>
                <p className="text-lg font-medium text-gray-800">⚡ You're on Fire!</p>
                <p className="text-gray-600">Amazing consistency! You're building great habits.</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-800">🏆 Knowledge Master!</p>
                <p className="text-gray-600">Incredible streak! You're becoming a tennis expert.</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};