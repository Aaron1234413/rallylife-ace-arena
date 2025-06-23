
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Sparkles, 
  Brain, 
  Dumbbell,
  Clock,
  Zap
} from 'lucide-react';
import { RecoveryModeSelector } from './RecoveryModeSelector';

interface RecoveryMode {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  duration: string;
  hp: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface RecoveryQuickActionProps {
  onModeSelect?: (mode: RecoveryMode) => void;
  className?: string;
}

export function RecoveryQuickAction({ onModeSelect, className }: RecoveryQuickActionProps) {
  const handleModeSelect = (mode: RecoveryMode) => {
    console.log('Quick recovery mode selected:', mode);
    if (onModeSelect) {
      onModeSelect(mode);
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 border-purple-200 hover:border-purple-300 transition-colors ${className}`}>
      <div className="space-y-4">
        {/* Header with icon, title and badge - same level as other cards */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold">Quick Recovery</h3>
          </div>
          <Badge variant="outline" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            HP Restore
          </Badge>
        </div>

        {/* Description - same level as other cards */}
        <p className="text-sm text-gray-600">Choose your recovery method to restore HP and improve wellbeing</p>

        {/* Main Action Button - same level as other cards */}
        <RecoveryModeSelector onModeSelect={handleModeSelect}>
          <Button 
            variant="outline" 
            className="w-full justify-start bg-gradient-to-r from-purple-50 to-green-50 border-purple-200 hover:border-purple-300"
          >
            <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
            Choose Recovery Method
          </Button>
        </RecoveryModeSelector>

        {/* Stats Grid - same level as rewards in other cards */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1 text-purple-600">
            <Brain className="h-3 w-3" />
            <span>Meditation: 5-15min</span>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <Dumbbell className="h-3 w-3" />
            <span>Stretching: 8-20min</span>
          </div>
        </div>

        {/* Pro Tip - same level as description in other cards */}
        <div className="text-xs text-gray-500 border-t pt-2">
          💡 Regular recovery boosts performance and reduces injury risk
        </div>
      </div>
    </div>
  );
}
