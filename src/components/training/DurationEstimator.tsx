
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface DurationEstimatorProps {
  value?: number;
  onValueChange: (duration: number) => void;
}

const durationOptions = [
  { minutes: 15, label: '15 min', description: 'Quick session' },
  { minutes: 30, label: '30 min', description: 'Short workout' },
  { minutes: 45, label: '45 min', description: 'Standard session' },
  { minutes: 60, label: '1 hour', description: 'Full training' },
  { minutes: 90, label: '1.5 hours', description: 'Extended session' },
  { minutes: 120, label: '2 hours', description: 'Intensive training' },
];

export function DurationEstimator({ value, onValueChange }: DurationEstimatorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none">Estimated Duration</label>
      <div className="grid grid-cols-3 gap-3">
        {durationOptions.map((option) => (
          <div
            key={option.minutes}
            className={`p-3 border rounded-lg cursor-pointer transition-colors text-center ${
              value === option.minutes
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onValueChange(option.minutes)}
          >
            <div className="flex flex-col items-center">
              <span className="font-medium text-lg">{option.label}</span>
              <span className="text-xs text-gray-600 mt-1">{option.description}</span>
              {value === option.minutes && (
                <Badge variant="default" className="text-xs mt-2">Selected</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
