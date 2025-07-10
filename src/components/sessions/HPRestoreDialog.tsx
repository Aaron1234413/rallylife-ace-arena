import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { HPIndicator } from '@/components/ui/hp-indicator';
import { 
  Heart,
  Coffee,
  Moon,
  Dumbbell,
  Clock,
  Zap,
  CheckCircle
} from 'lucide-react';

interface HPRestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentHP: number;
  maxHP?: number;
  onRestoreHP: (method: string) => Promise<void>;
  isLoading?: boolean;
}

const restoreMethods = [
  {
    id: 'rest',
    name: 'Take a Rest',
    description: 'Wait for natural HP regeneration',
    hpRestore: 20,
    timeRequired: '8 hours',
    icon: Moon,
    cost: 'Free',
    immediate: false
  },
  {
    id: 'coffee',
    name: 'Energy Drink',
    description: 'Quick HP boost for urgent sessions',
    hpRestore: 15,
    timeRequired: 'Instant',
    icon: Coffee,
    cost: '10 tokens',
    immediate: true
  },
  {
    id: 'workout',
    name: 'Light Workout',
    description: 'Physical activity to restore energy',
    hpRestore: 25,
    timeRequired: '30 minutes',
    icon: Dumbbell,
    cost: 'Free',
    immediate: false
  }
];

export const HPRestoreDialog: React.FC<HPRestoreDialogProps> = ({
  open,
  onOpenChange,
  currentHP,
  maxHP = 100,
  onRestoreHP,
  isLoading = false
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  
  const hpPercentage = (currentHP / maxHP) * 100;
  const selectedMethodData = restoreMethods.find(m => m.id === selectedMethod);

  const handleRestore = async () => {
    if (selectedMethod) {
      await onRestoreHP(selectedMethod);
      setSelectedMethod('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Restore HP
          </DialogTitle>
          <DialogDescription>
            Your HP is low. Choose a restoration method to get back in the game.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current HP Status */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current HP</span>
              <span className="text-sm text-muted-foreground">{currentHP}/{maxHP}</span>
            </div>
            <Progress value={hpPercentage} className="h-3" />
          </div>

          {/* Restoration Methods */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Choose restoration method:</h4>
            {restoreMethods.map((method) => {
              const Icon = method.icon;
              const projectedHP = Math.min(maxHP, currentHP + method.hpRestore);
              
              return (
                <div
                  key={method.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedMethod === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">{method.name}</h5>
                        <div className="flex items-center gap-1 text-green-600">
                          <Heart className="h-3 w-3" />
                          <span className="text-sm">+{method.hpRestore}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {method.description}
                      </p>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {method.timeRequired}
                          </span>
                          <span className="text-muted-foreground">
                            Cost: {method.cost}
                          </span>
                        </div>
                        {method.immediate && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Zap className="h-3 w-3" />
                            <span>Instant</span>
                          </div>
                        )}
                      </div>
                      {selectedMethod === method.id && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                          <div className="flex items-center gap-1 text-green-700">
                            <CheckCircle className="h-3 w-3" />
                            HP will increase to {projectedHP}/{maxHP}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button 
              onClick={handleRestore}
              disabled={!selectedMethod || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Restoring...' : 'Restore HP'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};