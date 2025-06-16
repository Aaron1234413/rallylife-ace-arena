
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TokenEarningIndicatorProps {
  regularTokens: number;
  premiumTokens: number;
  dailyEarned?: number;
  weeklyAverage?: number;
  earningRate?: 'low' | 'medium' | 'high';
  className?: string;
}

export function TokenEarningIndicator({ 
  regularTokens, 
  premiumTokens, 
  dailyEarned = 0,
  weeklyAverage = 0,
  earningRate = 'medium',
  className 
}: TokenEarningIndicatorProps) {
  const getRateStatus = (rate: string) => {
    switch (rate) {
      case 'high':
        return {
          label: 'High Earning',
          icon: Zap,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          description: 'Great earning rate! Keep it up!'
        };
      case 'medium':
        return {
          label: 'Steady Earning',
          icon: TrendingUp,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          description: 'Good consistent progress'
        };
      case 'low':
        return {
          label: 'Low Activity',
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          description: 'More activities = more tokens!'
        };
      default:
        return {
          label: 'Steady Earning',
          icon: TrendingUp,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          description: 'Good consistent progress'
        };
    }
  };

  const rateStatus = getRateStatus(earningRate);
  const RateIcon = rateStatus.icon;

  return (
    <Card className={cn('border-l-4 border-l-yellow-400', className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Coins className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900">Token Balance</h3>
        </div>

        {/* Token Balances */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">{regularTokens}</div>
            <div className="text-xs text-yellow-600">Regular Tokens</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-700">{premiumTokens}</div>
            <div className="text-xs text-purple-600">Premium Tokens</div>
          </div>
        </div>

        {/* Earning Rate Status */}
        <div className={cn('p-3 rounded-lg mb-3', rateStatus.bgColor)}>
          <div className="flex items-center gap-2 mb-1">
            <RateIcon className={cn('h-4 w-4', rateStatus.color)} />
            <Badge variant="secondary" className={cn(rateStatus.bgColor, rateStatus.color)}>
              {rateStatus.label}
            </Badge>
          </div>
          <p className={cn('text-sm', rateStatus.color)}>
            {rateStatus.description}
          </p>
        </div>

        {/* Daily/Weekly Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-700">{dailyEarned}</div>
            <div className="text-gray-500">Earned Today</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-700">{Math.round(weeklyAverage)}</div>
            <div className="text-gray-500">Weekly Avg</div>
          </div>
        </div>

        {/* Earning Tips */}
        {earningRate === 'low' && (
          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-xs text-orange-700">
              💡 Tip: Complete training sessions and matches to earn more tokens!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
