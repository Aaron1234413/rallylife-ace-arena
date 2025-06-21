
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Clock, Zap, Heart } from 'lucide-react';
import { useDurationRewards } from '@/hooks/useDurationRewards';

interface SimpleEndEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  durationMinutes: number;
  onConfirmEnd: () => Promise<void>;
  onAddXP: (amount: number, type: string, desc?: string) => Promise<void>;
  onRestoreHP: (amount: number, type: string, desc?: string) => Promise<void>;
}

export const SimpleEndEventModal: React.FC<SimpleEndEventModalProps> = ({
  open,
  onOpenChange,
  durationMinutes,
  onConfirmEnd,
  onAddXP,
  onRestoreHP
}) => {
  const [isEnding, setIsEnding] = useState(false);
  const { calculateRewards, applyRewards } = useDurationRewards();
  
  const rewards = calculateRewards(durationMinutes);

  const handleEndSession = async () => {
    setIsEnding(true);
    
    try {
      // Apply rewards first
      await applyRewards(durationMinutes, onAddXP, onRestoreHP);
      
      // Then end the session
      await onConfirmEnd();
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error ending session:', error);
    } finally {
      setIsEnding(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Great Session!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Duration Display */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5 text-blue-500" />
                {formatDuration(durationMinutes)}
              </div>
              <p className="text-center text-sm text-muted-foreground mt-1">
                Time played
              </p>
            </CardContent>
          </Card>

          {/* Rewards Preview */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-center mb-3">Session Rewards</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-bold text-blue-600">
                    <Zap className="h-4 w-4" />
                    +{rewards.xp}
                  </div>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-bold text-red-500">
                    <Heart className="h-4 w-4" />
                    +{rewards.hp}
                  </div>
                  <p className="text-xs text-muted-foreground">HP</p>
                </div>
              </div>
              
              {rewards.description.includes('bonus') && (
                <div className="mt-3 p-2 bg-yellow-100 rounded-lg">
                  <p className="text-xs text-yellow-800 text-center font-medium">
                    🎉 Extended play bonus applied!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isEnding}
            >
              Keep Playing
            </Button>
            <Button
              onClick={handleEndSession}
              disabled={isEnding}
              className="flex-1"
            >
              {isEnding ? 'Ending...' : 'End Session'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
