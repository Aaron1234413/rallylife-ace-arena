
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Plus, 
  Heart, 
  Star, 
  Coins,
  Dumbbell,
  Trophy,
  Users,
  ChevronRight,
  Zap
} from 'lucide-react';

interface MobileActionPanelProps {
  hpData: any;
  xpData: any;
  onAddXP: (amount: number, activityType: string, description?: string) => Promise<any>;
  onRestoreHP: (amount: number, activityType: string, description?: string) => Promise<any>;
  onAddTokens: (amount: number, tokenType?: string, source?: string, description?: string) => Promise<any>;
}

const quickActions = [
  {
    id: 'practice',
    title: 'Practice Session',
    icon: Dumbbell,
    color: 'bg-green-500',
    rewards: { hp: -5, xp: 25, tokens: 2 },
    duration: 30
  },
  {
    id: 'match',
    title: 'Play Match',
    icon: Trophy,
    color: 'bg-blue-500',
    rewards: { hp: -10, xp: 50, tokens: 5 },
    duration: 60
  },
  {
    id: 'lesson',
    title: 'Lesson',
    icon: Users,
    color: 'bg-purple-500',
    rewards: { hp: -3, xp: 30, tokens: 3 },
    duration: 45
  },
  {
    id: 'rest',
    title: 'Rest & Recovery',
    icon: Heart,
    color: 'bg-red-500',
    rewards: { hp: 15, xp: 5, tokens: 1 },
    duration: 60
  }
];

export function MobileActionPanel({ 
  hpData, 
  xpData, 
  onAddXP, 
  onRestoreHP, 
  onAddTokens 
}: MobileActionPanelProps) {
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleQuickAction = async (action: any) => {
    setLoading(true);
    try {
      if (action.rewards.hp !== 0) {
        await onRestoreHP(action.rewards.hp, action.id, `${action.title} session`);
      }
      if (action.rewards.xp > 0) {
        await onAddXP(action.rewards.xp, action.id, `${action.title} session`);
      }
      if (action.rewards.tokens > 0) {
        await onAddTokens(action.rewards.tokens, 'regular', action.id, `${action.title} session`);
      }
    } catch (error) {
      console.error('Error executing action:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t sm:hidden">
      <div className="grid grid-cols-2 gap-2">
        {quickActions.slice(0, 3).map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant="outline"
              className="h-16 flex-col gap-1 p-2"
              onClick={() => handleQuickAction(action)}
              disabled={loading}
            >
              <div className={`p-1 rounded-full ${action.color}`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-medium">{action.title}</span>
              <div className="flex gap-1">
                {action.rewards.hp !== 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1">
                    {action.rewards.hp > 0 ? '+' : ''}{action.rewards.hp}HP
                  </Badge>
                )}
                {action.rewards.xp > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1">
                    +{action.rewards.xp}XP
                  </Badge>
                )}
              </div>
            </Button>
          );
        })}
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-16 flex-col gap-1 p-2">
              <Plus className="h-4 w-4" />
              <span className="text-xs font-medium">More</span>
              <ChevronRight className="h-3 w-3" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh]">
            <SheetHeader>
              <SheetTitle>Quick Actions</SheetTitle>
            </SheetHeader>
            <div className="grid gap-3 mt-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Card key={action.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleQuickAction(action)}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${action.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">{action.duration} minutes</p>
                        </div>
                        <div className="text-right">
                          <div className="flex gap-1 flex-wrap justify-end">
                            {action.rewards.hp !== 0 && (
                              <Badge variant="outline" className="text-xs">
                                {action.rewards.hp > 0 ? '+' : ''}{action.rewards.hp} HP
                              </Badge>
                            )}
                            {action.rewards.xp > 0 && (
                              <Badge variant="outline" className="text-xs">
                                +{action.rewards.xp} XP
                              </Badge>
                            )}
                            {action.rewards.tokens > 0 && (
                              <Badge variant="outline" className="text-xs">
                                +{action.rewards.tokens} Tokens
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
