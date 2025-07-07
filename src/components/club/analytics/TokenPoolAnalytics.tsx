import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import { ClubTokenAnalytics } from '@/types/clubAnalytics';

interface TokenPoolAnalyticsProps {
  analytics: ClubTokenAnalytics;
}

export function TokenPoolAnalytics({ analytics }: TokenPoolAnalyticsProps) {
  const { current_pool, financial_offset } = analytics;
  
  const totalAvailable = current_pool.allocated_tokens + current_pool.rollover_tokens + current_pool.purchased_tokens;
  const usagePercentage = totalAvailable > 0 ? (current_pool.used_tokens / totalAvailable) * 100 : 0;
  const overdraftPercentage = current_pool.overdraft_tokens > 0 ? (current_pool.overdraft_tokens / totalAvailable) * 100 : 0;

  const isOverdraft = current_pool.overdraft_tokens > 0;
  const isNearLimit = usagePercentage > 85;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Current Pool Status */}
      <Card className={`${isOverdraft ? 'border-red-300 bg-red-50' : isNearLimit ? 'border-yellow-300 bg-yellow-50' : ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            Token Pool Status
            {isOverdraft && <AlertTriangle className="h-4 w-4 text-red-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">
                  {(totalAvailable - current_pool.used_tokens).toLocaleString()}
                </span>
                <Badge variant={isOverdraft ? 'destructive' : isNearLimit ? 'secondary' : 'default'}>
                  {Math.round(usagePercentage)}% used
                </Badge>
              </div>
              <Progress 
                value={Math.min(usagePercentage, 100)} 
                className="h-2"
              />
              {isOverdraft && (
                <div className="mt-2">
                  <div className="text-sm text-red-600 font-medium">
                    Overdraft: {current_pool.overdraft_tokens.toLocaleString()} tokens
                  </div>
                  <Progress 
                    value={overdraftPercentage} 
                    className="h-1 mt-1"
                  />
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {totalAvailable.toLocaleString()} total available
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Allocation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Monthly Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Base Allocation</span>
              <span className="font-medium">{current_pool.allocated_tokens.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Rollover</span>
              <span className="font-medium text-green-600">+{current_pool.rollover_tokens.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Purchased</span>
              <span className="font-medium text-blue-600">+{current_pool.purchased_tokens.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="font-bold">{totalAvailable.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage This Month */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Usage This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{current_pool.used_tokens.toLocaleString()}</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-xs text-gray-500">tokens redeemed</div>
            <div className="flex items-center justify-between text-xs">
              <span>Daily average</span>
              <span className="font-medium">
                {Math.round(current_pool.used_tokens / new Date().getDate())}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Projected monthly</span>
              <span className="font-medium">
                {Math.round((current_pool.used_tokens / new Date().getDate()) * 30).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Impact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial Offset
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-600">
              ${financial_offset.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">value covered by tokens</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Per token value</span>
                <span>$0.007</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly savings</span>
                <span className="font-medium text-green-600">
                  ${(current_pool.used_tokens * 0.007).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}