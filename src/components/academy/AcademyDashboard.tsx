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

import { DailyCheckIn } from './DailyCheckIn';
import { AcademyMilestones } from './AcademyMilestones';
import { KnowledgePointsDisplay } from './KnowledgePointsDisplay';
import { TennisFactCard } from './TennisFactCard';
import { AcademyVitals } from './AcademyVitals';
import { ChallengeOfTheDay } from './ChallengeOfTheDay';
import { getTodaysTopic } from '@/utils/TopicRotationSystem';
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
  const todaysTopic = getTodaysTopic();
  
  const handleCheckInComplete = () => {
    // Refresh the component to reflect new data
    setRefreshKey(prev => prev + 1);
  };

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
        <div className="text-right">
          <Badge variant="secondary" className="bg-tennis-green-primary text-white">
            Level {progress.level} • {progress.level_name}
          </Badge>
        </div>
      </div>

      {/* Tennis Fact - Directly under header */}
      <TennisFactCard />
      
      {/* Academy Vitals */}
      <AcademyVitals progress={progress} />
      
      {/* Single column layout */}
      <div className="space-y-6">
        
        {/* Daily Check-In */}
        <DailyCheckIn
          currentStreak={currentStreak}
          hasCheckedInToday={hasCheckedInToday}
          onCheckInComplete={handleCheckInComplete}
        />
        
        {/* Daily Quiz */}
        <Card className="bg-gradient-to-r from-tennis-green-primary to-tennis-green-accent border-tennis-green-light shadow-lg animate-scale-in">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">{todaysTopic.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Daily Tennis Quiz</h3>
                  <p className="text-white/90 text-sm">{todaysTopic.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30 text-xs">
                  <Coins className="h-3 w-3 mr-1" />
                  +5 Tokens
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 text-xs">
                  +50 XP
                </Badge>
              </div>
              
              <Button
                onClick={onStartQuiz}
                className="w-full bg-white text-tennis-green-primary hover:bg-white/90 font-semibold"
                disabled={progress.daily_tokens_earned >= 10}
              >
                {progress.daily_tokens_earned >= 10 ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completed Today
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Start Quiz
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Challenge of the Day */}
        <ChallengeOfTheDay />
        
        {/* Next Milestone */}
        <AcademyMilestones progress={progress} />
      </div>
    </div>
  );
};