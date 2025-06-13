
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Gem, TrendingUp } from 'lucide-react';
import { TokenDisplay } from './TokenDisplay';

interface TokenCardProps {
  regularTokens: number;
  premiumTokens: number;
  lifetimeEarned: number;
  className?: string;
}

export function TokenCard({ 
  regularTokens,
  premiumTokens,
  lifetimeEarned,
  className 
}: TokenCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          Token Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TokenDisplay
          regularTokens={regularTokens}
          premiumTokens={premiumTokens}
          size="large"
          showPremium={true}
        />
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-blue-800">Lifetime Earned</span>
          </div>
          <div className="flex items-center gap-1">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="text-blue-700 font-medium">
              {lifetimeEarned.toLocaleString()} Tokens
            </span>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            Keep earning tokens through matches, achievements, and daily activities!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
