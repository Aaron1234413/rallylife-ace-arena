import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Zap, Shield, Clock } from 'lucide-react';
import { HealthPackItem } from '@/types/store';
import { healthPacks } from '@/data/storeItems';
import { toast } from 'sonner';

interface HealthPackStoreProps {
  onPurchase: (item: HealthPackItem) => Promise<boolean>;
  regularTokens: number;
  premiumTokens: number;
  userHP: number;
  maxHP: number;
}

export function HealthPackStore({ 
  onPurchase, 
  regularTokens, 
  premiumTokens, 
  userHP, 
  maxHP 
}: HealthPackStoreProps) {
  
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const canAfford = (item: HealthPackItem) => {
    return regularTokens >= item.price_tokens;
  };

  const isHPFull = userHP >= maxHP;

  const handlePurchase = async (item: HealthPackItem) => {
    if (!canAfford(item)) {
      toast.error('Insufficient tokens');
      return;
    }

    if (isHPFull && item.instant_use) {
      toast.error('Your HP is already full');
      return;
    }

    const success = await onPurchase(item);
    if (success) {
      toast.success(`${item.name} purchased and applied!`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-tennis-green-dark mb-2">
          Health Packs
        </h2>
        <p className="text-gray-600">
          Restore your HP and gain powerful effects
        </p>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="font-medium">Current HP: {userHP}/{maxHP}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {healthPacks.map((item) => (
          <Card 
            key={item.id} 
            className={`relative hover:shadow-lg transition-all duration-300 ${
              item.rarity === 'legendary' ? 'ring-2 ring-yellow-300 shadow-lg' :
              item.rarity === 'epic' ? 'ring-1 ring-purple-300' : ''
            }`}
          >
            {item.rarity === 'legendary' && (
              <div className="absolute -top-2 -right-2">
                <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  LEGENDARY
                </div>
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <Badge className={`text-xs ${getRarityColor(item.rarity)}`}>
                  {item.rarity.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{item.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* HP Restore */}
              <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">
                  +{item.hp_restore} HP
                  {item.hp_restore === 100 && ' (Full Restore)'}
                </span>
              </div>

              {/* Effects */}
              {item.effects && item.effects.length > 0 && (
                <div className="space-y-2">
                  {item.effects.map((effect, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                      {effect.type === 'prevent_decay' && <Shield className="h-4 w-4 text-purple-500" />}
                      {effect.type === 'max_hp_boost' && <Zap className="h-4 w-4 text-purple-500" />}
                      <span className="text-sm font-medium">
                        {effect.type === 'prevent_decay' && 'Decay Protection'}
                        {effect.type === 'max_hp_boost' && `+${effect.value} Max HP`}
                        {effect.duration_hours && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({effect.duration_hours}h)
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Cooldown */}
              {item.cooldown_hours && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">
                    {item.cooldown_hours}h cooldown
                  </span>
                </div>
              )}

              {/* Pricing */}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-bold text-tennis-green-primary">
                    {item.price_tokens} tokens
                  </div>
                  {item.price_usd && (
                    <div className="text-sm text-gray-500">
                      or ${item.price_usd}
                    </div>
                  )}
                </div>

                <Button
                  className={`w-full ${
                    canAfford(item) && !isHPFull
                      ? 'bg-tennis-green-primary hover:bg-tennis-green-medium'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={() => handlePurchase(item)}
                  disabled={!canAfford(item) || isHPFull}
                >
                  {!canAfford(item) ? 'Insufficient Tokens' :
                   isHPFull ? 'HP Full' : 'Purchase & Use'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-tennis-green-bg/50 border-tennis-green-primary/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-tennis-green-primary/10 rounded-lg">
              <Heart className="h-5 w-5 text-tennis-green-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-tennis-green-dark mb-2">
                Health Pack Benefits
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Instant HP restoration for immediate recovery</li>
                <li>• Special effects like decay protection and max HP boosts</li>
                <li>• Higher rarity items provide more powerful benefits</li>
                <li>• Some items have cooldowns to prevent overuse</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}