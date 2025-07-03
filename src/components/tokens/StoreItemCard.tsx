import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useHybridPayment, PaymentOption } from '@/hooks/useHybridPayment';
import { supabase } from '@/integrations/supabase/client';
import { Coins, CreditCard, Wallet } from 'lucide-react';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  cost: number;
  cashPrice: number;
  tokenType: 'regular';
  color: string;
  effectType: 'hp_restore' | 'xp_gain' | 'token_bonus' | 'level_boost';
  effectValue: number;
}

interface StoreItemCardProps {
  item: StoreItem;
  regularTokens: number;
  onPurchase: (item: StoreItem, paymentOption: PaymentOption) => Promise<void>;
}

export function StoreItemCard({ item, regularTokens, onPurchase }: StoreItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  
  const { paymentOptions, getBestOption, getPaymentSummary } = useHybridPayment({
    itemCost: item.cost,
    itemCashPrice: item.cashPrice,
    availableTokens: regularTokens
  });
  
  const bestOption = getBestOption();
  const bestSummary = getPaymentSummary(bestOption);
  
  const handlePurchase = async (option: PaymentOption) => {
    setPurchasing(true);
    try {
      if (option.type === 'cash_only' || option.type === 'hybrid') {
        // Handle Stripe payment
        const { data, error } = await supabase.functions.invoke('create-payment', {
          body: {
            itemId: item.id,
            itemName: item.name,
            cashAmount: option.cashRequired,
            tokensToUse: option.tokensToUse
          }
        });

        if (error) {
          toast.error('Failed to create payment session');
          return;
        }

        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
        
        // For hybrid payments, spend tokens immediately
        if (option.type === 'hybrid' && option.tokensToUse > 0) {
          await onPurchase(item, option);
        }
      } else {
        // Handle pure token payment
        await onPurchase(item, option);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed');
    } finally {
      setPurchasing(false);
      setIsExpanded(false);
    }
  };
  
  const Icon = item.icon;
  const tokensOnlyOption = paymentOptions.find(opt => opt.type === 'tokens_only');
  const canAffordWithTokens = tokensOnlyOption?.canAfford || false;
  
  return (
    <Card className={`group relative transition-all duration-300 hover:shadow-lg border-gray-200 bg-white h-full flex flex-col hover:scale-105 hover:border-tennis-green-primary/30 ${isExpanded ? 'ring-1 ring-tennis-green-primary shadow-sm' : ''}`}>
      {/* Green glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-tennis-green-primary/10 to-tennis-green-dark/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      <div className="absolute inset-0 bg-tennis-green-primary/5 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      <CardContent className="p-3 flex-1 flex flex-col">
        {/* Main Item Display */}
        <div className="flex items-start gap-3 mb-3 flex-1">
          <div className={`p-2 rounded-lg ${item.color.split(' ')[0]} flex-shrink-0`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          
          <div className="flex-1 min-w-0 space-y-2">
            <div className="space-y-1">
              <h3 className="font-semibold text-xs text-gray-900 leading-tight">
                {item.name}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                {item.description}
              </p>
            </div>
            
            {/* Price Display */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={canAffordWithTokens ? "default" : "secondary"} 
                  className={`text-xs px-2 py-1 ${
                    canAffordWithTokens 
                      ? 'bg-tennis-green-primary text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  🪙 {item.cost}
                </Badge>
                <span className="text-xs text-gray-400">or</span>
                <Badge variant="outline" className="text-xs px-2 py-1 border-gray-300 text-gray-600">
                  ${item.cashPrice.toFixed(2)}
                </Badge>
              </div>
              
              {/* Hybrid Payment Preview */}
              {!canAffordWithTokens && regularTokens > 0 && (
                <div className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                  💡 Pay {regularTokens} tokens + ${((item.cost - regularTokens) * 0.01).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Payment Options - Compact */}
        {canAffordWithTokens ? (
          <Button
            onClick={() => handlePurchase(bestOption)}
            disabled={purchasing}
            className={`w-full ${item.color} text-white h-8 text-xs`}
            size="sm"
          >
            <Coins className="h-3 w-3 mr-1" />
            {purchasing ? 'Processing...' : `Buy ${item.cost} Tokens`}
          </Button>
        ) : (
          <div className="space-y-1">
            {/* Primary Option */}
            {regularTokens > 0 ? (
              <Button
                onClick={() => handlePurchase(paymentOptions.find(opt => opt.type === 'hybrid') || bestOption)}
                disabled={purchasing}
                className="w-full h-8 bg-blue-500 text-white hover:bg-blue-600 text-xs"
                size="sm"
              >
                <Wallet className="h-3 w-3 mr-1" />
                {purchasing ? 'Processing...' : `${regularTokens} Tokens + $${((item.cost - regularTokens) * 0.01).toFixed(2)}`}
              </Button>
            ) : (
              <Button
                onClick={() => handlePurchase(paymentOptions.find(opt => opt.type === 'cash_only') || bestOption)}
                disabled={purchasing}
                className="w-full h-8 bg-blue-500 text-white hover:bg-blue-600 text-xs"
                size="sm"
              >
                <CreditCard className="h-3 w-3 mr-1" />
                {purchasing ? 'Processing...' : `$${item.cashPrice.toFixed(2)}`}
              </Button>
            )}
            
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              className="w-full text-xs h-6 text-gray-500 hover:text-gray-700"
              size="sm"
            >
              {isExpanded ? 'Less' : 'More'} options
            </Button>
            
            {isExpanded && (
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-700">All Options:</p>
                {paymentOptions.map((option) => {
                  const summary = getPaymentSummary(option);
                  
                  return (
                    <Button
                      key={option.type}
                      onClick={() => handlePurchase(option)}
                      disabled={purchasing || !option.canAfford}
                      variant="outline"
                      className="w-full h-8 text-xs border-gray-300 hover:border-gray-400"
                      size="sm"
                    >
                      <div className="flex items-center gap-1">
                        {option.type === 'tokens_only' && <Coins className="h-3 w-3" />}
                        {option.type === 'cash_only' && <CreditCard className="h-3 w-3" />}
                        {option.type === 'hybrid' && <Wallet className="h-3 w-3" />}
                        <span>{summary.title}</span>
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {/* Shortage info */}
        {!canAffordWithTokens && !isExpanded && regularTokens === 0 && (
          <div className="mt-2 text-center bg-orange-50 border border-orange-200 px-2 py-1 rounded text-xs text-orange-700">
            Need {item.cost} tokens or ${item.cashPrice.toFixed(2)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}