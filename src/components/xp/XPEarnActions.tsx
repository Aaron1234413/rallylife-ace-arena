
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Dumbbell, 
  Users, 
  Heart, 
  Star, 
  Gift,
  Calendar,
  Plus
} from 'lucide-react';

interface XPEarnActionsProps {
  onEarnXP: (amount: number, activityType: string, description?: string) => Promise<void>;
  className?: string;
}

const xpActions = [
  {
    id: 'match',
    name: 'Log Match',
    description: 'Record a tennis match',
    icon: Trophy,
    xpAmount: 50,
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    id: 'training',
    name: 'Training Session',
    description: 'Record a training session',
    icon: Dumbbell,
    xpAmount: 30,
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    id: 'lesson',
    name: 'Tennis Lesson',
    description: 'Record a coaching lesson',
    icon: Users,
    xpAmount: 40,
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    id: 'social',
    name: 'Social Activity',
    description: 'Engage with the community',
    icon: Heart,
    xpAmount: 15,
    color: 'bg-pink-500 hover:bg-pink-600'
  },
  {
    id: 'achievement',
    name: 'Achievement',
    description: 'Unlock an achievement',
    icon: Star,
    xpAmount: 100,
    color: 'bg-yellow-500 hover:bg-yellow-600'
  },
  {
    id: 'daily_login',
    name: 'Daily Login',
    description: 'Daily check-in bonus',
    icon: Calendar,
    xpAmount: 10,
    color: 'bg-indigo-500 hover:bg-indigo-600'
  }
];

export function XPEarnActions({ onEarnXP, className }: XPEarnActionsProps) {
  const handleEarnXP = async (action: typeof xpActions[0]) => {
    try {
      await onEarnXP(action.xpAmount, action.id, action.description);
    } catch (error) {
      console.error('Error earning XP:', error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Earn XP
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {xpActions.map((action) => {
            const Icon = action.icon;
            
            return (
              <Button
                key={action.id}
                onClick={() => handleEarnXP(action)}
                className={`h-auto p-3 flex flex-col items-start gap-2 text-left ${action.color}`}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className="h-4 w-4" />
                  <span className="font-semibold">{action.name}</span>
                  <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
                    +{action.xpAmount} XP
                  </Badge>
                </div>
                <p className="text-xs opacity-90">{action.description}</p>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
