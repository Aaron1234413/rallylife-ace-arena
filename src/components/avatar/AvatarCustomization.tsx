
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlayerAvatar } from '@/hooks/usePlayerAvatar';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { AvatarDisplay } from './AvatarDisplay';
import { 
  Palette, 
  Lock, 
  Check, 
  Star, 
  Coins, 
  Gem,
  ShoppingCart,
  Shirt,
  Eye,
  Crown
} from 'lucide-react';

interface AvatarCustomizationProps {
  className?: string;
}

const categoryIcons = {
  hair: Crown,
  clothing: Shirt,
  accessories: Eye
};

const rarityColors = {
  common: 'bg-gray-100 text-gray-800 border-gray-200',
  rare: 'bg-blue-100 text-blue-800 border-blue-200',
  epic: 'bg-purple-100 text-purple-800 border-purple-200',
  legendary: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

export function AvatarCustomization({ className }: AvatarCustomizationProps) {
  const { 
    allItems, 
    loading, 
    purchaseItem, 
    equipItem, 
    getEquippedAvatar,
    getItemsByCategory,
    isItemOwned,
    isItemEquipped,
    canUnlockItem 
  } = usePlayerAvatar();
  const { tokenData } = usePlayerTokens();
  const { xpData } = usePlayerXP();
  const [selectedCategory, setSelectedCategory] = useState('hair');

  const categories = ['hair', 'clothing', 'accessories'];
  const equippedAvatar = getEquippedAvatar();

  const handlePurchase = async (itemId: string) => {
    await purchaseItem(itemId);
  };

  const handleEquip = async (itemId: string) => {
    await equipItem(itemId);
  };

  const renderItem = (item: any) => {
    const owned = isItemOwned(item.id);
    const equipped = isItemEquipped(item.id);
    const canUnlock = canUnlockItem(item, xpData?.current_level || 1);
    const CategoryIcon = categoryIcons[item.category as keyof typeof categoryIcons];

    return (
      <Card key={item.id} className={`relative ${equipped ? 'ring-2 ring-tennis-green-dark' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {CategoryIcon && <CategoryIcon className="h-4 w-4" />}
              <CardTitle className="text-sm">{item.name}</CardTitle>
            </div>
            <Badge 
              variant="outline" 
              className={rarityColors[item.rarity as keyof typeof rarityColors]}
            >
              {item.rarity}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Item Preview */}
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <img 
                src={item.image_url} 
                alt={item.name}
                className="w-12 h-12 rounded"
              />
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600">{item.description}</p>

            {/* Status */}
            {equipped && (
              <Badge className="w-full justify-center bg-tennis-green-dark">
                <Check className="h-3 w-3 mr-1" />
                Equipped
              </Badge>
            )}

            {/* Actions */}
            {!owned ? (
              <div className="space-y-2">
                {item.unlock_type === 'free' || item.is_default ? (
                  <Badge variant="secondary" className="w-full justify-center">
                    Free Item
                  </Badge>
                ) : item.unlock_type === 'level' ? (
                  <div>
                    {canUnlock ? (
                      <Badge variant="secondary" className="w-full justify-center">
                        <Star className="h-3 w-3 mr-1" />
                        Level {item.unlock_requirement?.level} Unlocked
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="w-full justify-center">
                        <Lock className="h-3 w-3 mr-1" />
                        Requires Level {item.unlock_requirement?.level}
                      </Badge>
                    )}
                  </div>
                ) : item.unlock_type === 'purchase' ? (
                  <div className="space-y-2">
                    {/* Cost Display */}
                    <div className="flex items-center justify-center gap-2 text-sm">
                      {item.token_cost > 0 && (
                        <div className="flex items-center gap-1">
                          <Coins className="h-3 w-3 text-yellow-500" />
                          <span>{item.token_cost}</span>
                        </div>
                      )}
                      {item.premium_cost > 0 && (
                        <div className="flex items-center gap-1">
                          <Gem className="h-3 w-3 text-purple-500" />
                          <span>{item.premium_cost}</span>
                        </div>
                      )}
                    </div>

                    {/* Purchase Button */}
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handlePurchase(item.id)}
                      disabled={
                        (item.token_cost > 0 && (tokenData?.regular_tokens || 0) < item.token_cost) ||
                        (item.premium_cost > 0 && (tokenData?.premium_tokens || 0) < item.premium_cost)
                      }
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Purchase
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : !equipped ? (
              <Button
                size="sm"
                className="w-full"
                onClick={() => handleEquip(item.id)}
                variant="outline"
              >
                Equip
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <p className="text-center">Loading avatar customization...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Avatar Customization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Avatar Preview */}
          <div className="text-center space-y-2">
            <h3 className="font-semibold">Your Avatar</h3>
            <div className="flex justify-center">
              <AvatarDisplay 
                size="xl" 
                showBorder={true}
                equippedItems={equippedAvatar}
              />
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-3">
              {categories.map(category => {
                const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
                return (
                  <TabsTrigger key={category} value={category} className="flex items-center gap-2">
                    {CategoryIcon && <CategoryIcon className="h-4 w-4" />}
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {getItemsByCategory(category).map(renderItem)}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
