
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StoreCategoryTabs } from './StoreCategoryTabs';
import { StoreSearchFilter } from './StoreSearchFilter';
import { TokenStore } from '@/components/tokens/TokenStore';
import { Coins, Gem, Store } from 'lucide-react';

interface EnhancedStoreLayoutProps {
  tokenData: any;
  onSpendTokens: (amount: number, tokenType: string, source: string, description?: string) => Promise<boolean>;
}

export function EnhancedStoreLayout({ 
  tokenData, 
  onSpendTokens
}: EnhancedStoreLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priceRange: 'all',
    tokenType: 'all',
    availability: 'all'
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Search functionality will be implemented in future phases
    console.log('Searching for:', query);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    // Filter functionality will be implemented in future phases
    console.log('Filters changed:', newFilters);
  };

  return (
    <div className="space-y-8">
      {/* Store Header */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg">
          <Store className="h-10 w-10 text-tennis-green-primary" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-white mb-3">Rako Store</h1>
          <p className="text-tennis-green-bg/90 text-lg max-w-2xl mx-auto">
            Discover premium items, boosters, and upgrades
          </p>
        </div>
      </div>

      {/* Token Balance Display */}
      {tokenData && (
        <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-tennis-green-dark text-xl">
              <Coins className="h-6 w-6" />
              Your Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="flex items-center justify-center gap-12">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Coins className="h-6 w-6 text-yellow-500" />
                  <span className="text-base font-medium text-yellow-700">Regular Tokens</span>
                </div>
                <p className="text-3xl font-bold text-yellow-800">
                  {tokenData.regular_tokens.toLocaleString()}
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gem className="h-6 w-6 text-purple-500" />
                  <span className="text-base font-medium text-purple-700">Rally Points</span>
                </div>
                <p className="text-3xl font-bold text-purple-800">
                  {tokenData.premium_tokens.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
        <CardContent className="p-8">
          <StoreSearchFilter
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
        </CardContent>
      </Card>

      {/* Store Categories */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
        <CardContent className="p-8">
          <StoreCategoryTabs>
            {/* Current Token Store Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-tennis-green-dark">
                  Items & Consumables
                </h3>
                {tokenData && (
                  <TokenStore
                    onSpendTokens={onSpendTokens}
                    regularTokens={tokenData.regular_tokens}
                    premiumTokens={tokenData.premium_tokens}
                    className="border-0 shadow-none bg-transparent p-0"
                  />
                )}
              </div>
              
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-tennis-green-dark">
                  Coming Soon
                </h3>
                <div className="space-y-4 text-center py-12">
                  <div className="text-6xl opacity-20">🚀</div>
                  <p className="text-gray-600 text-lg">
                    More amazing items and features are coming in the next phases!
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 mt-6">
                    <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      Performance Boosters
                    </span>
                    <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      Cosmetic Items
                    </span>
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Training Tools
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </StoreCategoryTabs>
        </CardContent>
      </Card>
    </div>
  );
}
