
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Heart, 
  Coins, 
  Dumbbell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileActionPanelProps {
  hpData: any;
  xpData: any;
  onAddXP: (amount: number, activityType: string, description?: string) => Promise<any>;
  onRestoreHP: (amount: number, activityType: string, description?: string) => Promise<any>;
  onAddTokens: (amount: number, tokenType?: string, source?: string, description?: string) => Promise<any>;
}

export function MobileActionPanel({ 
  hpData, 
  xpData, 
  onAddXP, 
  onRestoreHP, 
  onAddTokens 
}: MobileActionPanelProps) {
  const navigate = useNavigate();

  const handleQuickXP = async () => {
    await onAddXP(20, 'quick_practice', 'Quick practice session');
  };

  const handleRestoreHP = async () => {
    await onRestoreHP(10, 'rest', 'Quick recovery');
  };

  const handleEarnTokens = async () => {
    await onAddTokens(5, 'regular', 'daily_bonus', 'Daily activity bonus');
  };

  const handleStartTraining = () => {
    navigate('/start-training');
  };

  return (
    <div className="sm:hidden">
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Training Session Button - Primary Action */}
            <Button
              onClick={handleStartTraining}
              className="h-16 flex-col gap-1 bg-tennis-green-light hover:bg-tennis-green-dark text-white col-span-2"
            >
              <Dumbbell className="h-4 w-4" />
              <span className="text-sm font-medium">Start Training Session</span>
            </Button>

            {/* Quick XP */}
            <Button
              variant="outline"
              onClick={handleQuickXP}
              className="h-14 flex-col gap-1"
            >
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-xs">Quick XP (+20)</span>
            </Button>

            {/* Restore HP */}
            <Button
              variant="outline"
              onClick={handleRestoreHP}
              className="h-14 flex-col gap-1"
              disabled={hpData?.current_hp >= hpData?.max_hp}
            >
              <Heart className="h-4 w-4 text-red-600" />
              <span className="text-xs">Restore HP (+10)</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
