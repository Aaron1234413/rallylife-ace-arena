
import React from 'react';
import { Coins } from 'lucide-react';

interface TokenDisplayProps {
  regularTokens: number;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function TokenDisplay({ 
  regularTokens, 
  size = 'medium',
  className = '' 
}: TokenDisplayProps) {
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const iconSizes = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6'
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Coins className={`${iconSizes[size]} text-yellow-500`} />
      <span className={`font-semibold text-yellow-600 ${sizeClasses[size]}`}>
        {regularTokens.toLocaleString()}
      </span>
    </div>
  );
}
