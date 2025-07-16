import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain,
  TrendingUp,
  Star
} from 'lucide-react';

interface KnowledgePointsDisplayProps {
  knowledgePoints: number;
  knowledgeLevel: number;
}

export const KnowledgePointsDisplay: React.FC<KnowledgePointsDisplayProps> = ({
  knowledgePoints,
  knowledgeLevel
}) => {
  // Calculate progress within current level
  const currentLevelMin = (knowledgeLevel - 1) * 100;
  const currentLevelMax = knowledgeLevel * 100;
  const pointsInCurrentLevel = knowledgePoints - currentLevelMin;
  const progressPercentage = (pointsInCurrentLevel / 100) * 100;
  const pointsToNextLevel = currentLevelMax - knowledgePoints;

  const getKnowledgeLevelName = (level: number): string => {
    if (level >= 20) return 'Grand Scholar';
    if (level >= 15) return 'Knowledge Master';
    if (level >= 10) return 'Expert Learner';
    if (level >= 5) return 'Advanced Student';
    return 'Learning Novice';
  };

  const getKnowledgeLevelColor = (level: number): string => {
    if (level >= 20) return 'text-purple-600';
    if (level >= 15) return 'text-indigo-600';
    if (level >= 10) return 'text-blue-600';
    if (level >= 5) return 'text-green-600';
    return 'text-gray-600';
  };

  const getKnowledgeLevelBgColor = (level: number): string => {
    if (level >= 20) return 'bg-purple-100 border-purple-200';
    if (level >= 15) return 'bg-indigo-100 border-indigo-200';
    if (level >= 10) return 'bg-blue-100 border-blue-200';
    if (level >= 5) return 'bg-green-100 border-green-200';
    return 'bg-gray-100 border-gray-200';
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-md ${getKnowledgeLevelBgColor(knowledgeLevel)}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getKnowledgeLevelBgColor(knowledgeLevel)}`}>
                <Brain className={`h-5 w-5 ${getKnowledgeLevelColor(knowledgeLevel)}`} />
              </div>
              <div>
                <h3 className="font-semibold text-tennis-green-dark">Knowledge Points</h3>
                <p className="text-sm text-tennis-green-medium">Separate from main XP</p>
              </div>
            </div>
            
            <Badge className={`${getKnowledgeLevelColor(knowledgeLevel)} font-semibold`} variant="outline">
              Level {knowledgeLevel}
            </Badge>
          </div>

          {/* Level Name and Total Points */}
          <div className="text-center space-y-1">
            <div className={`text-lg font-bold ${getKnowledgeLevelColor(knowledgeLevel)}`}>
              {getKnowledgeLevelName(knowledgeLevel)}
            </div>
            <div className="text-2xl font-bold text-tennis-green-dark">
              {knowledgePoints.toLocaleString()}
              <span className="text-sm font-normal text-tennis-green-medium ml-1">KP</span>
            </div>
          </div>

          {/* Progress to Next Level */}
          {knowledgeLevel < 20 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-tennis-green-medium">Level {knowledgeLevel} Progress</span>
                <span className="font-medium text-tennis-green-dark">
                  {pointsInCurrentLevel}/100 KP
                </span>
              </div>
              
              <Progress 
                value={progressPercentage} 
                className="h-3"
              />
              
              <div className="flex justify-between text-xs text-tennis-green-medium">
                <span>Current Level</span>
                <span>{pointsToNextLevel} KP to Level {knowledgeLevel + 1}</span>
              </div>
            </div>
          )}

          {/* Max Level Achievement */}
          {knowledgeLevel >= 20 && (
            <div className="text-center p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg border border-purple-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Star className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-800">Maximum Level Achieved!</span>
                <Star className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-xs text-purple-700">
                You've mastered all knowledge levels. Keep learning for more rewards!
              </p>
            </div>
          )}

          {/* How to Earn More */}
          <div className="bg-white/70 rounded-lg p-3 border border-tennis-green-light/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-tennis-green-primary" />
              <span className="text-sm font-medium text-tennis-green-dark">Earn Knowledge Points:</span>
            </div>
            <div className="space-y-1 text-xs text-tennis-green-medium">
              <div>• Daily check-ins: +10 KP</div>
              <div>• Quiz completion: +25 KP (half of XP earned)</div>
              <div>• Milestone achievements: +25-150 KP</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};