
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SessionTypeSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
}

const sessionTypes = [
  { value: 'technique', label: 'Technique Practice' },
  { value: 'fitness', label: 'Fitness Training' },
  { value: 'match_prep', label: 'Match Preparation' },
  { value: 'drills', label: 'Skill Drills' },
  { value: 'serve_practice', label: 'Serve Practice' },
  { value: 'general', label: 'General Training' },
];

export function SessionTypeSelector({ value, onValueChange }: SessionTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none">Session Type</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="What type of training session?" />
        </SelectTrigger>
        <SelectContent>
          {sessionTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
