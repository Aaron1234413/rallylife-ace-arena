
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MomentumState } from '@/services/momentumTracker';

interface MomentumMeterProps {
  momentum: MomentumState;
  showDetails?: boolean;
  compact?: boolean;
}

export const MomentumMeter: React.FC<MomentumMeterProps> = ({
  momentum,
  showDetails = true,
  compact = false
}) => {
  // Convert -100 to +100 scale to 0-100 for progress bar
  const progressValue = ((momentum.score + 100) / 2);
  
  const getMomentumColor = (score: number) => {
    if (score > 50) return 'text-green-600 bg-green-50 border-green-200';
    if (score > 20) return 'text-green-500 bg-green-25 border-green-100';
    if (score > -20) return 'text-gray-600 bg-gray-50 border-gray-200';
    if (score > -50) return 'text-orange-500 bg-orange-50 border-orange-100';
    return 'text-red-600 bg-red-50 border-red-200';
  };
  
  const getProgressColor = (score: number) => {
    if (score > 50) return 'bg-green-500';
    if (score > 20) return 'bg-green-400';
    if (score > -20) return 'bg-gray-400';
    if (score > -50) return 'bg-orange-400';
    return 'bg-red-500';
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-3 w-3" />;
      case 'falling': return <TrendingDown className="h-3 w-3" />;
      default: return <Minus className="h-3 w-3" />;
    }
  };
  
  const getIntensityBadge = (intensity: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700', 
      low: 'bg-gray-100 text-gray-700'
    };
    
    return colors[intensity as keyof typeof colors] || colors.low;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Progress 
            value={progressValue} 
            className="h-2"
            style={{
              background: getProgressColor(momentum.score)
            }}
          />
        </div>
        <Badge variant="outline" className={`text-xs ${getMomentumColor(momentum.score)}`}>
          {getTrendIcon(momentum.trend)}
          {momentum.score > 0 ? '+' : ''}{momentum.score}
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Match Momentum</h4>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-xs ${getMomentumColor(momentum.score)}`}>
            {getTrendIcon(momentum.trend)}
            {momentum.score > 0 ? '+' : ''}{momentum.score}
          </Badge>
          {showDetails && (
            <Badge variant="outline" className={`text-xs ${getIntensityBadge(momentum.intensity)}`}>
              {momentum.intensity}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Progress 
            value={progressValue} 
            className="h-3"
          />
          <div 
            className="absolute top-0 left-1/2 w-0.5 h-3 bg-gray-300 transform -translate-x-0.5"
            style={{ left: '50%' }}
          />
        </div>
        
        {/* Labels */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>Opponent</span>
          <span>Neutral</span>
          <span>You</span>
        </div>
      </div>
      
      {/* Description */}
      {showDetails && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-700 font-medium">{momentum.description}</p>
          {momentum.confidence < 0.7 && (
            <p className="text-xs text-gray-500 mt-1">
              Confidence: {Math.round(momentum.confidence * 100)}%
            </p>
          )}
        </div>
      )}
    </div>
  );
};
