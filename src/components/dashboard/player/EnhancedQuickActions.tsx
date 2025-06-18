
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Heart, 
  Coins, 
  TrendingUp, 
  Target,
  Dumbbell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EnhancedQuickActionsProps {
  hpData: any;
  xpData: any;
  onAddXP: (amount: number, activityType: string, description?: string) => Promise<any>;
  onRestoreHP: (amount: number, activityType: string, description?: string) => Promise<any>;
  onAddTokens: (amount: number, tokenType?: string, source?: string, description?: string) => Promise<any>;
}

export function EnhancedQuickActions({ 
  hpData, 
  xpData, 
  onAddXP, 
  onRestoreHP, 
  onAddTokens 
}: EnhancedQuickActionsProps) {
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

  // Smart recommendations based on current state
  const getRecommendations = () => {
    const recommendations = [];
    
    if (hpData && hpData.current_hp < 30) {
      recommendations.push({
        type: 'warning',
        text: 'Low HP - Consider rest',
        action: 'rest'
      });
    }
    
    if (xpData && xpData.current_xp / xpData.xp_to_next_level > 0.8) {
      recommendations.push({
        type: 'success',
        text: 'Almost leveled up!',
        action: 'practice'
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        {recommendations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recommendations.map((rec, index) => (
              <Badge 
                key={index} 
                variant={rec.type === 'warning' ? 'destructive' : 'default'}
                className="text-xs"
              >
                {rec.text}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Training Session Button - Primary Action */}
          <Button
            onClick={handleStartTraining}
            className="h-20 flex-col gap-2 bg-tennis-green-light hover:bg-tennis-green-dark text-white"
          >
            <Dumbbell className="h-5 w-5" />
            <span className="text-xs font-medium">Start Training</span>
          </Button>

          {/* Quick XP */}
          <Button
            variant="outline"
            onClick={handleQuickXP}
            className="h-20 flex-col gap-2 hover:bg-blue-50"
          >
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-xs font-medium">Quick XP</span>
            <span className="text-xs text-muted-foreground">+20</span>
          </Button>

          {/* Restore HP */}
          <Button
            variant="outline"
            onClick={handleRestoreHP}
            className="h-20 flex-col gap-2 hover:bg-red-50"
            disabled={hpData?.current_hp >= hpData?.max_hp}
          >
            <Heart className="h-5 w-5 text-red-600" />
            <span className="text-xs font-medium">Restore HP</span>
            <span className="text-xs text-muted-foreground">+10</span>
          </Button>

          {/* Earn Tokens */}
          <Button
            variant="outline"
            onClick={handleEarnTokens}
            className="h-20 flex-col gap-2 hover:bg-yellow-50"
          >
            <Coins className="h-5 w-5 text-yellow-600" />
            <span className="text-xs font-medium">Daily Bonus</span>
            <span className="text-xs text-muted-foreground">+5 🪙</span>
          </Button>
        </div>

        {/* Smart Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Recommended Actions</h4>
            <div className="space-y-1">
              {recommendations.map((rec, index) => (
                <p key={index} className="text-xs text-muted-foreground">
                  • {rec.text}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
