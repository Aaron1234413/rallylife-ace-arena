import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  ShoppingCart, 
  Info,
  Wallet,
  Crown
} from 'lucide-react';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';

interface TokenBalanceProps {
  showTransactionHistory?: boolean;
  showPurchaseOptions?: boolean;
  onPurchaseClick?: () => void;
  onHistoryClick?: () => void;
  className?: string;
}

export function TokenBalance({
  showTransactionHistory = true,
  showPurchaseOptions = true,
  onPurchaseClick,
  onHistoryClick,
  className
}: TokenBalanceProps) {
  const { 
    tokenData, 
    regularTokens, 
    premiumTokens, 
    lifetimeEarned, 
    transactions, 
    loading 
  } = usePlayerTokens();

  const recentTransactions = transactions.slice(0, 5);
  const lastTransaction = transactions[0];
  const recentEarnings = transactions
    .filter(t => t.transaction_type === 'earn')
    .slice(0, 3)
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate progress to next "tier" based on lifetime earned
  const getTokenTier = (lifetime: number) => {
    if (lifetime >= 10000) return { name: 'Diamond', color: 'text-purple-600', progress: 100, next: null };
    if (lifetime >= 5000) return { name: 'Gold', color: 'text-yellow-600', progress: (lifetime - 5000) / 5000 * 100, next: 10000 };
    if (lifetime >= 1000) return { name: 'Silver', color: 'text-gray-600', progress: (lifetime - 1000) / 4000 * 100, next: 5000 };
    return { name: 'Bronze', color: 'text-orange-600', progress: lifetime / 1000 * 100, next: 1000 };
  };

  const tier = getTokenTier(lifetimeEarned);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-muted rounded w-32"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-tennis-yellow" />
              Token Balance
            </div>
            <Badge variant="outline" className={`${tier.color} border-current`}>
              <Crown className="h-3 w-3 mr-1" />
              {tier.name}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Main Balance Display */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Coins className="h-6 w-6 text-tennis-yellow" />
              <span className="text-3xl font-bold">{regularTokens}</span>
              <span className="text-lg text-muted-foreground">tokens</span>
            </div>
            
            {premiumTokens > 0 && (
              <div className="flex items-center justify-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-lg font-semibold text-yellow-600">{premiumTokens}</span>
                <span className="text-sm text-muted-foreground">premium tokens</span>
              </div>
            )}
          </div>

          {/* Tier Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Lifetime Earned:</span>
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-tennis-yellow" />
                <span className="font-medium">{lifetimeEarned}</span>
              </div>
            </div>
            
            {tier.next && (
              <>
                <Progress value={tier.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{tier.name} Tier</span>
                  <span>{tier.next - lifetimeEarned} to next tier</span>
                </div>
              </>
            )}
          </div>

          {/* Recent Activity Summary */}
          {lastTransaction && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Recent Activity</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Last {recentTransactions.length} transactions</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Transaction:</span>
                  <div className={`flex items-center gap-1 ${
                    lastTransaction.transaction_type === 'earn' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {lastTransaction.transaction_type === 'earn' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span className="font-medium">
                      {lastTransaction.transaction_type === 'earn' ? '+' : '-'}{lastTransaction.amount}
                    </span>
                  </div>
                </div>
                
                {recentEarnings > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Recent Earnings:</span>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span className="font-medium">+{recentEarnings}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {showPurchaseOptions && (
              <Button
                size="sm"
                onClick={onPurchaseClick}
                className="flex-1"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Purchase
              </Button>
            )}
            
            {showTransactionHistory && (
              <Button
                size="sm"
                variant="outline"
                onClick={onHistoryClick}
                className="flex-1"
              >
                History
              </Button>
            )}
          </div>

          {/* Quick Tips */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Earn tokens by winning challenges and completing training</p>
            <p>• 10% platform fee applies to all session stakes</p>
            <p>• Higher lifetime earnings unlock better tier benefits</p>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}