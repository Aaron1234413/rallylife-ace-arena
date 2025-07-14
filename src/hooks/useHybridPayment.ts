import { useMemo } from 'react';

export interface PaymentOption {
  type: 'tokens_only' | 'cash_only' | 'hybrid';
  canAfford: boolean;
  tokensRequired: number;
  tokensAvailable: number;
  tokensToUse: number;
  cashRequired: number;
  totalCostUSD: number;
  savings?: number; // How much they save by using tokens
}

interface HybridPaymentProps {
  itemCost: number; // in tokens
  itemCashPrice?: number; // optional override, otherwise calculated from tokens
  availableTokens: number;
  tokenToUSDRate?: number; // Default: 0.01 ($0.01 per token)
}

export function useHybridPayment({
  itemCost,
  itemCashPrice,
  availableTokens,
  tokenToUSDRate = 0.01
}: HybridPaymentProps) {
  
  const paymentOptions = useMemo(() => {
    const options: PaymentOption[] = [];
    
    // Calculate cash equivalent if not provided
    const cashPrice = itemCashPrice ?? (itemCost * tokenToUSDRate);
    
    // Option 1: Tokens Only
    const tokensOnly: PaymentOption = {
      type: 'tokens_only',
      canAfford: availableTokens >= itemCost,
      tokensRequired: itemCost,
      tokensAvailable: availableTokens,
      tokensToUse: itemCost,
      cashRequired: 0,
      totalCostUSD: 0,
      savings: cashPrice // Full savings since no cash spent
    };
    options.push(tokensOnly);
    
    // Option 2: Cash Only
    const cashOnly: PaymentOption = {
      type: 'cash_only',
      canAfford: true, // Always available via Stripe
      tokensRequired: 0,
      tokensAvailable: availableTokens,
      tokensToUse: 0,
      cashRequired: cashPrice,
      totalCostUSD: cashPrice
    };
    options.push(cashOnly);
    
    // Option 3: Hybrid (only if user has some tokens but not enough)
    if (availableTokens > 0 && availableTokens < itemCost) {
      const tokenShortage = itemCost - availableTokens;
      const cashForShortage = tokenShortage * tokenToUSDRate;
      const tokenValueUsed = availableTokens * tokenToUSDRate;
      
      const hybrid: PaymentOption = {
        type: 'hybrid',
        canAfford: true,
        tokensRequired: itemCost,
        tokensAvailable: availableTokens,
        tokensToUse: availableTokens,
        cashRequired: cashForShortage,
        totalCostUSD: cashForShortage,
        savings: tokenValueUsed // How much they save by using available tokens
      };
      options.push(hybrid);
    }
    
    return options;
  }, [itemCost, itemCashPrice, availableTokens, tokenToUSDRate]);
  
  const getBestOption = (): PaymentOption => {
    // Prefer tokens only if available
    if (paymentOptions[0].canAfford) {
      return paymentOptions[0];
    }
    
    // Next prefer hybrid if available (uses some tokens)
    const hybridOption = paymentOptions.find(opt => opt.type === 'hybrid');
    if (hybridOption) {
      return hybridOption;
    }
    
    // Fallback to cash only
    return paymentOptions.find(opt => opt.type === 'cash_only')!;
  };
  
  const getPaymentSummary = (option: PaymentOption) => {
    switch (option.type) {
      case 'tokens_only':
        return {
          title: 'Pay with Tokens',
          description: `${option.tokensToUse} tokens`,
          breakdown: [`${option.tokensToUse} tokens`],
          savings: `Save $${option.savings?.toFixed(2)}!`
        };
        
      case 'cash_only':
        return {
          title: 'Pay with Card',
          description: `$${option.cashRequired.toFixed(2)}`,
          breakdown: [`$${option.cashRequired.toFixed(2)} via Stripe`]
        };
        
      case 'hybrid':
        return {
          title: 'Mixed Payment',
          description: `${option.tokensToUse} tokens + $${option.cashRequired.toFixed(2)}`,
          breakdown: [
            `${option.tokensToUse} tokens`,
            `$${option.cashRequired.toFixed(2)} via Stripe`
          ],
          savings: option.savings ? `Save $${option.savings.toFixed(2)}!` : undefined
        };
        
      default:
        return {
          title: 'Payment',
          description: 'Unknown payment method',
          breakdown: []
        };
    }
  };
  
  const calculateTokenShortage = () => {
    const shortage = Math.max(0, itemCost - availableTokens);
    const cashEquivalent = shortage * tokenToUSDRate;
    
    return {
      tokenShortage: shortage,
      cashNeeded: cashEquivalent,
      hasShortage: shortage > 0
    };
  };
  
  return {
    paymentOptions,
    getBestOption,
    getPaymentSummary,
    calculateTokenShortage,
    tokenToUSDRate
  };
}