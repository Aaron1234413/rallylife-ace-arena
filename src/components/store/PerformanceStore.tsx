
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Zap, 
  BookOpen, 
  Users, 
  Heart, 
  GraduationCap,
  Coins,
  Package
} from 'lucide-react';
import { usePerformanceBoosters } from '@/hooks/usePerformanceBoosters';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { PerformanceBoosterCard } from './PerformanceBoosterCard';
import { ActiveBoostersDisplay } from './ActiveBoostersDisplay';
import { cn } from '@/lib/utils';

const categoryConfig = {
  all: { label: 'All Boosters', icon: Package },
  match: { label: 'Match', icon: Zap },
  training: { label: 'Training', icon: BookOpen },
  social: { label: 'Social', icon: Users },
  recovery: { label: 'Recovery', icon: Heart },
  coaching: { label: 'Coaching', icon: GraduationCap }
};

export function PerformanceStore() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { 
    boosters, 
    userBoosters, 
    cooldowns, 
    loading, 
    purchaseBooster, 
    purchaseLoading 
  } = usePerformanceBoosters();
  const { tokenData } = usePlayerTokens();

  const filteredBoosters = activeCategory === 'all' 
    ? boosters 
    : boosters.filter(b => b.effect_type === activeCategory);

  const activeBoosters = userBoosters.filter(ub => 
    ub.used_at && !ub.effect_applied && ub.is_active
  );

  const availableBoosters = userBoosters.filter(ub => 
    !ub.used_at && ub.is_active
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tennis-green-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-tennis-green-dark to-tennis-green-medium text-white border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Performance Store</CardTitle>
                <p className="text-tennis-green-bg/90">
                  Boost your game with powerful performance enhancers
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="h-5 w-5 text-yellow-300" />
                <span className="text-xl font-bold text-yellow-300">
                  {tokenData?.regular_tokens?.toLocaleString() || 0}
                </span>
              </div>
              <p className="text-xs text-tennis-green-bg/70">Available Tokens</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Active Boosters */}
      {activeBoosters.length > 0 && (
        <ActiveBoostersDisplay activeBoosters={activeBoosters} />
      )}

      {/* Store Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-6 bg-tennis-green-bg/10">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon;
            const count = key === 'all' ? boosters.length : 
              boosters.filter(b => b.effect_type === key).length;
            
            return (
              <TabsTrigger
                key={key}
                value={key}
                className="flex flex-col items-center gap-1 data-[state=active]:bg-tennis-green-primary data-[state=active]:text-white"
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{config.label}</span>
                <Badge variant="secondary" className="text-xs">
                  {count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBoosters.map((booster) => {
              const cooldown = cooldowns.find(c => c.booster_id === booster.id);
              
              return (
                <PerformanceBoosterCard
                  key={booster.id}
                  booster={booster}
                  onPurchase={purchaseBooster}
                  cooldown={cooldown}
                  userTokens={tokenData?.regular_tokens || 0}
                  purchasing={purchaseLoading}
                />
              );
            })}
          </div>

          {filteredBoosters.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No boosters available in this category</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* User's Available Boosters Inventory */}
      {availableBoosters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Your Booster Inventory
              <Badge variant="secondary">{availableBoosters.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableBoosters.map((userBooster) => (
                <div
                  key={userBooster.id}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-green-800">
                      {userBooster.performance_boosters.name}
                    </p>
                    <p className="text-xs text-green-600">
                      Ready to use
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    Owned
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
