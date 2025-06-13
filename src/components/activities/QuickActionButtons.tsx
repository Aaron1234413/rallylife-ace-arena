
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Trophy, 
  Dumbbell, 
  Users, 
  Heart, 
  Target,
  Plus
} from 'lucide-react';
import { useActivityLogs } from '@/hooks/useActivityLogs';

interface QuickActionButtonsProps {
  onActivityLogged?: () => void;
  className?: string;
}

const quickActions = [
  {
    id: 'quick_match',
    title: 'Quick Match',
    description: 'Log a casual singles match',
    icon: Trophy,
    color: 'bg-blue-500 hover:bg-blue-600',
    activity_type: 'match',
    activity_category: 'on_court',
    duration_minutes: 90,
    is_competitive: false
  },
  {
    id: 'training_session',
    title: 'Training Session',
    description: '1-hour training session',
    icon: Dumbbell,
    color: 'bg-green-500 hover:bg-green-600',
    activity_type: 'training',
    activity_category: 'on_court',
    duration_minutes: 60,
    intensity_level: 'medium'
  },
  {
    id: 'tennis_lesson',
    title: 'Tennis Lesson',
    description: 'Coaching lesson',
    icon: Users,
    color: 'bg-purple-500 hover:bg-purple-600',
    activity_type: 'lesson',
    activity_category: 'educational',
    duration_minutes: 60
  },
  {
    id: 'social_play',
    title: 'Social Play',
    description: 'Fun recreational tennis',
    icon: Heart,
    color: 'bg-pink-500 hover:bg-pink-600',
    activity_type: 'social',
    activity_category: 'social',
    duration_minutes: 45,
    intensity_level: 'low'
  },
  {
    id: 'practice_session',
    title: 'Practice',
    description: 'Solo practice session',
    icon: Target,
    color: 'bg-orange-500 hover:bg-orange-600',
    activity_type: 'practice',
    activity_category: 'on_court',
    duration_minutes: 45,
    intensity_level: 'medium'
  }
];

export function QuickActionButtons({ onActivityLogged, className }: QuickActionButtonsProps) {
  const { logActivity } = useActivityLogs();

  const handleQuickAction = async (action: typeof quickActions[0]) => {
    try {
      await logActivity({
        activity_type: action.activity_type,
        activity_category: action.activity_category,
        title: action.title,
        description: action.description,
        duration_minutes: action.duration_minutes,
        intensity_level: action.intensity_level || 'medium',
        is_competitive: action.is_competitive || false
      });
      
      onActivityLogged?.();
    } catch (error) {
      console.error('Error logging quick action:', error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Log Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            
            return (
              <Button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className={`h-auto p-4 flex flex-col items-center gap-2 text-center ${action.color}`}
              >
                <Icon className="h-6 w-6" />
                <div>
                  <div className="font-semibold">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
