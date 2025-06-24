
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { TokenEconomy } from '@/components/dashboard/TokenEconomy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store as StoreIcon, ShoppingCart, Coins } from 'lucide-react';

const Store = () => {
  const { user } = useAuth();
  const { tokenData, loading, spendTokens, convertPremiumTokens } = usePlayerTokens();
  const { restoreHP } = usePlayerHP();

  if (loading) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="text-center">Loading store...</div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-6">
      {/* Store Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StoreIcon className="h-6 w-6" />
            Rally Store
          </CardTitle>
          <p className="text-muted-foreground">
            Spend your tokens on items, upgrades, and premium features
          </p>
        </CardHeader>
        <CardContent>
          {tokenData && (
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <Coins className="h-6 w-6 text-yellow-500" />
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-sm text-gray-600">Regular Tokens:</span>
                  <span className="ml-2 font-bold text-lg text-yellow-600">
                    {tokenData.regular_tokens.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Rally Points:</span>
                  <span className="ml-2 font-bold text-lg text-purple-600">
                    {tokenData.premium_tokens.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Token Economy Section */}
      {tokenData && (
        <TokenEconomy
          tokenData={tokenData}
          onSpendTokens={spendTokens}
          onConvertTokens={convertPremiumTokens}
          onRestoreHP={restoreHP}
        />
      )}
    </div>
  );
};

export default Store;
