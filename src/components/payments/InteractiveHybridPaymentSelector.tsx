import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Coins,
  DollarSign,
  Shuffle,
  AlertTriangle,
  Info,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface InteractiveHybridPaymentSelectorProps {
  serviceTokenCost: number; // Total token cost of the service
  availableTokens: number; // User's current token balance
  onPaymentChange: (payment: { tokens: number; usd: number }) => void;
  disabled?: boolean;
  onRefreshTokens?: () => void; // Optional callback to refresh token balance
}

export function InteractiveHybridPaymentSelector({ 
  serviceTokenCost, 
  availableTokens,
  onPaymentChange, 
  disabled = false,
  onRefreshTokens
}: InteractiveHybridPaymentSelectorProps) {
  const [tokensToUse, setTokensToUse] = useState(Math.min(availableTokens, serviceTokenCost));
  
  // Constants
  const TOKEN_TO_USD_RATE = 0.01; // $0.01 per token
  const maxUsableTokens = Math.min(availableTokens, serviceTokenCost);
  
  // Calculate cash portion
  const remainingTokenCost = serviceTokenCost - tokensToUse;
  const cashRequired = remainingTokenCost * TOKEN_TO_USD_RATE;
  
  // Calculate savings
  const totalUSDCost = serviceTokenCost * TOKEN_TO_USD_RATE;
  const savings = tokensToUse * TOKEN_TO_USD_RATE;
  
  // Enhanced validation and status
  const isValidPayment = tokensToUse <= availableTokens && tokensToUse <= serviceTokenCost && tokensToUse >= 0;
  const hasInsufficientTokens = availableTokens < serviceTokenCost;
  const tokenShortage = Math.max(0, serviceTokenCost - availableTokens);
  const canAffordWithTokens = availableTokens >= serviceTokenCost;
  const isOverspending = tokensToUse > availableTokens;
  const paymentStatus = isValidPayment ? 'valid' : isOverspending ? 'overspend' : 'invalid';
  
  // Update parent component when payment changes
  useEffect(() => {
    if (isValidPayment && !disabled) {
      onPaymentChange({ 
        tokens: tokensToUse, 
        usd: cashRequired 
      });
    }
  }, [tokensToUse, cashRequired, isValidPayment, disabled, onPaymentChange]);

  // Handle direct input changes
  const handleTokenInputChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(numValue, maxUsableTokens));
    setTokensToUse(clampedValue);
  };

  // Handle slider changes
  const handleSliderChange = (value: number[]) => {
    setTokensToUse(value[0]);
  };

  // Preset options
  const presetOptions = [
    { 
      label: 'Max Tokens', 
      value: maxUsableTokens, 
      icon: Coins, 
      color: 'text-emerald-600',
      description: `${maxUsableTokens} tokens`
    },
    { 
      label: 'Half & Half', 
      value: Math.floor(maxUsableTokens / 2), 
      icon: Shuffle, 
      color: 'text-purple-600',
      description: `${Math.floor(maxUsableTokens / 2)} tokens + cash`
    },
    { 
      label: 'Cash Only', 
      value: 0, 
      icon: DollarSign, 
      color: 'text-green-600',
      description: `$${totalUSDCost.toFixed(2)} cash`
    }
  ];

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Shuffle className="h-4 w-4 text-purple-500" />
            Choose Your Payment Mix
          </span>
          <Badge variant="outline" className="text-xs">
            Interactive Payment
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Enhanced Token Balance Status */}
        <div className={`p-3 rounded-lg border transition-colors ${
          canAffordWithTokens 
            ? 'bg-emerald-50 border-emerald-200' 
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {canAffordWithTokens ? (
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              )}
              <span className={`text-sm font-medium ${
                canAffordWithTokens ? 'text-emerald-900' : 'text-amber-900'
              }`}>
                Token Balance Status
              </span>
            </div>
            {onRefreshTokens && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefreshTokens}
                className="h-6 w-6 p-0 hover-scale"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className={canAffordWithTokens ? 'text-emerald-700' : 'text-amber-700'}>
                Available: {availableTokens} tokens
              </span>
              <span className={canAffordWithTokens ? 'text-emerald-700' : 'text-amber-700'}>
                Required: {serviceTokenCost} tokens
              </span>
            </div>
            
            {!canAffordWithTokens && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-amber-700">Shortage:</span>
                <span className="font-medium text-amber-800">
                  {tokenShortage} tokens (${(tokenShortage * TOKEN_TO_USD_RATE).toFixed(2)} cash needed)
                </span>
              </div>
            )}
            
            {canAffordWithTokens && (
              <div className="text-sm text-emerald-700">
                ✅ You can pay entirely with tokens and save ${totalUSDCost.toFixed(2)}!
              </div>
            )}
          </div>
        </div>

        {/* Service Cost Info */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Service Cost</span>
          </div>
          <div className="text-sm text-blue-700">
            {serviceTokenCost} tokens (${totalUSDCost.toFixed(2)} cash equivalent)
          </div>
        </div>

        {/* Preset Options */}
        <div className="grid grid-cols-3 gap-2">
          {presetOptions.map((option) => (
            <Button
              key={option.label}
              variant={tokensToUse === option.value ? "default" : "outline"}
              size="sm"
              className="flex flex-col h-auto py-3 hover-scale"
              onClick={() => setTokensToUse(option.value)}
              disabled={disabled || option.value > maxUsableTokens}
            >
              <option.icon className={`h-4 w-4 mb-1 ${
                tokensToUse === option.value ? 'text-white' : option.color
              }`} />
              <span className="text-xs font-medium">{option.label}</span>
              <span className="text-xs opacity-75 mt-1">{option.description}</span>
            </Button>
          ))}
        </div>

        {/* Enhanced Token Amount Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-500" />
              Tokens to Use
              {paymentStatus === 'valid' && (
                <CheckCircle className="h-3 w-3 text-emerald-500" />
              )}
              {paymentStatus === 'overspend' && (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
            </label>
            <div className="flex items-center gap-2">
              <Badge 
                variant={canAffordWithTokens ? "default" : "secondary"} 
                className="text-xs"
              >
                Available: {availableTokens}
              </Badge>
              {isOverspending && (
                <Badge variant="destructive" className="text-xs">
                  Over limit!
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Input
              type="number"
              value={tokensToUse}
              onChange={(e) => handleTokenInputChange(e.target.value)}
              min={0}
              max={maxUsableTokens}
              disabled={disabled}
              className={`w-24 text-center transition-colors ${
                paymentStatus === 'overspend' 
                  ? 'border-red-300 bg-red-50 text-red-700' 
                  : paymentStatus === 'valid' 
                    ? 'border-emerald-300 bg-emerald-50' 
                    : ''
              }`}
              placeholder="0"
            />
            <div className="flex-1">
              <Slider
                value={[tokensToUse]}
                onValueChange={handleSliderChange}
                max={maxUsableTokens}
                step={1}
                disabled={disabled}
                className={`w-full ${
                  paymentStatus === 'overspend' ? 'opacity-75' : ''
                }`}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>0 tokens</span>
            <span>{maxUsableTokens} tokens</span>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm">Payment Breakdown</h4>
          
          <div className="space-y-2">
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
              <span className="font-medium">${cashRequired.toFixed(2)}</span>
            </div>
            
            <div className="border-t pt-2 flex items-center justify-between font-medium">
              <span>Total Service Value:</span>
              <span>${totalUSDCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Savings Indicator */}
        {savings > 0 && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg animate-scale-in">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">Token Savings</span>
            </div>
            <p className="text-sm text-emerald-700">
              You're saving ${savings.toFixed(2)} by using {tokensToUse} tokens! 
              {savings > 0 && (
                <span className="ml-1">
                  ({((savings / totalUSDCost) * 100).toFixed(1)}% off cash price)
                </span>
              )}
            </p>
          </div>
        )}

        {/* Enhanced Validation Messages */}
        {paymentStatus === 'overspend' && (
          <Alert className="border-red-200 bg-red-50 animate-scale-in">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <div className="space-y-1">
                <div className="font-medium">Insufficient tokens!</div>
                <div>You're trying to use {tokensToUse} tokens, but you only have {availableTokens} available.</div>
                <div className="text-sm">Maximum you can use: {maxUsableTokens} tokens</div>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {tokensToUse === 0 && serviceTokenCost > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              You're paying entirely with cash (${totalUSDCost.toFixed(2)}). 
              Consider using some tokens to save money!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}