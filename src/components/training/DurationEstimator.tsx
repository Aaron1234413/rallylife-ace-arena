
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  TrendingUp, 
  Zap, 
  Heart,
  Info,
  CheckCircle 
} from 'lucide-react';
import { formatSessionPreview, isSessionTooRisky, suggestAlternativeDurations } from '@/utils/sessionCalculations';

interface DurationEstimatorProps {
  value?: number;
  onValueChange: (duration: number) => void;
  sessionType?: string;
  currentHP?: number;
  maxHP?: number;
  showPreview?: boolean;
}

const durationOptions = [
  { minutes: 15, label: '15 min', description: 'Quick session' },
  { minutes: 30, label: '30 min', description: 'Short workout' },
  { minutes: 45, label: '45 min', description: 'Standard session' },
  { minutes: 60, label: '1 hour', description: 'Full training' },
  { minutes: 90, label: '1.5 hours', description: 'Extended session' },
  { minutes: 120, label: '2 hours', description: 'Intensive training' },
];

export function DurationEstimator({ 
  value, 
  onValueChange, 
  sessionType = 'training',
  currentHP = 100,
  maxHP = 100,
  showPreview = true 
}: DurationEstimatorProps) {
  const hpPercentage = (currentHP / maxHP) * 100;
  const selectedDuration = value || 60;
  
  // Get session preview and risk assessment
  const sessionPreview = formatSessionPreview(sessionType, selectedDuration, currentHP);
  const tooRisky = isSessionTooRisky(currentHP, sessionType, selectedDuration);
  const alternatives = tooRisky ? suggestAlternativeDurations(currentHP, sessionType, selectedDuration) : [];
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">Estimated Duration</label>
        <div className="grid grid-cols-3 gap-3">
          {durationOptions.map((option) => {
            const optionRisky = isSessionTooRisky(currentHP, sessionType, option.minutes);
            
            return (
              <div
                key={option.minutes}
                className={`p-3 border rounded-lg cursor-pointer transition-colors text-center ${
                  value === option.minutes
                    ? 'border-primary bg-primary/5'
                    : optionRisky 
                    ? 'border-red-200 bg-red-50 opacity-60'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => !optionRisky && onValueChange(option.minutes)}
              >
                <div className="flex flex-col items-center">
                  <span className="font-medium text-lg">{option.label}</span>
                  <span className="text-xs text-gray-600 mt-1">{option.description}</span>
                  {value === option.minutes && (
                    <Badge variant="default" className="text-xs mt-2">Selected</Badge>
                  )}
                  {optionRisky && (
                    <Badge variant="destructive" className="text-xs mt-2">Too demanding</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Preview Section */}
      {showPreview && (
        <div className="space-y-3">
          {/* Session Preview */}
          <Alert className={tooRisky ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}>
            <div className="flex items-center gap-2">
              {tooRisky ? (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              ) : (
                <Info className="h-4 w-4 text-blue-500" />
              )}
              <AlertDescription className="font-medium text-sm">
                {sessionPreview.preSessionText}
              </AlertDescription>
            </div>
          </Alert>

          {/* HP Impact Visualization */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">HP Impact</span>
              <span className="font-medium">
                {currentHP} → {Math.max(0, currentHP - sessionPreview.costBreakdown.hpCost)} HP
              </span>
            </div>
            <Progress 
              value={Math.max(0, ((currentHP - sessionPreview.costBreakdown.hpCost) / maxHP) * 100)} 
              className="h-2"
            />
            <div className="text-xs text-gray-500">
              {Math.round(((currentHP - sessionPreview.costBreakdown.hpCost) / maxHP) * 100)}% HP remaining
            </div>
          </div>

          {/* Smart Warnings */}
          {sessionPreview.smartWarnings.length > 0 && (
            <div className="space-y-1">
              {sessionPreview.smartWarnings.map((warning, index) => (
                <div key={index} className="text-xs text-amber-700 bg-amber-50 rounded p-2">
                  {warning}
                </div>
              ))}
            </div>
          )}

          {/* Risk Warning & Alternatives */}
          {tooRisky && alternatives.length > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-sm">
                <div className="font-medium mb-2">Too demanding for current HP!</div>
                <div className="text-xs">
                  Consider these alternatives: {alternatives.map(alt => `${alt}min`).join(', ')}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
