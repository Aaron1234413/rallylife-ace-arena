
import React from 'react';
import { Users, User } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface MatchTypeToggleProps {
  isDoubles: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
}

export function MatchTypeToggle({ isDoubles, onToggle, disabled = false }: MatchTypeToggleProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-all duration-300",
        "hover:bg-gray-100 active:scale-98",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => !disabled && onToggle(!isDoubles)}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-full transition-colors duration-200",
          isDoubles ? "bg-tennis-green-dark text-white" : "bg-gray-200 text-gray-600"
        )}>
          {isDoubles ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
        </div>
        <div>
          <span className="font-medium text-base">
            {isDoubles ? 'Doubles Match' : 'Singles Match'}
          </span>
          <p className="text-sm text-gray-600">
            {isDoubles ? 'Play with a partner' : 'One-on-one match'}
          </p>
        </div>
      </div>
      <Switch
        checked={isDoubles}
        onCheckedChange={onToggle}
        disabled={disabled}
        className="pointer-events-none"
      />
    </div>
  );
}
