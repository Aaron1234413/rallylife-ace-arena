
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface EmojiPickerProps {
  value: string;
  onValueChange: (emoji: string) => void;
}

const moodEmojis = [
  { emoji: '😊', label: 'Great' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😅', label: 'Tired' },
  { emoji: '😤', label: 'Pushed' },
  { emoji: '💪', label: 'Strong' },
  { emoji: '🔥', label: 'On Fire' },
  { emoji: '⚡', label: 'Energized' },
];

export function EmojiPicker({ value, onValueChange }: EmojiPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {moodEmojis.map((mood) => (
        <button
          key={mood.emoji}
          type="button"
          className={`p-3 rounded-lg border transition-colors text-center ${
            value === mood.emoji
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onValueChange(mood.emoji)}
        >
          <div className="text-2xl mb-1">{mood.emoji}</div>
          <div className="text-xs text-gray-600">{mood.label}</div>
        </button>
      ))}
    </div>
  );
}
