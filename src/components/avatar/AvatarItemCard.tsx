
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AvatarDisplay } from './AvatarDisplay';
import { 
  Star,
  Lock,
  Check,
  Coins,
  Gem,
  ShoppingCart
} from 'lucide-react';

interface AvatarItemCardProps {
  item: any;
  owned: boolean;
  equipped: boolean;
  canUnlock: boolean;
  tokenBalance: number;
  premiumBalance: number;
  onPurchase: (itemId: string) => void;
  onEquip: (itemId: string) => void;
  className?: string;
}

const rarityColors = {
  common: 'bg-gray-100 text-gray-800 border-gray-200',
  rare: 'bg-blue-100 text-blue-800 border-blue-200',
  epic: 'bg-purple-100 text-purple-800 border-purple-200',
  legendary: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

export function AvatarItemCard({
  item,
  owned,
  equipped,
  canUnlock,
  tokenBalance,
  premiumBalance,
  onPurchase,
  onEquip,
  className = ''
}: AvatarItemCardProps) {
  const canAfford = 
    (item.token_cost === 0 || tokenBalance >= item.token_cost) &&
    (item.premium_cost === 0 || premiumBalance >= item.premium_cost);

  return (
    <Card className={`${equipped ? 'ring-2 ring-tennis-green-dark' : ''} ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{item.name}</CardTitle>
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

          {/* Status and Actions */}
          {equipped ? (
            <Badge className="w-full justify-center bg-tennis-green-dark">
              <Check className="h-3 w-3 mr-1" />
              Equipped
            </Badge>
          ) : owned ? (
            <Button
              size="sm"
              className="w-full"
              onClick={() => onEquip(item.id)}
              variant="outline"
            >
              Equip
            </Button>
          ) : (
            <div className="space-y-2">
              {item.unlock_type === 'level' && !canUnlock ? (
                <Badge variant="outline" className="w-full justify-center">
                  <Lock className="h-3 w-3 mr-1" />
                  Level {item.unlock_requirement?.level} Required
                </Badge>
              ) : item.unlock_type === 'purchase' ? (
                <>
                  {/* Cost Display */}
                  <div className="flex items-center justify-center gap-2 text-sm">
                    {item.token_cost > 0 && (
                      <div className="flex items-center gap-1">
                        <Coins className="h-3 w-3 text-yellow-500" />
                        <span className={tokenBalance < item.token_cost ? 'text-red-500' : ''}>
                          {item.token_cost}
                        </span>
                      </div>
                    )}
                    {item.premium_cost > 0 && (
                      <div className="flex items-center gap-1">
                        <Gem className="h-3 w-3 text-purple-500" />
                        <span className={premiumBalance < item.premium_cost ? 'text-red-500' : ''}>
                          {item.premium_cost}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => onPurchase(item.id)}
                    disabled={!canAfford}
                  >
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    {canAfford ? 'Purchase' : 'Insufficient Tokens'}
                  </Button>
                </>
              ) : (
                <Badge variant="secondary" className="w-full justify-center">
                  <Star className="h-3 w-3 mr-1" />
                  Available
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
