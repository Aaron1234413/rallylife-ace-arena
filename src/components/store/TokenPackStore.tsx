import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Star, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { TokenPackItem } from '@/types/store';
import { getTokenPacksByTarget } from '@/data/storeItems';
import { toast } from 'sonner';

interface TokenPackStoreProps {
  targetType: 'player' | 'coach' | 'club';
  onPurchase: (pack: TokenPackItem) => Promise<boolean>;
  clubId?: string; // Required for club purchases
}

export function TokenPackStore({ targetType, onPurchase, clubId }: TokenPackStoreProps) {
  const tokenPacks = getTokenPacksByTarget(targetType);

  const handlePurchase = async (pack: TokenPackItem) => {
    if (pack.target_type === 'club' && !clubId) {
      toast.error('Please select a club first');
      return;
    }

    const success = await onPurchase(pack);
    if (success) {
      toast.success(`${pack.name} purchase initiated!`);
    }
  };

  const getTargetTypeIcon = () => {
    switch (targetType) {
      case 'player': return <Star className="h-5 w-5" />;
      case 'coach': return <TrendingUp className="h-5 w-5" />;
      case 'club': return <Coins className="h-5 w-5" />;
    }
  };

  const getTargetTypeTitle = () => {
    switch (targetType) {
      case 'player': return 'Player Token Packs';
      case 'coach': return 'Coach Token Packs';
      case 'club': return 'Club Token Packs';
    }
  };

  const getTargetTypeDescription = () => {
    switch (targetType) {
      case 'player': return 'Purchase tokens for gameplay, services, and avatar items';
      case 'coach': return 'Professional tokens for coaching services and client management';
      case 'club': return 'Club tokens for member services, events, and facility management';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          {getTargetTypeIcon()}
          <Coins className="h-12 w-12 text-tennis-green-primary mx-2" />
        </div>
        <h2 className="text-2xl font-bold text-tennis-green-dark mb-2">
          {getTargetTypeTitle()}
        </h2>
        <p className="text-gray-600">
          {getTargetTypeDescription()}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {tokenPacks.map((pack) => (
          <Card 
            key={pack.id} 
            className={`relative hover:shadow-lg transition-all duration-300 ${
              pack.popular ? 'border-tennis-yellow shadow-md ring-2 ring-tennis-yellow/50' : ''
            }`}
          >
            {pack.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-tennis-yellow text-tennis-green-dark font-bold px-3 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{pack.name}</CardTitle>
                {pack.savings_percentage && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {pack.savings_percentage}% bonus
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">{pack.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Token Amount */}
              <div className="text-center p-4 bg-tennis-green-bg/30 rounded-lg">
                <div className="text-3xl font-bold text-tennis-green-primary">
                  {pack.token_amount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Base Tokens</div>
                
                {pack.bonus_tokens > 0 && (
                  <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                    <div className="text-lg font-semibold text-green-600">
                      +{pack.bonus_tokens.toLocaleString()}
                    </div>
                    <div className="text-xs text-green-600">Bonus Tokens</div>
                  </div>
                )}
                
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="text-2xl font-bold text-tennis-green-dark">
                    {(pack.token_amount + pack.bonus_tokens).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Total Tokens</div>
                </div>
              </div>

              {/* Features */}
              {pack.features && pack.features.length > 0 && (
                <div className="space-y-2">
                  {pack.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Expiry */}
              <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm">
                  Valid for {pack.expiry_days} days
                </span>
              </div>

              {/* Pricing */}
              <div className="border-t pt-4">
                <div className="text-center mb-3">
                  <div className="text-3xl font-bold text-tennis-green-primary">
                    ${pack.price_usd}
                  </div>
                  <div className="text-xs text-gray-500">
                    ${(pack.price_usd / (pack.token_amount + pack.bonus_tokens)).toFixed(4)} per token
                  </div>
                </div>

                <Button
                  className="w-full bg-tennis-green-primary hover:bg-tennis-green-medium"
                  onClick={() => handlePurchase(pack)}
                >
                  Purchase Pack
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
              <Coins className="h-5 w-5 text-tennis-green-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-tennis-green-dark mb-2">
                Token Pack Benefits
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Each token is worth $0.007 towards services and items</li>
                <li>• Bonus tokens included with larger packs</li>
                <li>• 90-day validity period from purchase</li>
                <li>• {targetType === 'club' ? 'Perfect for member services and club events' : 
                       targetType === 'coach' ? 'Ideal for coaching services and client management' :
                       'Great for gameplay, avatar items, and services'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}