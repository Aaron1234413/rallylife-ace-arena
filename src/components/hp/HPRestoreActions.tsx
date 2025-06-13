
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Dumbbell, Users, Trophy, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface HPRestoreActionsProps {
  onRestoreHP: (amount: number, activityType: string, description?: string) => Promise<void>;
  currentHP: number;
  maxHP: number;
  className?: string;
}

const restoreActions = [
  {
    id: 'match',
    name: 'Log Match',
    description: 'Record a tennis match',
    icon: Trophy,
    hpRestore: 15,
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    id: 'training',
    name: 'Training Session',
    description: 'Record a training session',
    icon: Dumbbell,
    hpRestore: 10,
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    id: 'lesson',
    name: 'Tennis Lesson',
    description: 'Record a coaching lesson',
    icon: Users,
    hpRestore: 12,
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    id: 'health_pack',
    name: 'Health Pack',
    description: 'Use premium health pack',
    icon: Zap,
    hpRestore: 20,
    color: 'bg-red-500 hover:bg-red-600'
  }
];

export function HPRestoreActions({ 
  onRestoreHP, 
  currentHP, 
  maxHP, 
  className 
}: HPRestoreActionsProps) {
  const handleRestore = async (action: typeof restoreActions[0]) => {
    if (currentHP >= maxHP) {
      toast.info('Your HP is already at maximum!');
      return;
    }

    try {
      await onRestoreHP(action.hpRestore, action.id, action.description);
    } catch (error) {
      console.error('Error restoring HP:', error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Restore HP
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {restoreActions.map((action) => {
            const Icon = action.icon;
            const wouldOverflow = currentHP + action.hpRestore > maxHP;
            const actualRestore = wouldOverflow ? maxHP - currentHP : action.hpRestore;
            
            return (
              <Button
                key={action.id}
                onClick={() => handleRestore(action)}
                disabled={currentHP >= maxHP}
                className={`h-auto p-3 flex flex-col items-start gap-2 text-left ${action.color}`}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className="h-4 w-4" />
                  <span className="font-semibold">{action.name}</span>
                  <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
                    +{actualRestore} HP
                  </Badge>
                </div>
                <p className="text-xs opacity-90">{action.description}</p>
              </Button>
            );
          })}
        </div>

        {currentHP >= maxHP && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              🎉 Your HP is at maximum! Keep playing to maintain it.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
