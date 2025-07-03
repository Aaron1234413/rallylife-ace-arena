
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

      {/* Token Balance Display - Simplified */}
      {tokenData && (
        <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm">
          <CardContent className="px-6 py-5">
            <div className="flex items-center justify-center">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center mb-1">
                  <div className="p-1.5 bg-gradient-to-br from-tennis-green-primary to-tennis-green-dark rounded-lg mr-2">
                    <Coins className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {tokenData.regular_tokens.toLocaleString()}
                </p>
                <span className="text-sm font-medium text-gray-600">Regular Tokens</span>
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
