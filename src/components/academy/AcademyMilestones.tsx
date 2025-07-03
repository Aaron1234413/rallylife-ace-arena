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
    <Card className={`hover-scale transition-all duration-300 shadow-md ${
      isCloseToAchieving 
        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' 
        : 'bg-white/95 border-tennis-green-light/20'
    }`}>
      <CardContent className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <div className="p-2 bg-tennis-green-primary/10 rounded-lg">
            <Award className="h-5 w-5 text-tennis-green-primary" />
          </div>
          <span className="font-bold text-tennis-green-dark text-lg orbitron-heading">
            Next Milestone
          </span>
        </div>

        <div className="space-y-4">
          {/* Milestone Info - Streamlined */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              isCloseToAchieving ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
            }`}>
              <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-tennis-green-dark text-lg sm:text-xl orbitron-heading">
                {nextMilestone.name}
              </h4>
              <p className="text-sm sm:text-base text-tennis-green-medium poppins-body">
                {nextMilestone.description}
              </p>
            </div>
          </div>

          {/* Goal and Progress - Compact layout */}
          <div className="bg-tennis-green-bg/50 rounded-lg p-3 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-tennis-green-medium poppins-body">Goal</span>
              <Badge variant="outline" className="px-2 py-1 text-xs font-bold">
                {nextMilestone.requirement}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-tennis-green-medium poppins-body">Progress</span>
                <span className="font-bold text-tennis-green-dark orbitron-heading">
                  {nextMilestone.progress} / {nextMilestone.requirement}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="text-center text-xs sm:text-sm text-tennis-green-medium">
                <span className="font-medium">{Math.round(progressPercentage)}% complete</span>
              </div>
            </div>
          </div>
          
          {/* Rewards - Simplified layout */}
          <div className="flex items-center justify-center gap-2 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <Trophy className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-bold text-yellow-800">
              +{nextMilestone.tokensReward} tokens, +{nextMilestone.knowledgePointsReward} KP
            </span>
          </div>

          {/* Motivation Message */}
          {isCloseToAchieving && (
            <div className="text-center text-sm font-bold text-blue-700 bg-blue-50 rounded-lg p-3 border border-blue-200 animate-pulse">
              🎯 Almost there! Just {nextMilestone.requirement - nextMilestone.progress} more to go!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};