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

  // Find the next milestone to achieve
  const nextMilestone = milestones.find(milestone => !milestone.isAchieved);
  
  if (!nextMilestone) {
    // All milestones achieved
    return (
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 hover-scale transition-all duration-300 animate-fade-in">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-tennis-green-dark mb-2">All Milestones Complete!</h3>
          <p className="text-tennis-green-medium">You've mastered the Tennis Academy. New challenges coming soon!</p>
        </CardContent>
      </Card>
    );
  }

  const Icon = nextMilestone.icon;
  const progressPercentage = (nextMilestone.progress / nextMilestone.requirement) * 100;
  const isCloseToAchieving = progressPercentage >= 70;

  return (
    <Card className={`hover-scale transition-all duration-300 animate-fade-in ${
      isCloseToAchieving 
        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' 
        : 'bg-white/95 border-tennis-green-light/20'
    }`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
          <Award className="h-5 w-5 text-tennis-green-primary" />
          Next Milestone
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isCloseToAchieving ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
            }`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-tennis-green-dark">{nextMilestone.name}</h4>
              <p className="text-sm text-tennis-green-medium">{nextMilestone.description}</p>
            </div>
            <Badge variant="outline" className="shrink-0">
              Goal: {nextMilestone.requirement}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-tennis-green-medium">Progress</span>
              <span className="font-medium text-tennis-green-dark">
                {nextMilestone.progress} / {nextMilestone.requirement}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="text-center text-xs text-tennis-green-medium">
              {Math.round(progressPercentage)}% complete
            </div>
          </div>
          
          <div className="bg-tennis-green-bg rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-tennis-green-dark">
              <Trophy className="h-4 w-4 text-tennis-green-primary" />
              <span className="font-medium">Rewards:</span>
              <span>+{nextMilestone.tokensReward} tokens, +{nextMilestone.knowledgePointsReward} KP</span>
            </div>
          </div>

          {isCloseToAchieving && (
            <div className="text-center text-sm font-medium text-blue-700 bg-blue-50 rounded-lg p-2 animate-pulse">
              🎯 So close! Just {nextMilestone.requirement - nextMilestone.progress} more to go!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};