
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FormItem, FormLabel } from '@/components/ui/form';

interface IntensitySelectorProps {
  value?: string;
  onValueChange: (intensity: string) => void;
}

const intensityLevels = [
  { value: 'light', label: 'Light', description: 'Easy pace, recovery focused' },
  { value: 'medium', label: 'Medium', description: 'Moderate effort, skill building' },
  { value: 'high', label: 'High', description: 'Intense training, competitive' },
  { value: 'max', label: 'Maximum', description: 'All-out effort, peak performance' },
];

export function IntensitySelector({ value, onValueChange }: IntensitySelectorProps) {
  return (
    <FormItem>
      <FormLabel>Training Intensity</FormLabel>
      <div className="grid grid-cols-2 gap-3">
        {intensityLevels.map((level) => (
          <div
            key={level.value}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              value === level.value
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onValueChange(level.value)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">{level.label}</span>
              {value === level.value && (
                <Badge variant="default" className="text-xs">Selected</Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">{level.description}</p>
          </div>
        ))}
      </div>
    </FormItem>
  );
}
