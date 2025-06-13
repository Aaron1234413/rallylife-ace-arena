
import React from 'react';
import { Coins, Gem } from 'lucide-react';

interface TokenDisplayProps {
  regularTokens: number;
  premiumTokens?: number;
  size?: 'small' | 'medium' | 'large';
  showPremium?: boolean;
  className?: string;
}

export function TokenDisplay({ 
  regularTokens, 
  premiumTokens = 0, 
  size = 'medium',
  showPremium = true,
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
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Regular Tokens */}
      <div className="flex items-center gap-1">
        <Coins className={`${iconSizes[size]} text-yellow-500`} />
        <span className={`font-semibold text-yellow-600 ${sizeClasses[size]}`}>
          {regularTokens.toLocaleString()}
        </span>
      </div>

      {/* Premium Tokens (Rally Points) */}
      {showPremium && (
        <div className="flex items-center gap-1">
          <Gem className={`${iconSizes[size]} text-purple-500`} />
          <span className={`font-semibold text-purple-600 ${sizeClasses[size]}`}>
            {premiumTokens.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
