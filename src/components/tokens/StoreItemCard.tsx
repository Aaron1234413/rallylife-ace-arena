import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useHybridPayment, PaymentOption } from '@/hooks/useHybridPayment';
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
      await onPurchase(item, option);
    } finally {
      setPurchasing(false);
      setIsExpanded(false);
    }
  };
  
  const Icon = item.icon;
  const tokensOnlyOption = paymentOptions.find(opt => opt.type === 'tokens_only');
  const canAffordWithTokens = tokensOnlyOption?.canAfford || false;
  
  return (
    <Card className={`transition-all duration-200 ${isExpanded ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="p-4">
        {/* Main Item Display */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2 rounded-lg ${item.color.split(' ')[0]} flex-shrink-0`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
            <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
            
            {/* Primary Price Display */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  🪙 {item.cost}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  ${item.cashPrice.toFixed(2)}
                </Badge>
              </div>
              
              {bestSummary.savings && (
                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                  {bestSummary.savings}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Best Payment Option */}
        {canAffordWithTokens ? (
          <Button
            onClick={() => handlePurchase(bestOption)}
            disabled={purchasing}
            className={`w-full ${item.color} text-white`}
            size="sm"
          >
            <Coins className="h-4 w-4 mr-2" />
            {purchasing ? 'Processing...' : bestSummary.description}
          </Button>
        ) : (
          <div className="space-y-2">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <Wallet className="h-4 w-4 mr-2" />
              View Payment Options
            </Button>
            
            {isExpanded && (
              <div className="space-y-2 pt-2 border-t">
                {paymentOptions.map((option, index) => {
                  const summary = getPaymentSummary(option);
                  const isRecommended = option.type === 'hybrid' && option.savings && option.savings > 0;
                  
                  return (
                    <div key={option.type} className="space-y-1">
                      <Button
                        onClick={() => handlePurchase(option)}
                        disabled={purchasing || !option.canAfford}
                        variant={isRecommended ? "default" : "outline"}
                        className={`w-full justify-start ${isRecommended ? 'ring-2 ring-blue-300' : ''}`}
                        size="sm"
                      >
                        {option.type === 'tokens_only' && <Coins className="h-4 w-4 mr-2" />}
                        {option.type === 'cash_only' && <CreditCard className="h-4 w-4 mr-2" />}
                        {option.type === 'hybrid' && <Wallet className="h-4 w-4 mr-2" />}
                        
                        <div className="flex-1 text-left">
                          <div className="text-xs font-medium">{summary.title}</div>
                          <div className="text-xs opacity-75">{summary.description}</div>
                        </div>
                        
                        {isRecommended && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                            Best Value
                          </Badge>
                        )}
                      </Button>
                      
                      {summary.savings && option.type !== 'tokens_only' && (
                        <p className="text-xs text-green-600 font-medium ml-2">
                          {summary.savings}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {/* Token shortage warning */}
        {!canAffordWithTokens && !isExpanded && (
          <p className="text-xs text-orange-600 mt-2 text-center">
            Need {item.cost - regularTokens} more tokens or ${((item.cost - regularTokens) * 0.01).toFixed(2)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}