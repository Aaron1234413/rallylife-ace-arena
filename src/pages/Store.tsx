
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { TokenEconomy } from '@/components/dashboard/TokenEconomy';
import { TokenStore } from '@/components/tokens/TokenStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
          <p className="text-tennis-green-bg/90">Spend your tokens on items, upgrades, and premium features</p>
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

          {/* Store Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Token Store */}
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
                  <ShoppingCart className="h-5 w-5" />
                  Token Store
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tokenData && (
                  <TokenStore
                    onSpendTokens={spendTokens}
                    regularTokens={tokenData.regular_tokens}
                    premiumTokens={tokenData.premium_tokens}
                    onRestoreHP={restoreHP}
                    className="border-0 shadow-none bg-transparent p-0"
                  />
                )}
              </CardContent>
            </Card>

            {/* Premium Features */}
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
                  <Zap className="h-5 w-5" />
                  Premium Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-blue-900">Advanced Analytics</h3>
                      <div className="flex items-center gap-1 text-purple-600">
                        <Gem className="h-4 w-4" />
                        <span className="font-bold">5</span>
                      </div>
                    </div>
                    <p className="text-sm text-blue-700 mb-3">Get detailed insights into your performance</p>
                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                      Unlock Feature
                    </button>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-green-900">Priority Support</h3>
                      <div className="flex items-center gap-1 text-purple-600">
                        <Gem className="h-4 w-4" />
                        <span className="font-bold">3</span>
                      </div>
                    </div>
                    <p className="text-sm text-green-700 mb-3">Get faster response times and premium support</p>
                    <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                      Unlock Feature
                    </button>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-purple-900">Custom Training Plans</h3>
                      <div className="flex items-center gap-1 text-purple-600">
                        <Gem className="h-4 w-4" />
                        <span className="font-bold">8</span>
                      </div>
                    </div>
                    <p className="text-sm text-purple-700 mb-3">Get personalized training plans tailored to your needs</p>
                    <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                      Unlock Feature
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Token Economy Section */}
          {tokenData && (
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
                  <Coins className="h-5 w-5" />
                  Token Economy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TokenEconomy
                  tokenData={tokenData}
                  transactions={transactions}
                  transactionsLoading={loading}
                  onSpendTokens={spendTokens}
                  onConvertTokens={convertPremiumTokens}
                  onRestoreHP={restoreHP}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Store;
