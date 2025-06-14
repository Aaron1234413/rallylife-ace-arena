
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Target, BookOpen, MessageSquare, Zap } from 'lucide-react';
import { useCoachCXP } from '@/hooks/useCoachCXP';

export function CXPEarnActions() {
  const { addCXP, isAddingCXP } = useCoachCXP();

  const handleEarnCXP = (amount: number, type: string, description: string) => {
    addCXP({
      amount: amount,
      activityType: type,
      description
    });
  };

  const actions = [
    {
      icon: Users,
      title: 'Complete Coaching Session',
      description: 'Earn CXP for completed 1-on-1 sessions',
      cxp: 25,
      type: 'coaching_session',
      color: 'text-blue-600'
    },
    {
      icon: Target,
      title: 'Player Achievement Unlocked',
      description: 'Bonus CXP when your players achieve milestones',
      cxp: 15,
      type: 'player_achievement',
      color: 'text-green-600'
    },
    {
      icon: BookOpen,
      title: 'Create Training Content',
      description: 'Earn CXP for creating guides and resources',
      cxp: 20,
      type: 'content_creation',
      color: 'text-purple-600'
    },
    {
      icon: MessageSquare,
      title: 'Player Feedback Received',
      description: 'Get CXP from positive player reviews',
      cxp: 10,
      type: 'player_feedback',
      color: 'text-orange-600'
    }
  ];

  return (
    <Card className="border-tennis-green-light">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Earn CXP
        </CardTitle>
        <CardDescription>
          Complete coaching activities to gain experience points
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <div key={action.type} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 ${action.color} flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className="font-medium text-sm text-tennis-green-dark">
                      {action.title}
                    </p>
                    <p className="text-xs text-tennis-green-medium mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isAddingCXP}
                  onClick={() => handleEarnCXP(action.cxp, action.type, action.title)}
                  className="text-xs"
                >
                  +{action.cxp} CXP
                </Button>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-tennis-green-bg rounded-lg">
          <p className="text-xs text-tennis-green-dark">
            💡 <strong>Tip:</strong> Higher level coaches unlock advanced tools, increased commission rates, and exclusive certifications!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
