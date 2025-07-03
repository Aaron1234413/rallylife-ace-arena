import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy,
  Star,
  Target,
  Flame,
  Award,
  Lock,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AcademyProgress } from '@/hooks/useAcademyProgressDB';

interface Milestone {
  type: string;
  name: string;
  description: string;
  icon: React.ElementType;
  requirement: number;
  tokensReward: number;
  knowledgePointsReward: number;
  isAchieved: boolean;
  progress: number;
}

interface AcademyMilestonesProps {
  progress: AcademyProgress;
}

export const AcademyMilestones: React.FC<AcademyMilestonesProps> = ({ progress }) => {
  const { user } = useAuth();
  const [achievedMilestones, setAchievedMilestones] = useState<string[]>([]);

  useEffect(() => {
    const fetchAchievedMilestones = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('academy_milestones')
          .select('milestone_type')
          .eq('player_id', user.id);

        if (error) throw error;
        
        setAchievedMilestones(data.map(m => m.milestone_type));
      } catch (error) {
        console.error('Error fetching milestones:', error);
      }
    };

    fetchAchievedMilestones();
  }, [user, progress]);

  const milestones: Milestone[] = [
    {
      type: 'first_quiz',
      name: 'First Quiz',
      description: 'Complete your very first quiz',
      icon: Star,
      requirement: 1,
      tokensReward: 10,
      knowledgePointsReward: 25,
      isAchieved: achievedMilestones.includes('first_quiz'),
      progress: Math.min(progress.quizzes_completed, 1)
    },
    {
      type: 'getting_started',
      name: 'Getting Started',
      description: 'Complete 5 quizzes',
      icon: Target,
      requirement: 5,
      tokensReward: 25,
      knowledgePointsReward: 50,
      isAchieved: achievedMilestones.includes('getting_started'),
      progress: Math.min(progress.quizzes_completed, 5)
    },
    {
      type: 'dedicated_learner',
      name: 'Dedicated Learner',
      description: 'Complete 10 quizzes',
      icon: Trophy,
      requirement: 10,
      tokensReward: 50,
      knowledgePointsReward: 100,
      isAchieved: achievedMilestones.includes('dedicated_learner'),
      progress: Math.min(progress.quizzes_completed, 10)
    },
    {
      type: 'streak_master',
      name: 'Streak Master',
      description: 'Maintain a 7-day check-in streak',
      icon: Flame,
      requirement: 7,
      tokensReward: 75,
      knowledgePointsReward: 150,
      isAchieved: achievedMilestones.includes('streak_master'),
      progress: Math.min((progress as any).consecutive_check_ins || 0, 7)
    }
  ];

  const getMilestoneStatusColor = (milestone: Milestone) => {
    if (milestone.isAchieved) return 'text-green-600';
    if (milestone.progress > 0) return 'text-blue-600';
    return 'text-gray-400';
  };

  const getMilestoneBackgroundColor = (milestone: Milestone) => {
    if (milestone.isAchieved) return 'bg-green-50 border-green-200';
    if (milestone.progress > 0) return 'bg-blue-50 border-blue-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-light/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
          <Award className="h-5 w-5 text-tennis-green-primary" />
          Academy Milestones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {milestones.map((milestone) => {
          const Icon = milestone.icon;
          const progressPercentage = (milestone.progress / milestone.requirement) * 100;

          return (
            <Card 
              key={milestone.type} 
              className={`transition-all duration-300 ${getMilestoneBackgroundColor(milestone)} hover:shadow-md`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Milestone Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center relative ${
                    milestone.isAchieved 
                      ? 'bg-green-100' 
                      : milestone.progress > 0 
                        ? 'bg-blue-100' 
                        : 'bg-gray-100'
                  }`}>
                    {milestone.isAchieved ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : milestone.progress === 0 ? (
                      <Lock className="h-6 w-6 text-gray-400" />
                    ) : (
                      <Icon className={`h-6 w-6 ${getMilestoneStatusColor(milestone)}`} />
                    )}
                  </div>

                  {/* Milestone Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-semibold ${getMilestoneStatusColor(milestone)}`}>
                        {milestone.name}
                      </h4>
                      {milestone.isAchieved && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Completed ✓
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-tennis-green-medium mb-2">
                      {milestone.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-tennis-green-medium">
                          Progress: {milestone.progress}/{milestone.requirement}
                        </span>
                        <span className="text-tennis-green-medium">
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                      <Progress 
                        value={progressPercentage} 
                        className="h-2"
                      />
                    </div>

                    {/* Rewards */}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        +{milestone.tokensReward} tokens
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        +{milestone.knowledgePointsReward} KP
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Summary Stats */}
        <div className="mt-6 p-4 bg-gradient-to-r from-tennis-green-bg to-tennis-green-light/20 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-tennis-green-dark">
                {achievedMilestones.length}
              </div>
              <div className="text-xs text-tennis-green-medium">
                Milestones Achieved
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-600">
                {milestones.reduce((total, m) => total + (m.isAchieved ? m.tokensReward : 0), 0)}
              </div>
              <div className="text-xs text-tennis-green-medium">
                Tokens Earned
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {milestones.reduce((total, m) => total + (m.isAchieved ? m.knowledgePointsReward : 0), 0)}
              </div>
              <div className="text-xs text-tennis-green-medium">
                Knowledge Points
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};