
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

      {/* Token Balance Display - Fixed Sizing */}
      {tokenData && (
        <Card className="bg-white/98 backdrop-blur-sm border-tennis-green-light/30 shadow-xl ring-1 ring-tennis-green-light/10">
          <CardHeader className="pb-4 bg-gradient-to-r from-tennis-green-primary/3 to-tennis-green-light/3">
            <CardTitle className="flex items-center gap-2 text-tennis-green-dark text-lg font-semibold">
              <div className="p-1.5 bg-gradient-to-br from-tennis-green-primary to-tennis-green-dark rounded-lg">
                <Coins className="h-5 w-5 text-white" />
              </div>
              Your Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="p-1.5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg">
                    <Coins className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-yellow-700">Regular Tokens</span>
                </div>
                <p className="text-2xl font-bold text-yellow-800">
                  {tokenData.regular_tokens.toLocaleString()}
                </p>
              </div>
              
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-tennis-green-light to-transparent"></div>
              
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="p-1.5 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
                    <Gem className="h-4 w-4 text-white" />
                  </div>
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

      {/* Search and Filter - Simplified */}
      <Card className="bg-white/98 backdrop-blur-sm border-gray-200/50 shadow-sm">
        <CardContent className="p-4">
          <StoreSearchFilter
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
        </CardContent>
      </Card>

      {/* Store Categories - Fixed Sizing */}
      <Card className="bg-white/98 backdrop-blur-sm border-tennis-green-light/20 shadow-lg">
        <CardHeader className="pb-3 border-b border-tennis-green-light/10">
          <CardTitle className="text-lg font-semibold text-tennis-green-dark flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-tennis-green-primary to-tennis-green-dark rounded-lg">
              <Store className="h-4 w-4 text-white" />
            </div>
            Store Catalog
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <StoreCategoryTabs>
            {/* Current Token Store Content - Optimized Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-tennis-green-light/20">
                  <div className="w-2 h-2 bg-gradient-to-br from-tennis-green-primary to-tennis-green-dark rounded-full"></div>
                  <h3 className="text-base font-semibold text-tennis-green-dark">
                    Items & Consumables
                  </h3>
                  <Badge variant="secondary" className="text-xs px-2 py-1 bg-tennis-green-bg text-tennis-green-dark">
                    Active
                  </Badge>
                </div>
                {tokenData && (
                  <TokenStore
                    onSpendTokens={onSpendTokens}
                    regularTokens={tokenData.regular_tokens}
                    premiumTokens={tokenData.premium_tokens}
                    className="border-0 shadow-none bg-transparent p-0"
                  />
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <div className="w-2 h-2 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full"></div>
                  <h3 className="text-base font-semibold text-gray-600">
                    Coming Soon
                  </h3>
                </div>
                <div className="space-y-4 text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg border border-gray-200/50">
                  <div className="text-4xl opacity-30">🚀</div>
                  <div className="space-y-2">
                    <h4 className="text-base font-semibold text-gray-700">Exciting Features Ahead!</h4>
                    <p className="text-gray-600 text-sm max-w-md mx-auto">
                      More amazing items and features are coming in the next phases!
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-xs font-medium">
                      Performance Boosters
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full text-xs font-medium">
                      Cosmetic Items
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full text-xs font-medium">
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
