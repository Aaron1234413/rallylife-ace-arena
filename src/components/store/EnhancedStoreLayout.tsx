
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
    <div className="space-y-6">
      {/* Store Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg border border-gray-200">
          <Store className="h-8 w-8 text-tennis-green-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Rako Store</h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            Discover premium items, boosters, and upgrades
          </p>
        </div>
      </div>

      {/* Token Balance Display - Simplified */}
      {tokenData && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-900 text-base font-semibold">
              <div className="p-1.5 bg-gradient-to-br from-tennis-green-primary to-tennis-green-dark rounded-lg">
                <Coins className="h-4 w-4 text-white" />
              </div>
              Your Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-4">
            <div className="flex items-center justify-center">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="p-1.5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg">
                    <Coins className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Regular Tokens</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {tokenData.regular_tokens.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter - Simplified */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <StoreSearchFilter
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
        </CardContent>
      </Card>

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
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <div className="w-2 h-2 bg-gradient-to-br from-tennis-green-primary to-tennis-green-dark rounded-full"></div>
              <h3 className="text-sm font-semibold text-gray-900">
                Items & Consumables
              </h3>
              <Badge variant="secondary" className="text-xs px-2 py-1 bg-green-100 text-green-800">
                Available
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
        </CardContent>
      </Card>
    </div>
  );
}
