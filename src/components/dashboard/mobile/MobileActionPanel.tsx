
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Star, 
  Coins, 
  Plus,
  Activity,
  Brain
} from 'lucide-react';
import { WellbeingCenter } from '@/components/recovery';

interface MobileActionPanelProps {
  hpData: any;
  xpData: any;
  onAddXP: (amount: number, activityType: string, description?: string) => Promise<void>;
  onRestoreHP: (amount: number, activityType: string, description?: string) => Promise<void>;
  onAddTokens: (amount: number, tokenType?: string, source?: string, description?: string) => Promise<void>;
  className?: string;
}

export function MobileActionPanel({ 
  hpData, 
  xpData, 
  onAddXP, 
  onRestoreHP, 
  onAddTokens,
  className 
}: MobileActionPanelProps) {
  const [activePanel, setActivePanel] = useState<'stats' | 'actions' | null>(null);
  const [wellbeingCenterOpen, setWellbeingCenterOpen] = useState(false);

  const currentHP = hpData?.current_hp || 0;
  const maxHP = hpData?.max_hp || 100;
  const currentLevel = xpData?.current_level || 1;
  const currentXP = xpData?.current_xp || 0;

  const quickActions = [
    {
      id: 'restore-hp',
      title: 'Restore HP',
      description: 'Quick health boost',
      icon: Heart,
      onClick: () => onRestoreHP(10, 'rest', 'Quick mobile HP restore')
    },
    {
      id: 'add-xp',
      title: 'Add XP',
      description: 'Log quick activity',
      icon: Star,
      onClick: () => onAddXP(25, 'training', 'Quick mobile XP gain')
    },
    {
      id: 'earn-tokens',
      title: 'Earn Tokens',
      description: 'Daily bonus',
      icon: Coins,
      onClick: () => onAddTokens(5, 'regular', 'daily_bonus', 'Daily mobile bonus')
    },
    {
      id: 'wellbeing-center',
      title: 'Wellbeing Center',
      description: 'Mental health & wellness',
      icon: Heart,
      color: 'text-pink-600',
      onClick: () => setWellbeingCenterOpen(true)
    }
  ];

  if (wellbeingCenterOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-background sm:hidden overflow-y-auto">
        <div className="p-4">
          <WellbeingCenter onBack={() => setWellbeingCenterOpen(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 sm:hidden ${className}`}>
      <Card className="rounded-none border-t border-x-0 border-b-0">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">{currentHP}/{maxHP}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <Badge variant="outline" className="text-xs">
                  Level {currentLevel}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={activePanel === 'stats' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActivePanel(activePanel === 'stats' ? null : 'stats')}
              >
                <Activity className="h-4 w-4" />
              </Button>
              <Button
                variant={activePanel === 'actions' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActivePanel(activePanel === 'actions' ? null : 'actions')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {activePanel === 'stats' && (
        <Card className="rounded-none border-b-0 border-x-0">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-red-600">{currentHP}</div>
                <div className="text-xs text-muted-foreground">Health Points</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">{currentXP}</div>
                <div className="text-xs text-muted-foreground">Experience</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{xpData?.xp_to_next_level || 100}</div>
                <div className="text-xs text-muted-foreground">To Next Level</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activePanel === 'actions' && (
        <Card className="rounded-none border-b-0 border-x-0">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-start gap-2 h-auto p-3"
                  onClick={action.onClick}
                >
                  <action.icon className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
