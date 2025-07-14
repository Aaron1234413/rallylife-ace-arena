import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Coins,
  DollarSign,
  Shuffle
} from 'lucide-react';

interface HybridPaymentSelectorProps {
  tokenPrice: number;
  usdPrice: number; // in actual dollars (not cents)
  onPaymentChange: (payment: { tokens: number; usd: number }) => void;
  disabled?: boolean;
  preview?: boolean;
}

export function HybridPaymentSelector({ 
  tokenPrice, 
  usdPrice, 
  onPaymentChange, 
  disabled = false,
  preview = false
}: HybridPaymentSelectorProps) {
  const [tokenPercentage, setTokenPercentage] = useState(100);
  
  // Calculate payment split
  const tokensToUse = Math.round((tokenPercentage / 100) * tokenPrice);
  const usdToUse = ((100 - tokenPercentage) / 100) * usdPrice; // Keep as dollars
  
  // Conversion rate: $0.01 per token ($1 = 100 tokens)
  const tokenValue = tokensToUse * 0.01; // Convert tokens to dollars
  const usdValue = usdToUse; // Already in dollars
  
  useEffect(() => {
    if (!disabled && !preview) {
      onPaymentChange({ tokens: tokensToUse, usd: usdToUse });
    }
  }, [tokensToUse, usdToUse, disabled, preview, onPaymentChange]);

  const presetOptions = [
    { label: 'All Tokens', percentage: 100, icon: Coins, color: 'text-emerald-600' },
    { label: 'Mixed', percentage: 50, icon: Shuffle, color: 'text-purple-600' },
    { label: 'All Cash', percentage: 0, icon: DollarSign, color: 'text-green-600' }
  ];

  if (preview) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {presetOptions.map((option) => (
            <div key={option.label} className="text-center p-2 bg-gray-50 rounded-lg">
              <option.icon className={`h-4 w-4 mx-auto mb-1 ${option.color}`} />
              <div className="text-xs font-medium">{option.label}</div>
              <div className="text-xs text-gray-500">
                {option.percentage === 100 ? `${tokenPrice} tokens` :
                 option.percentage === 0 ? `$${usdPrice.toFixed(2)}` :
                 `${Math.round(tokenPrice / 2)} tokens + $${(usdPrice / 2).toFixed(2)}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Payment Method</h4>
            <Badge variant="secondary">Hybrid Payment</Badge>
          </div>

          {/* Preset Options */}
          <div className="grid grid-cols-3 gap-2">
            {presetOptions.map((option) => (
              <Button
                key={option.label}
                variant={tokenPercentage === option.percentage ? "default" : "outline"}
                size="sm"
                className="flex flex-col h-auto py-2"
                onClick={() => setTokenPercentage(option.percentage)}
                disabled={disabled}
              >
                <option.icon className={`h-4 w-4 mb-1 ${
                  tokenPercentage === option.percentage ? 'text-white' : option.color
                }`} />
                <span className="text-xs">{option.label}</span>
              </Button>
            ))}
          </div>

          {/* Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-emerald-500" />
                Tokens
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-green-500" />
                Cash
              </span>
            </div>
            
            <Slider
              value={[tokenPercentage]}
              onValueChange={(value) => setTokenPercentage(value[0])}
              max={100}
              step={5}
              disabled={disabled}
              className="w-full"
            />
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{tokenPercentage}%</span>
              <span>{100 - tokenPercentage}%</span>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-emerald-500" />
                <span>Tokens:</span>
              </div>
              <span className="font-medium">{tokensToUse} tokens</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span>Cash:</span>
              </div>
              <span className="font-medium">${usdValue.toFixed(2)}</span>
            </div>
            
            <div className="border-t pt-2 flex items-center justify-between font-medium">
              <span>Total Value:</span>
              <span>${(tokenValue + usdValue).toFixed(2)}</span>
            </div>
          </div>

          {/* Savings Indicator */}
          {tokenPercentage > 0 && (tokenPrice * 0.01) < usdPrice && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-xs text-emerald-700">
                💡 Using tokens saves you ${((usdPrice - (tokenPrice * 0.01)) * tokenPercentage / 100).toFixed(2)} 
                ({(((usdPrice - (tokenPrice * 0.01)) / usdPrice) * 100).toFixed(1)}% discount)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}