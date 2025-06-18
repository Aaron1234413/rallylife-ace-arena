
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FormItem, FormLabel } from '@/components/ui/form';

interface SkillsChipSelectorProps {
  value: string[];
  onValueChange: (skills: string[]) => void;
}

const availableSkills = [
  'Forehand',
  'Backhand',
  'Serve',
  'Return',
  'Volley',
  'Overhead',
  'Footwork',
  'Strategy',
  'Mental Game',
  'Fitness',
  'Court Coverage',
  'Drop Shot',
];

export function SkillsChipSelector({ value, onValueChange }: SkillsChipSelectorProps) {
  const toggleSkill = (skill: string) => {
    if (value.includes(skill)) {
      onValueChange(value.filter(s => s !== skill));
    } else {
      onValueChange([...value, skill]);
    }
  };

  return (
    <FormItem>
      <FormLabel>Skills Focus (Optional)</FormLabel>
      <div className="flex flex-wrap gap-2">
        {availableSkills.map((skill) => (
          <Badge
            key={skill}
            variant={value.includes(skill) ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/80"
            onClick={() => toggleSkill(skill)}
          >
            {skill}
          </Badge>
        ))}
      </div>
      {value.length > 0 && (
        <div className="text-sm text-gray-500 mt-2">
          Selected: {value.join(', ')}
        </div>
      )}
    </FormItem>
  );
}
