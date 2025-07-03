
import React from 'react';
import { useItemEffects, ItemEffectType } from '@/hooks/useItemEffects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart,
  Zap,
  RefreshCw,
  Sparkles,
  Coins,
  TrendingUp,
  ShoppingCart,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  cost: number;
  cashPrice: number; // USD price
  tokenType: 'regular';
  color: string;
  effectType: 'hp_restore' | 'xp_gain' | 'token_bonus' | 'level_boost';
  effectValue: number;
}

interface TokenStoreProps {
  onSpendTokens: (amount: number, tokenType: string, source: string, description?: string) => Promise<boolean>;
  regularTokens: number;
  premiumTokens: number;
  className?: string;
}

const storeItems: StoreItem[] = [
  // Instant Recovery Items
  {
    id: 'small_energy_pack',
    name: 'Small Energy Pack',
    description: 'Restore 25 HP instantly',
    icon: Heart,
    cost: 20,
    cashPrice: 0.20,
    tokenType: 'regular',
    color: 'bg-red-500 hover:bg-red-600',
    effectType: 'hp_restore',
    effectValue: 25
  },
  {
    id: 'large_energy_pack',
    name: 'Large Energy Pack',
    description: 'Restore 50 HP instantly',
    icon: Zap,
    cost: 35,
    cashPrice: 0.35,
    tokenType: 'regular',
    color: 'bg-red-600 hover:bg-red-700',
    effectType: 'hp_restore',
    effectValue: 50
  },
  {
    id: 'full_restore',
    name: 'Full Restore',
    description: 'Restore to max HP',
    icon: RefreshCw,
    cost: 60,
    cashPrice: 0.60,
    tokenType: 'regular',
    color: 'bg-green-500 hover:bg-green-600',
    effectType: 'hp_restore',
    effectValue: 100
  },
  // Direct Progression Items
  {
    id: 'xp_injection',
    name: 'XP Injection',
    description: 'Instantly gain 100 XP',
    icon: Sparkles,
    cost: 100,
    cashPrice: 1.00,
    tokenType: 'regular',
    color: 'bg-yellow-500 hover:bg-yellow-600',
    effectType: 'xp_gain',
    effectValue: 100
  },
  {
    id: 'token_bonus',
    name: 'Token Bonus',
    description: 'Instantly gain 50 tokens',
    icon: Coins,
    cost: 75,
    cashPrice: 0.75,
    tokenType: 'regular',
    color: 'bg-blue-500 hover:bg-blue-600',
    effectType: 'token_bonus',
    effectValue: 50
  },
  {
    id: 'level_boost',
    name: 'Level Boost',
    description: 'Instantly gain 1 level',
    icon: TrendingUp,
    cost: 500,
    cashPrice: 5.00,
    tokenType: 'regular',
    color: 'bg-purple-500 hover:bg-purple-600',
    effectType: 'level_boost',
    effectValue: 1
  }
];

export function TokenStore({ 
  onSpendTokens, 
  regularTokens, 
  premiumTokens, 
  className 
}: TokenStoreProps) {
  const { applyItemEffect } = useItemEffects();
  
  const handlePurchase = async (item: StoreItem) => {
    // For now, only support token payments (Phase 3 will add hybrid payments)
    if (regularTokens < item.cost) {
      toast.error(`Insufficient tokens! Need ${item.cost - regularTokens} more tokens or $${((item.cost - regularTokens) * 0.01).toFixed(2)}`);
      return;
    }

    const success = await onSpendTokens(item.cost, item.tokenType, item.id, item.description);
    
    if (success) {
      // Apply item effect using the new hook
      const result = await applyItemEffect(item.effectType, item.effectValue, item.name);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        console.error('Error applying item effect:', result.error);
        toast.error(result.error || 'Item purchased but effect failed to apply');
      }
    }
  };

  const canAfford = (item: StoreItem) => {
    return regularTokens >= item.cost;
  };

  const getTokenShortage = (item: StoreItem) => {
    return Math.max(0, item.cost - regularTokens);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Token Store
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {storeItems.map((item) => {
            const Icon = item.icon;
            const isRegular = item.tokenType === 'regular';
            const affordable = canAfford(item);
            
            return (
              <Button
                key={item.id}
                onClick={() => handlePurchase(item)}
                disabled={!affordable}
                className={`h-auto p-3 flex flex-col items-start gap-2 text-left ${item.color} ${
                  !affordable ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className="h-4 w-4" />
                  <span className="font-semibold">{item.name}</span>
                  <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
                    {isRegular ? '🪙' : '💎'} {item.cost}
                  </Badge>
                </div>
                <p className="text-xs opacity-90">{item.description}</p>
                {!affordable && (
                  <p className="text-xs text-red-200">Insufficient tokens</p>
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
