import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Coins,
  DollarSign,
  Zap,
  Crown,
  CreditCard
} from 'lucide-react';

interface TokenPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  club: {
    id: string;
    name: string;
  };
}

export function TokenPurchaseDialog({ open, onOpenChange, club }: TokenPurchaseDialogProps) {
  const [selectedPack, setSelectedPack] = useState('');
  const [customAmount, setCustomAmount] = useState('');

  const tokenPacks = [
    {
      id: 'starter',
      name: 'Starter Pack',
      tokens: 5000,
      price: 50,
      bonus: 0,
      popular: false,
      description: 'Perfect for small clubs'
    },
    {
      id: 'growth',
      name: 'Growth Pack',
      tokens: 12000,
      price: 100,
      bonus: 2000,
      popular: true,
      description: 'Most popular choice'
    },
    {
      id: 'premium',
      name: 'Premium Pack',
      tokens: 30000,
      price: 250,
      bonus: 5000,
      popular: false,
      description: 'Maximum value'
    }
  ];

  const handlePurchase = async () => {
    const { useClubTokenPool } = await import('@/hooks/useClubTokenPool');
    const { purchaseTokens } = useClubTokenPool(club.id);
    
    let tokenAmount = 0;
    if (selectedPack) {
      const pack = tokenPacks.find(p => p.id === selectedPack);
      tokenAmount = pack ? pack.tokens + pack.bonus : 0;
    } else if (customAmount) {
      tokenAmount = parseInt(customAmount);
    }
    
    if (tokenAmount >= 100) {
      await purchaseTokens(tokenAmount);
      onOpenChange(false);
    }
  };

  const getPackIcon = (packId: string) => {
    switch (packId) {
      case 'starter': return Coins;
      case 'growth': return Zap;
      case 'premium': return Crown;
      default: return Coins;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-emerald-500" />
            Purchase Club Tokens
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Token Packs */}
          <div>
            <h3 className="font-semibold mb-4">Token Packs</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {tokenPacks.map((pack) => {
                const Icon = getPackIcon(pack.id);
                const isSelected = selectedPack === pack.id;
                
                return (
                  <Card 
                    key={pack.id} 
                    className={`cursor-pointer transition-all relative ${
                      isSelected ? 'ring-2 ring-emerald-500 shadow-lg' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPack(pack.id)}
                  >
                    {pack.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-emerald-500 text-white">Popular</Badge>
                      </div>
                    )}
                    
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-full mx-auto flex items-center justify-center mb-3">
                        <Icon className="h-6 w-6 text-emerald-500" />
                      </div>
                      
                      <h4 className="font-semibold mb-2">{pack.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{pack.description}</p>
                      
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-emerald-600">
                          {pack.tokens.toLocaleString()}
                        </div>
                        {pack.bonus > 0 && (
                          <div className="text-sm text-emerald-500">
                            +{pack.bonus.toLocaleString()} bonus
                          </div>
                        )}
                        <div className="text-lg font-semibold">
                          ${pack.price}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${(pack.price / (pack.tokens + pack.bonus) * 100).toFixed(3)} per token
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Custom Amount</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="customTokens">Custom Token Amount</Label>
                <Input
                  id="customTokens"
                  type="number"
                  placeholder="Enter token amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedPack('');
                  }}
                  min="100"
                  step="100"
                />
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Cost</div>
                <div className="text-lg font-semibold">
                  ${customAmount ? (parseInt(customAmount) / 100).toFixed(2) : '0.00'}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Conversion rate: $1 = 100 tokens (minimum 100 tokens)
            </p>
          </div>

          {/* Payment Method */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Payment Method</h3>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <CreditCard className="h-5 w-5 text-gray-500" />
              <span className="text-sm">Credit Card (Stripe)</span>
              <Badge variant="secondary" className="ml-auto">Secure</Badge>
            </div>
          </div>

          {/* Summary */}
          {(selectedPack || customAmount) && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-semibold text-emerald-900 mb-2">Purchase Summary</h4>
              {selectedPack ? (
                <div className="space-y-1 text-sm text-emerald-700">
                  <div className="flex justify-between">
                    <span>Pack:</span>
                    <span>{tokenPacks.find(p => p.id === selectedPack)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tokens:</span>
                    <span>{tokenPacks.find(p => p.id === selectedPack)?.tokens.toLocaleString()}</span>
                  </div>
                  {tokenPacks.find(p => p.id === selectedPack)?.bonus && (
                    <div className="flex justify-between">
                      <span>Bonus:</span>
                      <span>+{tokenPacks.find(p => p.id === selectedPack)?.bonus.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${tokenPacks.find(p => p.id === selectedPack)?.price}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-sm text-emerald-700">
                  <div className="flex justify-between">
                    <span>Tokens:</span>
                    <span>{parseInt(customAmount || '0').toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${customAmount ? (parseInt(customAmount) / 100).toFixed(2) : '0.00'}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={!selectedPack && !customAmount}
              className="flex-1"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Purchase Tokens
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}