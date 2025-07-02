
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Sparkles, 
  Users,
  Clock
} from 'lucide-react';
import { calculateRecoveryNeeded } from '@/utils/hpCalculations';

interface WellbeingQuickActionProps {
  className?: string;
  currentHP?: number;
}

export function WellbeingQuickAction({ className, currentHP }: WellbeingQuickActionProps) {
  const navigate = useNavigate();
  
  // Calculate smart recovery recommendations
  const matchRecovery = calculateRecoveryNeeded('match', 90);
  const trainingRecovery = calculateRecoveryNeeded('training', 60);
  
  const handleClick = () => {
    // Navigate directly to wellbeing sessions
    navigate('/sessions?type=wellbeing');
  };

  return (
    <div className={`p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors bg-gray-50 ${className}`}>
      <div className="space-y-3">
        {/* Header - matches other cards */}
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          <h3 className="font-semibold">Wellbeing Session</h3>
        </div>

        {/* Smart description based on HP status */}
        <p className="text-sm text-gray-600">
          {currentHP && currentHP < 50 
            ? `🔋 ${matchRecovery.description.split(' ').slice(0, 2).join(' ')} restores HP for safe activities`
            : 'Join or create wellbeing sessions to restore HP and improve mental health'
          }
        </p>

        {/* Duration and Difficulty badges - matches other cards layout */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>10-60 min</span>
          </div>
          <Badge variant="outline" className="text-xs">low intensity</Badge>
        </div>

        {/* Smart rewards display */}
        <div className="grid grid-cols-1 gap-1 text-xs">
          <div className="flex items-center gap-1 text-pink-600">
            <Heart className="h-3 w-3" />
            <span>
              {currentHP && currentHP < 50 
                ? `Restore ${Math.min(25, Math.ceil(30 / 5))} HP in 30min session`
                : 'Auto HP restore + group activities'
              }
            </span>
          </div>
          {currentHP && currentHP < 30 && (
            <div className="text-xs text-orange-600 mt-1">
              💡 Tip: Longer sessions (45-60min) maximize HP restoration
            </div>
          )}
        </div>

        {/* Main Action Button - link to wellbeing sessions */}
        <div className="pt-2">
          <Button 
            onClick={handleClick}
            variant="outline" 
            className="w-full justify-center bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 hover:border-pink-300"
          >
            <Sparkles className="h-4 w-4 mr-2 text-pink-500" />
            Browse Wellbeing Sessions
          </Button>
        </div>
      </div>
    </div>
  );
}
