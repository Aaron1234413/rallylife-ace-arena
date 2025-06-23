
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Sparkles, 
  Brain, 
  Dumbbell,
  Clock
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
      <div className="space-y-3">
        {/* Header - matches other cards */}
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          <h3 className="font-semibold">Quick Recovery</h3>
        </div>

        {/* Description - matches other cards */}
        <p className="text-sm text-gray-600">Choose your recovery method to restore HP and improve wellbeing</p>

        {/* Duration and Difficulty badges - matches other cards layout */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>5-20 min</span>
          </div>
          <Badge variant="outline" className="text-xs">low intensity</Badge>
        </div>

        {/* Rewards grid - matches other cards rewards layout with right alignment for stretching */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1 text-purple-600">
            <Brain className="h-3 w-3" />
            <span>Meditation: 5-15min</span>
          </div>
          <div className="flex items-center gap-1 text-green-600 justify-end">
            <Dumbbell className="h-3 w-3" />
            <span>Stretching: 8-20min</span>
          </div>
        </div>

        {/* Main Action Button - matches other cards button position exactly */}
        <div className="pt-2">
          <RecoveryModeSelector onModeSelect={handleModeSelect}>
            <Button 
              variant="outline" 
              className="w-full justify-center bg-gradient-to-r from-purple-50 to-green-50 border-purple-200 hover:border-purple-300"
            >
              <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
              Choose Recovery Method
            </Button>
          </RecoveryModeSelector>
        </div>
      </div>
    </div>
  );
}
