import React from 'react';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Coins, Info } from 'lucide-react';
import { PricingBreakdown as PricingData, formatPricingDisplay } from '@/utils/pricing';

interface PricingBreakdownProps {
  pricing: PricingData;
  title?: string;
  showTokens?: boolean;
  className?: string;
}

export function PricingBreakdown({ 
  pricing, 
  title = "Pricing Breakdown",
  showTokens = true,
  className = ""
}: PricingBreakdownProps) {
  const display = formatPricingDisplay(pricing);
  
  // Don't show breakdown if there's no cost
  if (pricing.totalAmount === 0 && pricing.tokens === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 p-4 bg-accent/20 rounded-lg border ${className}`}>
      <h4 className="font-medium text-sm flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-tennis-green-primary" />
        {title}
      </h4>
      
      <div className="space-y-2 text-sm">
        {/* Token cost if applicable */}
        {showTokens && pricing.tokens > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-3 w-3 text-emerald-500" />
              <span className="text-muted-foreground">Tokens</span>
            </div>
            <span className="font-medium">{display.tokens}</span>
          </div>
        )}

        {/* Money breakdown if applicable */}
        {pricing.totalAmount > 0 && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Base price</span>
              <span>{display.basePrice}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">RAKO convenience fee</span>
                <Info className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">({display.feePercentage})</span>
              </div>
              <span>{display.convenienceFee}</span>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between font-medium">
              <span>Total</span>
              <span className="text-tennis-green-primary">{display.totalPrice}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}