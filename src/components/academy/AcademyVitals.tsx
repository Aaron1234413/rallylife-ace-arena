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
    <Card className="bg-gradient-to-r from-tennis-green-primary/10 to-tennis-green-accent/10 border-tennis-green-light/20 shadow-lg animate-fade-in">
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-6 items-center">
          {/* Left: Knowledge Points */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Brain className="h-5 w-5 text-tennis-green-primary" />
              <span className="text-sm font-medium text-tennis-green-dark">Knowledge Points</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-tennis-green-dark">{knowledgePoints}</div>
              <div className="text-xs text-tennis-green-medium">Level {knowledgeLevel}</div>
              <Progress 
                value={Math.max(0, Math.min(100, progressToNextKnowledgeLevel))} 
                className="h-2"
              />
              <div className="text-xs text-tennis-green-medium">
                {Math.max(0, pointsForNextLevel - knowledgePoints)} to Level {nextKnowledgeLevel}
              </div>
            </div>
          </div>

          {/* Center: Current Level (Prominent) */}
          <div className="text-center space-y-2">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-tennis-green-primary to-tennis-green-accent rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <Badge 
                variant="secondary" 
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-tennis-green-primary text-white text-xs"
              >
                Level {currentLevel}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-tennis-green-dark">{progress.level_name}</div>
              <div className="text-xs text-tennis-green-medium">
                {progress.quizzes_completed} quizzes completed
              </div>
            </div>
          </div>

          {/* Right: Tokens */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Coins className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-tennis-green-dark">Daily Tokens</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-tennis-green-dark">
                {dailyTokensEarned}<span className="text-sm text-tennis-green-medium">/{dailyTokenLimit}</span>
              </div>
              <div className="text-xs text-tennis-green-medium">Today's Progress</div>
              <Progress 
                value={tokenProgress} 
                className="h-2"
              />
              <div className="text-xs text-tennis-green-medium">
                {dailyTokenLimit - dailyTokensEarned} tokens remaining
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};