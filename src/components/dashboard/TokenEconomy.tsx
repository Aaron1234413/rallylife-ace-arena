
import React from 'react';
import { TokenStore } from '@/components/tokens/TokenStore';
import { TokenTransactionHistory } from '@/components/tokens/TokenTransactionHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, TrendingUp } from 'lucide-react';

interface TokenEconomyProps {
  tokenData: any;
  transactions: any[];
  transactionsLoading: boolean;
  onSpendTokens: (amount: number, tokenType: string, source: string, description?: string) => Promise<boolean>;
  onConvertTokens: (amount: number) => Promise<boolean>;
  onRestoreHP?: (amount: number, activityType: string, description?: string) => Promise<void>;
}

export function TokenEconomy({ 
  tokenData, 
  transactions,
  transactionsLoading,
  onSpendTokens, 
  onConvertTokens,
  onRestoreHP 
}: TokenEconomyProps) {
  return (
    <div className="space-y-6">
      {/* Token Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-500" />
              Regular Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {tokenData.regular_tokens.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Available to spend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4 text-purple-500" />
              Rally Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {tokenData.premium_tokens.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Premium currency</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tokenData.lifetime_earned.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Token Store */}
      <TokenStore
        onSpendTokens={onSpendTokens}
        regularTokens={tokenData.regular_tokens}
        premiumTokens={tokenData.premium_tokens}
        onRestoreHP={onRestoreHP}
      />

      {/* Transaction History */}
      <TokenTransactionHistory 
        transactions={transactions}
        loading={transactionsLoading}
      />
    </div>
  );
}
