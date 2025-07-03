
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

      {/* Token Balance Display - Enhanced Prominence */}
      {tokenData && (
        <Card className="bg-gradient-to-br from-white via-white to-tennis-green-bg/5 backdrop-blur-sm border-tennis-green-light/30 shadow-2xl ring-1 ring-tennis-green-light/20">
          <CardHeader className="pb-4 bg-gradient-to-r from-tennis-green-primary/5 to-tennis-green-light/5">
            <CardTitle className="flex items-center gap-3 text-tennis-green-dark text-2xl font-bold">
              <div className="p-2 bg-gradient-to-br from-tennis-green-primary to-tennis-green-dark rounded-full">
                <Coins className="h-7 w-7 text-white" />
              </div>
              Your Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="flex items-center justify-center gap-16">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full">
                    <Coins className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-yellow-700">Regular Tokens</span>
                </div>
                <p className="text-4xl font-bold text-yellow-800 bg-gradient-to-b from-yellow-700 to-yellow-900 bg-clip-text text-transparent">
                  {tokenData.regular_tokens.toLocaleString()}
                </p>
              </div>
              
              <div className="h-16 w-px bg-gradient-to-b from-transparent via-tennis-green-light to-transparent"></div>
              
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full">
                    <Gem className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-purple-700">Rally Points</span>
                </div>
                <p className="text-4xl font-bold text-purple-800 bg-gradient-to-b from-purple-700 to-purple-900 bg-clip-text text-transparent">
                  {tokenData.premium_tokens.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter - Enhanced Section */}
      <Card className="bg-white/98 backdrop-blur-sm border-tennis-green-light/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-3 border-b border-tennis-green-light/10">
          <CardTitle className="text-lg font-semibold text-tennis-green-dark flex items-center gap-2">
            <div className="w-2 h-2 bg-tennis-green-primary rounded-full"></div>
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-6">
          <StoreSearchFilter
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
        </CardContent>
      </Card>

      {/* Store Categories - Enhanced Visual Hierarchy */}
      <Card className="bg-white/98 backdrop-blur-sm border-tennis-green-light/20 shadow-lg">
        <CardHeader className="pb-4 border-b border-tennis-green-light/10">
          <CardTitle className="text-2xl font-bold text-tennis-green-dark flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-tennis-green-primary to-tennis-green-dark rounded-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            Store Catalog
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <StoreCategoryTabs>
            {/* Current Token Store Content - Optimized Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-tennis-green-light/20">
                  <div className="w-3 h-3 bg-gradient-to-br from-tennis-green-primary to-tennis-green-dark rounded-full"></div>
                  <h3 className="text-2xl font-bold text-tennis-green-dark">
                    Items & Consumables
                  </h3>
                  <Badge variant="secondary" className="text-xs px-2 py-1 bg-tennis-green-bg text-tennis-green-dark">
                    {/* We'll add item count here */}
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
              
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                  <div className="w-3 h-3 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full"></div>
                  <h3 className="text-2xl font-bold text-gray-600">
                    Coming Soon
                  </h3>
                </div>
                <div className="space-y-6 text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50">
                  <div className="text-7xl opacity-30">🚀</div>
                  <div className="space-y-3">
                    <h4 className="text-xl font-semibold text-gray-700">Exciting Features Ahead!</h4>
                    <p className="text-gray-600 text-base max-w-md mx-auto leading-relaxed">
                      More amazing items and features are coming in the next phases!
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-8">
                    <span className="px-5 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-sm font-semibold shadow-sm">
                      Performance Boosters
                    </span>
                    <span className="px-5 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full text-sm font-semibold shadow-sm">
                      Cosmetic Items
                    </span>
                    <span className="px-5 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full text-sm font-semibold shadow-sm">
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
