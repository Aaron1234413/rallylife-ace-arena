
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Sparkles, 
  Users,
  Clock,
  TrendingUp
} from 'lucide-react';
import { calculateSessionCosts, formatSessionPreview } from '@/utils/sessionCalculations';

interface WellbeingQuickActionProps {
  className?: string;
  currentHP?: number;
  maxHP?: number;
}

export function WellbeingQuickAction({ className, currentHP = 100, maxHP = 100 }: WellbeingQuickActionProps) {
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      // Import supabase
      const { supabase } = await import('@/integrations/supabase/client');
      const { toast } = await import('sonner');
      
      // Use the meditation RPC function for immediate completion
      const { data, error } = await supabase.rpc('complete_meditation_session', {
        meditation_type: 'meditation',
        duration_minutes: recommendedDuration,
        notes: `Quick wellbeing session - ${recommendedDuration} minutes`
      });
      
      if (error) throw error;
      
      toast.success('Wellbeing session completed!', {
        description: `+${(data as any).hp_restored} HP • +${(data as any).xp_gained} XP • +${(data as any).tokens_earned} Tokens`
      });
      
      // Navigate to sessions to see the completed session
      navigate('/sessions');
      
    } catch (error) {
      console.error('Error completing wellbeing session:', error);
      const { toast } = await import('sonner');
      toast.error('Failed to complete wellbeing session');
    }
  };

  // Calculate wellbeing session benefits
  const hpDeficit = maxHP - currentHP;
  const recommendedDuration = hpDeficit > 0 ? Math.min(Math.max(15, Math.ceil(hpDeficit / 5) * 5), 60) : 30;
  const sessionPreview = formatSessionPreview('wellbeing', recommendedDuration, currentHP);
  const calculation = sessionPreview.costBreakdown;

  return (
    <div className={`p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors bg-gray-50 ${className}`}>
      <div className="space-y-3">
        {/* Header - matches other cards */}
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          <h3 className="font-semibold">Wellbeing Session</h3>
        </div>

        {/* Dynamic description with smart recovery advice */}
        {hpDeficit > 0 ? (
          <p className="text-sm text-gray-600">
            {sessionPreview.preSessionText} • Recommended {recommendedDuration}min session
          </p>
        ) : (
          <p className="text-sm text-gray-600">Join or create wellbeing sessions to maintain peak mental health</p>
        )}

        {/* Smart duration and efficiency info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{hpDeficit > 0 ? `${recommendedDuration}min recommended` : '15-60 min'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">recovery</Badge>
            {hpDeficit > 0 && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                +{Math.abs(calculation.hpCost)} HP
              </Badge>
            )}
          </div>
        </div>

        {/* Smart benefits display */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1 text-pink-600">
            <Heart className="h-3 w-3" />
            <span>{hpDeficit > 0 ? `Restore ${Math.abs(calculation.hpCost)} HP` : 'Maintain HP'}</span>
          </div>
          <div className="flex items-center gap-1 text-blue-600 justify-end">
            <TrendingUp className="h-3 w-3" />
            <span>+{calculation.xpGain} XP</span>
          </div>
        </div>

        {/* Smart Action Button */}
        <div className="pt-2">
          <Button 
            onClick={handleClick}
            variant="outline" 
            className={`w-full justify-center bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 hover:border-pink-300 ${
              hpDeficit > 0 ? 'ring-2 ring-pink-200 ring-opacity-50' : ''
            }`}
          >
            <Sparkles className="h-4 w-4 mr-2 text-pink-500" />
            {hpDeficit > 0 ? `Start ${recommendedDuration}min Recovery` : 'Browse Wellbeing Sessions'}
          </Button>
        </div>
      </div>
    </div>
  );
}
