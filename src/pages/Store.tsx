
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { TokenEconomy } from '@/components/dashboard/TokenEconomy';
import { TokenStore } from '@/components/tokens/TokenStore';
import { PerformanceStore } from '@/components/store/PerformanceStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store as StoreIcon, ShoppingCart, Coins, Gem, Zap } from 'lucide-react';

const Store = () => {
  const { user } = useAuth();
  const { tokenData, transactions, loading, spendTokens, convertPremiumTokens } = usePlayerTokens();
  const { restoreHP } = usePlayerHP();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2 text-white">Loading store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg">
            <span className="text-xl">🏪</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Rako Store</h1>
          <p className="text-tennis-green-bg/90">Power up your game with tokens and performance boosters</p>
        </div>

        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Token Balance Header */}
          {tokenData && (
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
                  <Coins className="h-6 w-6" />
                  Your Token Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                    <div className="p-3 bg-yellow-500 rounded-full">
                      <Coins className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-yellow-700 font-medium">Regular Tokens</p>
                      <p className="text-2xl font-bold text-yellow-800">
                        {tokenData.regular_tokens.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <div className="p-3 bg-purple-500 rounded-full">
                      <Gem className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-700 font-medium">Rally Points</p>
                      <p className="text-2xl font-bold text-purple-800">
                        {tokenData.premium_tokens.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Store Tabs */}
          <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
            <Tabs defaultValue="performance" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-tennis-green-bg/10">
                <TabsTrigger 
                  value="performance" 
                  className="flex items-center gap-2 data-[state=active]:bg-tennis-green-primary data-[state=active]:text-white"
                >
                  <Zap className="h-4 w-4" />
                  Performance Boosters
                </TabsTrigger>
                <TabsTrigger 
                  value="items" 
                  className="flex items-center gap-2 data-[state=active]:bg-tennis-green-primary data-[state=active]:text-white"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Token Store
                </TabsTrigger>
                <TabsTrigger 
                  value="economy" 
                  className="flex items-center gap-2 data-[state=active]:bg-tennis-green-primary data-[state=active]:text-white"
                >
                  <Coins className="h-4 w-4" />
                  Token Economy
                </TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="mt-6">
                <PerformanceStore />
              </TabsContent>

              <TabsContent value="items" className="mt-6">
                {tokenData && (
                  <TokenStore
                    onSpendTokens={spendTokens}
                    regularTokens={tokenData.regular_tokens}
                    premiumTokens={tokenData.premium_tokens}
                    onRestoreHP={restoreHP}
                  />
                )}
              </TabsContent>

              <TabsContent value="economy" className="mt-6">
                {tokenData && (
                  <TokenEconomy
                    tokenData={tokenData}
                    transactions={transactions}
                    transactionsLoading={loading}
                    onSpendTokens={spendTokens}
                    onConvertTokens={convertPremiumTokens}
                    onRestoreHP={restoreHP}
                  />
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Store;
