import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Coins,
  Package,
  Grid,
  List
} from 'lucide-react';
import { 
  merchandiseItems, 
  getMerchandiseByCategory, 
  getFeaturedMerchandise,
  merchandiseCategories,
  type MerchandiseItem 
} from '@/data/merchandiseItems';
import { MerchandiseCheckout } from './MerchandiseCheckout';

interface MerchandiseStoreProps {
  regularTokens?: number;
  className?: string;
}

export function MerchandiseStore({ 
  regularTokens = 0,
  className = '' 
}: MerchandiseStoreProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<MerchandiseItem | null>(null);

  const handleRakoCheckout = (item: MerchandiseItem) => {
    setSelectedItem(item);
  };

  // Show checkout if item is selected
  if (selectedItem) {
    return (
      <MerchandiseCheckout 
        item={selectedItem} 
        onBack={() => setSelectedItem(null)} 
      />
    );
  }

  const getItemsForCategory = (category: string): MerchandiseItem[] => {
    if (category === 'featured') {
      return getFeaturedMerchandise();
    }
    return getMerchandiseByCategory(category as MerchandiseItem['category']);
  };


  const renderMerchandiseItem = (item: MerchandiseItem) => {
    if (viewMode === 'list') {
      return (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-grow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-tennis-green-dark">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-tennis-green-dark">
                      ${item.price_usd}
                    </div>
                    {item.price_tokens && (
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        {item.price_tokens} tokens
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Button
                    onClick={() => handleRakoCheckout(item)}
                    className="bg-tennis-green-primary hover:bg-tennis-green-dark"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy with Rako
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card key={item.id} className="hover:shadow-md transition-shadow h-full">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Product Info */}
            <div>
              <h3 className="font-semibold text-tennis-green-dark line-clamp-2">
                {item.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {item.description}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-1">
              {item.features.slice(0, 2).map((feature, index) => (
                <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                  <div className="w-1 h-1 bg-tennis-green-primary rounded-full" />
                  {feature}
                </div>
              ))}
            </div>

            {/* Price & Actions */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-tennis-green-dark">
                  ${item.price_usd}
                </div>
                {item.price_tokens && (
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Coins className="h-3 w-3" />
                    {item.price_tokens}
                  </div>
                )}
              </div>

              <Button
                onClick={() => handleRakoCheckout(item)}
                className="w-full bg-tennis-green-primary hover:bg-tennis-green-dark"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buy with Rako
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-tennis-green-dark">Tennis Merchandise</h2>
          <p className="text-gray-600">Professional tennis equipment by Diadem Sports</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full">
          <TabsTrigger value="featured">Featured</TabsTrigger>
          {merchandiseCategories.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              <span className="hidden sm:inline">{category.icon}</span>
              <span className="ml-1">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-4'
          }>
            {getItemsForCategory(selectedCategory).map(renderMerchandiseItem)}
          </div>
          
          {getItemsForCategory(selectedCategory).length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600">Check back soon for new merchandise in this category.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}