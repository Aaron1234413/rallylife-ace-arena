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
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-tennis-green-primary rounded-full flex items-center justify-center">
            <span className="text-white text-xl">🎾</span>
          </div>
          <h1 className="text-3xl font-bold text-tennis-green-dark">RAKO Academy</h1>
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
        
        {/* Challenge of the Day */}
        <ChallengeOfTheDay />
        
        {/* Next Milestone */}
        <AcademyMilestones progress={progress} />
      </div>
    </div>
  );
};