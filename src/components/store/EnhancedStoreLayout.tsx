
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
    <div className="space-y-6">
      {/* Store Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg">
          <Store className="h-8 w-8 text-tennis-green-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Rako Store</h1>
          <p className="text-tennis-green-bg/90 text-lg">
            Discover premium items, boosters, and upgrades
          </p>
        </div>
      </div>

      {/* Token Balance Display */}
      {tokenData && (
        <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
              <Coins className="h-5 w-5" />
              Your Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-700">Regular Tokens</span>
                </div>
                <p className="text-2xl font-bold text-yellow-800">
                  {tokenData.regular_tokens.toLocaleString()}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Gem className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium text-purple-700">Rally Points</span>
                </div>
                <p className="text-2xl font-bold text-purple-800">
                  {tokenData.premium_tokens.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
        <CardContent className="p-6">
          <StoreSearchFilter
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
        </CardContent>
      </Card>

      {/* Store Categories */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
        <CardContent className="p-6">
          <StoreCategoryTabs>
            {/* Current Token Store Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-tennis-green-dark mb-4">
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
              
              <div>
                <h3 className="text-lg font-semibold text-tennis-green-dark mb-4">
                  Coming Soon
                </h3>
                <div className="space-y-3 text-center py-8">
                  <div className="text-6xl opacity-20">🚀</div>
                  <p className="text-gray-600">
                    More amazing items and features are coming in the next phases!
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      Performance Boosters
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      Cosmetic Items
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
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
