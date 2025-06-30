
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ShoppingCart, Zap, Shirt, Gem, Heart, Target } from 'lucide-react';

interface StoreCategoryTabsProps {
  children: React.ReactNode;
}

export function StoreCategoryTabs({ children }: StoreCategoryTabsProps) {
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 w-full mb-6 bg-white/90 backdrop-blur-sm border border-white/20">
        <TabsTrigger value="all" className="flex items-center gap-2 text-sm">
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">All Items</span>
        </TabsTrigger>
        <TabsTrigger value="health" className="flex items-center gap-2 text-sm">
          <Heart className="h-4 w-4" />
          <span className="hidden sm:inline">Health</span>
        </TabsTrigger>
        <TabsTrigger value="boosters" className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4" />
          <span className="hidden sm:inline">Boosters</span>
        </TabsTrigger>
        <TabsTrigger value="cosmetics" className="flex items-center gap-2 text-sm">
          <Shirt className="h-4 w-4" />
          <span className="hidden sm:inline">Cosmetics</span>
        </TabsTrigger>
        <TabsTrigger value="premium" className="flex items-center gap-2 text-sm">
          <Gem className="h-4 w-4" />
          <span className="hidden sm:inline">Premium</span>
        </TabsTrigger>
        <TabsTrigger value="training" className="flex items-center gap-2 text-sm">
          <Target className="h-4 w-4" />
          <span className="hidden sm:inline">Training</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-0">
        {children}
      </TabsContent>
      <TabsContent value="health" className="mt-0">
        <div className="text-center py-8 text-gray-500">
          <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Health items will be displayed here</p>
        </div>
      </TabsContent>
      <TabsContent value="boosters" className="mt-0">
        <div className="text-center py-8 text-gray-500">
          <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Performance boosters will be available in Phase 2</p>
        </div>
      </TabsContent>
      <TabsContent value="cosmetics" className="mt-0">
        <div className="text-center py-8 text-gray-500">
          <Shirt className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Cosmetic items coming in Phase 3</p>
        </div>
      </TabsContent>
      <TabsContent value="premium" className="mt-0">
        <div className="text-center py-8 text-gray-500">
          <Gem className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Enhanced premium features coming in Phase 4</p>
        </div>
      </TabsContent>
      <TabsContent value="training" className="mt-0">
        <div className="text-center py-8 text-gray-500">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Training items and tools coming soon</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
