import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Coins, Star, Users, BookOpen } from 'lucide-react';
import { useCoachCXP } from '@/hooks/useCoachCXP';
import { useCoachCRP } from '@/hooks/useCoachCRP';
import { useCoachTokens } from '@/hooks/useCoachTokens';

export function CoachActionPanel() {
  const { addCXP, isAddingCXP } = useCoachCXP();
  const { submitFeedback, isSubmittingFeedback } = useCoachCRP();
  const { addTokens, addTokensLoading } = useCoachTokens();

  const handleEarnCXP = (amount: number, type: string, description: string) => {
    addCXP({
      amount,
      activityType: type,
      description,
    });
  };

  const handleEarnTokens = (amount: number, source: string, description: string) => {
    addTokens({
      amount,
      source,
      description,
    });
  };

  return (
    <Card className="border-tennis-green-light">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Coach Action Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CXP Actions */}
        <div>
          <h3 className="font-semibold text-tennis-green-dark mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Earn Coach Experience (CXP)
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEarnCXP(25, 'lesson_completed', 'Completed a coaching lesson')}
              disabled={isAddingCXP}
            >
              Complete Lesson (+25 CXP)
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEarnCXP(15, 'training_plan_created', 'Created a training plan')}
              disabled={isAddingCXP}
            >
              Create Plan (+15 CXP)
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEarnCXP(10, 'student_feedback', 'Received student feedback')}
              disabled={isAddingCXP}
            >
              Get Feedback (+10 CXP)
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEarnCXP(50, 'certification_earned', 'Earned a new certification')}
              disabled={isAddingCXP}
            >
              Certification (+50 CXP)
            </Button>
          </div>
        </div>

        {/* CTK Actions */}
        <div>
          <h3 className="font-semibold text-tennis-green-dark mb-3 flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Earn Coach Tokens (CTK)
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEarnTokens(10, 'lesson_bonus', 'Lesson completion bonus')}
              disabled={addTokensLoading}
            >
              Lesson Bonus (+10 CTK)
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEarnTokens(25, 'monthly_goal', 'Monthly goal achieved')}
              disabled={addTokensLoading}
            >
              Monthly Goal (+25 CTK)
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEarnTokens(5, 'daily_login', 'Daily platform check-in')}
              disabled={addTokensLoading}
            >
              Daily Login (+5 CTK)
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEarnTokens(15, 'student_referral', 'Student referral reward')}
              disabled={addTokensLoading}
            >
              Referral (+15 CTK)
            </Button>
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-tennis-green-bg p-4 rounded-lg">
          <h4 className="font-medium text-tennis-green-dark mb-2">How It Works:</h4>
          <div className="space-y-1 text-sm text-tennis-green-medium">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="w-fit">CXP</Badge>
              <span>Increases your coaching level and unlocks new tools</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="w-fit">CRP</Badge>
              <span>Built through positive student feedback and results</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="w-fit">CTK</Badge>
              <span>Spend on premium features and coaching tools</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}