import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface TokenBalanceWidgetProps {
  tokenData: any;
  userRole: 'player' | 'coach';
  loading?: boolean;
}

export function TokenBalanceWidget({ tokenData, userRole, loading }: TokenBalanceWidgetProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const regularTokens = userRole === 'player' 
    ? tokenData?.regular_tokens || 0
    : tokenData?.ctk_balance || 0;
  const premiumTokens = userRole === 'player' 
    ? tokenData?.premium_tokens || 0
    : 0;
  const lifetimeEarned = tokenData?.lifetime_earned || 0;

  const tokenLabel = userRole === 'player' ? 'Tokens' : 'CTK';
  const tokenSubLabel = userRole === 'player' ? 'Regular tokens' : 'Coaching Token Kredits';

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-tennis-green-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-tennis-green-primary" />
            {tokenLabel} Balance
          </div>
          <Link to="/store?tab=tokens">
            <Button size="sm" variant="outline">
              <Plus className="h-3 w-3 mr-1" />
              Buy
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Token Balance */}
        <div className="text-center">
          <div className="text-3xl font-bold text-tennis-green-primary">
            {regularTokens.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">{tokenSubLabel}</div>
        </div>

        {/* Premium Tokens (Players only) */}
        {userRole === 'player' && premiumTokens > 0 && (
          <div className="text-center border-t pt-3">
            <div className="text-xl font-semibold text-purple-600">
              {premiumTokens.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Premium tokens</div>
          </div>
        )}

        {/* Token Value */}
        <div className="bg-tennis-green-bg/30 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Token Value</span>
            <div className="text-right">
              <div className="font-medium text-tennis-green-dark">
                ${(regularTokens * 0.007).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">
                $0.007 per token
              </div>
            </div>
          </div>
        </div>

        {/* Lifetime Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm border-t pt-3">
          <div>
            <div className="text-gray-600">Lifetime Earned</div>
            <div className="font-medium flex items-center gap-1">
              {lifetimeEarned.toLocaleString()}
              <TrendingUp className="h-3 w-3 text-green-500" />
            </div>
          </div>
          <div>
            <div className="text-gray-600">This Month</div>
            <div className="font-medium">
              {/* This would come from monthly stats */}
              +{Math.floor(lifetimeEarned * 0.1).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link to="/store" className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Coins className="h-3 w-3 mr-1" />
              Store
            </Button>
          </Link>
          {userRole === 'player' && (
            <Link to="/feed" className="flex-1">
              <Button size="sm" className="w-full bg-tennis-green-primary hover:bg-tennis-green-medium">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Earn More
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}