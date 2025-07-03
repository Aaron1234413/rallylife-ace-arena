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
    <Card className={`group relative transition-all duration-300 hover:shadow-md hover:scale-[1.01] border-gray-200/50 bg-white h-full flex flex-col ${isExpanded ? 'ring-2 ring-tennis-green-primary shadow-md scale-[1.01]' : ''}`}>
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Main Item Display */}
        <div className="flex items-start gap-3 mb-4 flex-1">
          <div className={`p-2 rounded-lg ${item.color.split(' ')[0]} flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow duration-300`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0 space-y-3">
            <div className="space-y-1">
              <h3 className="font-semibold text-base text-gray-900 leading-tight group-hover:text-tennis-green-dark transition-colors duration-200">
                {item.name}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                {item.description}
              </p>
            </div>
            
            {/* Enhanced Price Display */}
            <div className="space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge 
                    variant={canAffordWithTokens ? "default" : "secondary"} 
                    className={`text-xs px-3 py-1 font-medium transition-all duration-200 ${
                      canAffordWithTokens 
                        ? 'bg-tennis-green-primary text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    🪙 {item.cost}
                  </Badge>
                  <span className="text-xs text-gray-500 font-medium hidden sm:inline">or</span>
                  <Badge variant="outline" className="text-xs px-3 py-1 font-medium border-gray-300 text-gray-700 hover:border-gray-400 transition-colors duration-200">
                    ${item.cashPrice.toFixed(2)}
                  </Badge>
                </div>
                
                {bestSummary.savings && (
                  <Badge variant="default" className="text-xs bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 font-medium shadow-sm">
                    Save ${bestSummary.savings.replace('Save $', '').replace('!', '')}
                  </Badge>
                )}
              </div>
              
              {/* Hybrid Payment Preview */}
              {!canAffordWithTokens && regularTokens > 0 && (
                <div className="text-xs text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2 rounded-lg border border-blue-200/50 font-medium">
                  💡 Pay {regularTokens} tokens + ${((item.cost - regularTokens) * 0.01).toFixed(2)} cash
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Enhanced Payment Options - Fixed Sizing */}
        {canAffordWithTokens ? (
          <Button
            onClick={() => handlePurchase(bestOption)}
            disabled={purchasing}
            className={`w-full ${item.color} text-white h-10 font-medium shadow-sm hover:shadow-md transition-all duration-200`}
            size="sm"
          >
            <Coins className="h-4 w-4 mr-2" />
            {purchasing ? 'Processing...' : `Buy with ${item.cost} Tokens`}
          </Button>
        ) : (
          <div className="space-y-2">
            {/* Primary Hybrid/Cash Option */}
            {regularTokens > 0 ? (
              <Button
                onClick={() => handlePurchase(paymentOptions.find(opt => opt.type === 'hybrid') || bestOption)}
                disabled={purchasing}
                className="w-full h-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                size="sm"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {purchasing ? 'Processing...' : `Pay ${regularTokens} Tokens + $${((item.cost - regularTokens) * 0.01).toFixed(2)}`}
              </Button>
            ) : (
              <Button
                onClick={() => handlePurchase(paymentOptions.find(opt => opt.type === 'cash_only') || bestOption)}
                disabled={purchasing}
                className="w-full h-10 bg-blue-500 text-white hover:bg-blue-600 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                size="sm"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {purchasing ? 'Processing...' : `Buy for $${item.cashPrice.toFixed(2)}`}
              </Button>
            )}
            
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              className="w-full text-xs h-8 text-gray-600 hover:text-gray-800 hover:bg-gray-100 font-medium transition-all duration-200"
              size="sm"
            >
              {isExpanded ? 'Hide' : 'Show'} All Payment Options
            </Button>
            
            {isExpanded && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h4 className="text-base font-semibold text-gray-800">All Payment Options</h4>
                {paymentOptions.map((option, index) => {
                  const summary = getPaymentSummary(option);
                  const isRecommended = option.type === 'hybrid' && option.savings && option.savings > 0;
                  
                  return (
                    <div key={option.type} className="space-y-2">
                      <Button
                        onClick={() => handlePurchase(option)}
                        disabled={purchasing || !option.canAfford}
                        variant={isRecommended ? "default" : "outline"}
                        className={`w-full justify-between h-12 font-medium transition-all duration-200 ${
                          isRecommended 
                            ? 'ring-2 ring-tennis-green-primary/50 bg-tennis-green-primary text-white hover:bg-tennis-green-dark shadow-md' 
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                        size="default"
                      >
                        <div className="flex items-center">
                          {option.type === 'tokens_only' && <Coins className="h-5 w-5 mr-3 text-yellow-500" />}
                          {option.type === 'cash_only' && <CreditCard className="h-5 w-5 mr-3 text-blue-500" />}
                          {option.type === 'hybrid' && <Wallet className="h-5 w-5 mr-3 text-purple-500" />}
                          
                          <div className="text-left">
                            <div className="text-sm font-semibold">{summary.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {option.type === 'hybrid' && (
                                <span className="text-purple-600 font-medium">
                                  {option.tokensToUse} tokens + ${option.cashRequired.toFixed(2)}
                                </span>
                              )}
                              {option.type === 'tokens_only' && (
                                <span className="text-yellow-600 font-medium">
                                  {option.tokensToUse} tokens only
                                </span>
                              )}
                              {option.type === 'cash_only' && (
                                <span className="text-blue-600 font-medium">
                                  ${option.cashRequired.toFixed(2)} cash only
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {isRecommended && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 mb-1 font-semibold">
                              Best Value
                            </Badge>
                          )}
                          {summary.savings && (
                            <div className="text-xs text-green-600 font-semibold">
                              {summary.savings}
                            </div>
                          )}
                        </div>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {/* Enhanced shortage info */}
        {!canAffordWithTokens && !isExpanded && regularTokens === 0 && (
          <div className="mt-4 text-center bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200/50 px-4 py-3 rounded-lg">
            <p className="text-sm text-orange-700 font-medium">
              💡 Need {item.cost} tokens or pay ${item.cashPrice.toFixed(2)} with card
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}