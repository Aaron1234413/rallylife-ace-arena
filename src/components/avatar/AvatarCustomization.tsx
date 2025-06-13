
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { usePlayerAvatar } from '@/hooks/usePlayerAvatar';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { PlayerAvatarDisplay } from './PlayerAvatarDisplay';
import { UniversalReadyPlayerMe } from './UniversalReadyPlayerMe';
import { ShoppingCart, Trophy, Shirt, Zap, User } from 'lucide-react';

export function AvatarCustomization() {
  const [selectedCategory, setSelectedCategory] = useState('avatar');

  const { 
    availableItems, 
    ownedItems, 
    equippedItems, 
    loading,
    equipItem,
    equipItemLoading,
    purchaseItem,
    purchaseItemLoading,
    isItemOwned,
    canUnlockItem
  } = usePlayerAvatar();
  
  const { tokenData } = usePlayerTokens();
  const { xpData } = usePlayerXP();

  const categories = [
    { id: 'avatar', name: '3D Avatar', icon: User },
    { id: 'clothing', name: 'Clothing', icon: Shirt },
    { id: 'equipment', name: 'Equipment', icon: Zap },
    { id: 'badge', name: 'Badges', icon: Trophy },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUnlockStatusColor = (item: any) => {
    if (isItemOwned(item.id)) return 'border-green-500';
    if (item.unlock_type === 'purchase') return 'border-blue-500';
    if (item.unlock_type === 'level') return 'border-orange-500';
    return 'border-gray-200';
  };

  const filteredItems = availableItems.filter(item => item.category === selectedCategory);

  const isEquipped = (itemId: string) => {
    return equippedItems.some(equipped => equipped.avatar_item_id === itemId);
  };

  const handleEquipItem = (itemId: string) => {
    equipItem(itemId);
  };

  const handlePurchaseItem = (itemId: string) => {
    purchaseItem(itemId);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Avatar Customization</CardTitle>
          <CardDescription>Loading your avatar...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Avatar Customization
        </CardTitle>
        <CardDescription>
          Customize your tennis avatar and unlock new items as you progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Preview */}
        <div className="flex justify-center">
          <PlayerAvatarDisplay size="lg" />
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {category.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* 3D Avatar Tab */}
          <TabsContent value="avatar" className="space-y-4">
            <UniversalReadyPlayerMe showCreator={true} />
          </TabsContent>

          {/* Traditional avatar items tabs */}
          {categories.slice(1).map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => {
                  const owned = isItemOwned(item.id);
                  const equipped = isEquipped(item.id);
                  const canUnlock = canUnlockItem(item, xpData?.current_level);
                  const canAfford = tokenData ? tokenData.regular_tokens >= item.token_cost : false;

                  return (
                    <HoverCard key={item.id}>
                      <HoverCardTrigger asChild>
                        <Card className={`cursor-pointer transition-all hover:shadow-md ${getUnlockStatusColor(item)} ${equipped ? 'ring-2 ring-tennis-green-light' : ''}`}>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Item Image */}
                              <div className="w-full h-24 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                                <img 
                                  src={item.image_url} 
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Item Info */}
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm">{item.name}</h4>
                                <Badge variant="outline" className={`text-xs ${getRarityColor(item.rarity)}`}>
                                  {item.rarity}
                                </Badge>

                                {/* Action Button */}
                                <div className="space-y-1">
                                  {equipped ? (
                                    <Badge variant="default" className="w-full justify-center">
                                      Equipped
                                    </Badge>
                                  ) : owned ? (
                                    <Button
                                      size="sm"
                                      onClick={() => handleEquipItem(item.id)}
                                      disabled={equipItemLoading}
                                      className="w-full"
                                    >
                                      Equip
                                    </Button>
                                  ) : item.unlock_type === 'purchase' ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handlePurchaseItem(item.id)}
                                      disabled={!canAfford || purchaseItemLoading}
                                      className="w-full flex items-center gap-1"
                                    >
                                      <ShoppingCart className="h-3 w-3" />
                                      {item.token_cost} tokens
                                    </Button>
                                  ) : item.unlock_type === 'level' ? (
                                    <Badge variant={canUnlock ? "default" : "secondary"} className="w-full justify-center">
                                      Level {item.unlock_requirement?.level}
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="w-full justify-center">
                                      {item.unlock_type}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <Badge variant="outline" className={getRarityColor(item.rarity)}>
                            {item.rarity}
                          </Badge>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold text-tennis-green-dark">{ownedItems.length}</div>
            <div className="text-sm text-muted-foreground">Items Owned</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-tennis-green-dark">{equippedItems.length}</div>
            <div className="text-sm text-muted-foreground">Items Equipped</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-tennis-green-dark">{xpData?.current_level || 1}</div>
            <div className="text-sm text-muted-foreground">Current Level</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-tennis-green-dark">{tokenData?.regular_tokens || 0}</div>
            <div className="text-sm text-muted-foreground">Tokens</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
