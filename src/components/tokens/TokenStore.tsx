
import React from 'react';
import { useItemEffects } from '@/hooks/useItemEffects';
import { PaymentOption } from '@/hooks/useHybridPayment';
import { StoreItemCard } from './StoreItemCard';
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
  
  const handlePurchase = async (item: StoreItem, paymentOption: PaymentOption) => {
    try {
      // Handle different payment types
      if (paymentOption.type === 'tokens_only') {
        // Pure token payment
        const success = await onSpendTokens(item.cost, item.tokenType, item.id, item.description);
        if (!success) return;
        
      } else if (paymentOption.type === 'cash_only') {
        // Pure cash payment handled by StoreItemCard via Stripe
        return;
        
      } else if (paymentOption.type === 'hybrid') {
        // Mixed payment - spend available tokens first
        if (paymentOption.tokensToUse > 0) {
          const tokenSuccess = await onSpendTokens(
            paymentOption.tokensToUse, 
            item.tokenType, 
            item.id, 
            `Hybrid payment: ${item.description}`
          );
          if (!tokenSuccess) return;
        }
        // Cash portion handled by StoreItemCard via Stripe
        return;
      }
      
      // Apply item effect after successful payment
      const result = await applyItemEffect(item.effectType, item.effectValue, item.name);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        console.error('Error applying item effect:', result.error);
        toast.error(result.error || 'Item purchased but effect failed to apply');
      }
      
    } catch (error) {
      console.error('Error during purchase:', error);
      toast.error('Purchase failed');
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Store Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {storeItems.map((item) => (
            <StoreItemCard
              key={item.id}
              item={item}
              regularTokens={regularTokens}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
