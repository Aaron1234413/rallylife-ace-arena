import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain,
  Trophy,
  Coins,
  Star
} from 'lucide-react';
import { AcademyProgress } from '@/hooks/useAcademyProgressDB';

interface AcademyVitalsProps {
  progress: AcademyProgress;
}

export const AcademyVitals: React.FC<AcademyVitalsProps> = ({ progress }) => {
  const knowledgePoints = (progress as any).knowledge_points || 0;
  const knowledgeLevel = (progress as any).knowledge_level || 1;
  const currentLevel = progress.level;
  const dailyTokensEarned = progress.daily_tokens_earned;
  
  // Calculate knowledge points needed for next level
  const nextKnowledgeLevel = knowledgeLevel + 1;
  const pointsForCurrentLevel = (knowledgeLevel - 1) * 100; // Simple progression
  const pointsForNextLevel = knowledgeLevel * 100;
  const progressToNextKnowledgeLevel = ((knowledgePoints - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100;
  
  // Daily token progress
  const dailyTokenLimit = 10;
  const tokenProgress = (dailyTokensEarned / dailyTokenLimit) * 100;

  return (
    <Card className="bg-gradient-to-r from-tennis-green-primary/10 to-tennis-green-accent/10 border-tennis-green-light/20 shadow-lg">
      <CardContent className="p-4 sm:p-6">
        {/* Mobile: Single column stack / Desktop: 3 columns */}
        <div className="flex flex-col sm:grid sm:grid-cols-3 gap-4 sm:gap-6 items-center">
          
          {/* Center: Current Level (Most prominent on mobile) */}
          <div className="text-center space-y-2 sm:order-2 w-full">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-tennis-green-primary to-tennis-green-accent rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <Badge 
                variant="secondary" 
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-tennis-green-primary text-white text-xs px-2 py-1"
              >
                Level {currentLevel}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-lg sm:text-xl font-bold text-tennis-green-dark orbitron-heading">
                {progress.level_name}
              </div>
              <div className="text-xs sm:text-sm text-tennis-green-medium poppins-body">
                {progress.quizzes_completed} quizzes completed
              </div>
            </div>
          </div>

          {/* Left: Knowledge Points (Mobile-optimized) */}
          <div className="text-center space-y-2 sm:order-1 w-full">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-tennis-green-primary" />
              <span className="text-xs sm:text-sm font-medium text-tennis-green-dark poppins-body">
                Knowledge Points
              </span>
            </div>
            <div className="space-y-2">
              <div className="text-xl sm:text-2xl font-bold text-tennis-green-dark orbitron-heading">
                {knowledgePoints}
              </div>
              <div className="text-xs sm:text-sm text-tennis-green-medium">Level {knowledgeLevel}</div>
              <div className="w-full max-w-24 sm:max-w-full mx-auto">
                <Progress 
                  value={Math.max(0, Math.min(100, progressToNextKnowledgeLevel))} 
                  className="h-2"
                />
              </div>
              <div className="text-xs text-tennis-green-medium">
                {Math.max(0, pointsForNextLevel - knowledgePoints)} to Level {nextKnowledgeLevel}
              </div>
            </div>
          </div>

          {/* Right: Tokens (Mobile-optimized) */}
          <div className="text-center space-y-2 sm:order-3 w-full">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              <span className="text-xs sm:text-sm font-medium text-tennis-green-dark poppins-body">
                Daily Tokens
              </span>
            </div>
            <div className="space-y-2">
              <div className="text-xl sm:text-2xl font-bold text-tennis-green-dark orbitron-heading">
                {dailyTokensEarned}<span className="text-sm text-tennis-green-medium">/{dailyTokenLimit}</span>
              </div>
              <div className="text-xs sm:text-sm text-tennis-green-medium">Today's Progress</div>
              <div className="w-full max-w-24 sm:max-w-full mx-auto">
                <Progress 
                  value={tokenProgress} 
                  className="h-2"
                />
              </div>
              <div className="text-xs text-tennis-green-medium">
                {dailyTokenLimit - dailyTokensEarned} remaining
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};