
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
    <div className="space-y-4">
      {/* Store Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-tennis-green-primary to-tennis-green-dark rounded-full shadow-md">
          <Store className="h-7 w-7 text-white" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-gray-900">Rako Store</h1>
          <p className="text-gray-600 text-sm max-w-lg mx-auto">
            Discover premium items, boosters, and upgrades
          </p>
        </div>
      </div>

      {/* Token Balance Display - Gold Theme */}
      {tokenData && (
        <Card className="bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in">
          <CardContent className="px-6 py-6">
            <div className="flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-lg opacity-20 animate-pulse"></div>
                  <p className="relative text-4xl font-bold bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-700 bg-clip-text text-transparent animate-scale-in">
                    {tokenData.regular_tokens.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-sm font-semibold text-amber-700">Regular Tokens</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-amber-400 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-1 h-1 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter - Compact */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
        <StoreSearchFilter
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Store Categories - Fixed Layout */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-200">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-tennis-green-primary to-tennis-green-dark rounded-lg">
              <Store className="h-4 w-4 text-white" />
            </div>
            Store Catalog
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {tokenData && (
              <TokenStore
                onSpendTokens={onSpendTokens}
                regularTokens={tokenData.regular_tokens}
                premiumTokens={tokenData.premium_tokens}
                className="border-0 shadow-none bg-transparent p-0"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
