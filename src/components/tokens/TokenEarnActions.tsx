
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Coins,
  Gift,
  Calendar,
  Trophy,
  Star,
  Gem,
  Plus
} from 'lucide-react';

interface TokenEarnActionsProps {
  onEarnTokens: (amount: number, tokenType: string, source: string, description?: string) => Promise<void>;
  className?: string;
}

const tokenActions = [
  {
    id: 'daily_login',
    name: 'Daily Login',
    description: 'Daily check-in bonus',
    icon: Calendar,
    tokenAmount: 10,
    tokenType: 'regular',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    id: 'match_win',
    name: 'Match Victory',
    description: 'Won a tennis match',
    icon: Trophy,
    tokenAmount: 25,
    tokenType: 'regular',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    id: 'achievement',
    name: 'Achievement',
    description: 'Unlocked an achievement',
    icon: Star,
    tokenAmount: 50,
    tokenType: 'regular',
    color: 'bg-yellow-500 hover:bg-yellow-600'
  },
  {
    id: 'tournament',
    name: 'Tournament Entry',
    description: 'Participated in tournament',
    icon: Trophy,
    tokenAmount: 75,
    tokenType: 'regular',
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    id: 'bonus_gift',
    name: 'Daily Gift',
    description: 'Random bonus tokens',
    icon: Gift,
    tokenAmount: 15,
    tokenType: 'regular',
    color: 'bg-indigo-500 hover:bg-indigo-600'
  }
];

export function TokenEarnActions({ onEarnTokens, className }: TokenEarnActionsProps) {
  const handleEarnTokens = async (action: typeof tokenActions[0]) => {
    try {
      await onEarnTokens(action.tokenAmount, action.tokenType, action.id, action.description);
    } catch (error) {
      console.error('Error earning tokens:', error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Earn Tokens
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tokenActions.map((action) => {
            const Icon = action.icon;
            const isRegular = action.tokenType === 'regular';
            
            return (
              <Button
                key={action.id}
                onClick={() => handleEarnTokens(action)}
                className={`h-auto p-3 flex flex-col items-start gap-2 text-left ${action.color}`}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className="h-4 w-4" />
                  <span className="font-semibold">{action.name}</span>
                  <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
                    {isRegular ? '🪙' : '💎'} +{action.tokenAmount}
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
