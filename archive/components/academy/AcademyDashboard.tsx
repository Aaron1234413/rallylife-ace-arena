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
    <div className="min-h-screen bg-tennis-green-bg">
      {/* Mobile-optimized container */}
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        {/* Compact Mobile Header */}
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-tennis-green-primary rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-lg sm:text-xl">🎾</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-tennis-green-dark orbitron-heading">
              RAKO Academy
            </h1>
          </div>
        </div>

        {/* Tennis Fact - Mobile optimized */}
        <div className="animate-fade-in">
          <TennisFactCard />
        </div>
        
        {/* Academy Vitals - Enhanced for mobile */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <AcademyVitals progress={progress} />
        </div>
        
        {/* Main Content - Mobile-first layout */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Daily Check-In - Priority placement */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <DailyCheckIn
              currentStreak={currentStreak}
              hasCheckedInToday={hasCheckedInToday}
              onCheckInComplete={handleCheckInComplete}
            />
          </div>
          
          {/* Challenge of the Day - Mobile enhanced */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <ChallengeOfTheDay />
          </div>
          
          {/* Milestones - Optimized layout */}
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <AcademyMilestones progress={progress} />
          </div>
        </div>

        {/* Mobile bottom spacing */}
        <div className="h-4 sm:h-6"></div>
      </div>
    </div>
  );
};