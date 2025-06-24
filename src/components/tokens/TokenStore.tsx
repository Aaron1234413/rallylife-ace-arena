
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart,
  Shirt,
  MapPin,
  Swords,
  Gem,
  Coins,
  ShoppingCart
} from 'lucide-react';
import { toast } from 'sonner';

interface TokenStoreProps {
  onSpendTokens: (amount: number, tokenType: string, source: string, description?: string) => Promise<boolean>;
  regularTokens: number;
  premiumTokens: number;
  onRestoreHP?: (amount: number, activityType: string, description?: string) => Promise<void>;
  className?: string;
}

const storeItems = [
  {
    id: 'health_pack_small',
    name: 'Small Health Pack',
    description: 'Restore 25 HP',
    icon: Heart,
    cost: 20,
    tokenType: 'regular',
    color: 'bg-red-500 hover:bg-red-600',
    hpRestore: 25
  },
  {
    id: 'health_pack_large',
    name: 'Large Health Pack',
    description: 'Restore 50 HP',
    icon: Heart,
    cost: 35,
    tokenType: 'regular',
    color: 'bg-red-600 hover:bg-red-700',
    hpRestore: 50
  },
  {
    id: 'avatar_hat',
    name: 'Tennis Cap',
    description: 'Stylish avatar accessory',
    icon: Shirt,
    cost: 100,
    tokenType: 'regular',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    id: 'court_booking',
    name: 'Court Booking',
    description: 'Reserve premium court',
    icon: MapPin,
    cost: 150,
    tokenType: 'regular',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    id: 'challenge_entry',
    name: 'Challenge Entry',
    description: 'Enter special tournament',
    icon: Swords,
    cost: 250,
    tokenType: 'regular',
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    id: 'premium_avatar',
    name: 'Premium Avatar',
    description: 'Exclusive avatar skin',
    icon: Gem,
    cost: 3,
    tokenType: 'premium',
    color: 'bg-pink-500 hover:bg-pink-600'
  }
];

export function TokenStore({ onSpendTokens, regularTokens, premiumTokens, onRestoreHP, className }: TokenStoreProps) {
  const handlePurchase = async (item: typeof storeItems[0]) => {
    const currentBalance = item.tokenType === 'premium' ? premiumTokens : regularTokens;
    
    if (currentBalance < item.cost) {
      toast.error('Insufficient tokens');
      return;
    }

    const success = await onSpendTokens(item.cost, item.tokenType, item.id, item.description);
    
    if (success) {
      // Handle HP restoration for health packs
      if (item.hpRestore && onRestoreHP) {
        try {
          await onRestoreHP(item.hpRestore, 'health_pack', `Used ${item.name}`);
          toast.success(`${item.name} purchased and used! +${item.hpRestore} HP`);
        } catch (error) {
          console.error('Error restoring HP:', error);
          toast.error('Item purchased but HP restoration failed');
        }
      } else {
        toast.success(`${item.name} purchased successfully!`);
      }
    }
  };

  const canAfford = (item: typeof storeItems[0]) => {
    const currentBalance = item.tokenType === 'premium' ? premiumTokens : regularTokens;
    return currentBalance >= item.cost;
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
