import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Coins, DollarSign, CreditCard } from 'lucide-react';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HybridPaymentProps {
  itemName: string;
  totalCost: number; // in USD
  onPaymentSuccess?: () => void;
  metadata?: Record<string, any>;
}

export function HybridPayment({ itemName, totalCost, onPaymentSuccess, metadata }: HybridPaymentProps) {
  const { tokens } = usePlayerTokens();
  const [tokensToUse, setTokensToUse] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const tokenValue = 0.01; // $0.01 per token
  const maxTokensUsable = Math.min(tokens.regular, Math.floor(totalCost / tokenValue));
  const tokenDiscount = tokensToUse * tokenValue;
  const cashAmount = Math.max(0, totalCost - tokenDiscount);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          itemId: metadata?.itemId || 'hybrid-payment',
          itemName,
          cashAmount,
          tokensToUse,
          metadata
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-tennis-green-bg/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-orbitron">
          <CreditCard className="h-5 w-5 text-tennis-green-primary" />
          Hybrid Payment
        </CardTitle>
        <p className="text-sm text-tennis-green-medium">
          Use your tokens to reduce the cash cost
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Item Details */}
        <div className="p-4 bg-tennis-green-bg/10 rounded-lg">
          <h3 className="font-semibold">{itemName}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-tennis-green-medium">Total Cost:</span>
            <Badge className="bg-tennis-green-primary/10 text-tennis-green-dark">
              ${totalCost.toFixed(2)}
            </Badge>
          </div>
        </div>

        {/* Token Balance */}
        <div className="flex items-center justify-between p-3 bg-tennis-yellow/10 rounded-lg">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-tennis-yellow" />
            <span className="text-sm font-medium">Available Tokens:</span>
          </div>
          <Badge className="bg-tennis-yellow text-tennis-green-dark">
            {tokens.regular.toLocaleString()}
          </Badge>
        </div>

        {/* Token Slider */}
        {maxTokensUsable > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Tokens to use:</label>
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-tennis-yellow" />
                <span className="font-bold">{tokensToUse.toLocaleString()}</span>
              </div>
            </div>
            
            <Slider
              value={[tokensToUse]}
              onValueChange={([value]) => setTokensToUse(value)}
              max={maxTokensUsable}
              step={10}
              className="w-full"
            />
            
            <div className="text-xs text-tennis-green-medium text-center">
              Max: {maxTokensUsable.toLocaleString()} tokens (${(maxTokensUsable * tokenValue).toFixed(2)} value)
            </div>
          </div>
        )}

        {/* Payment Breakdown */}
        <div className="space-y-3 p-4 bg-tennis-green-bg/5 rounded-lg border">
          <h4 className="font-medium text-sm">Payment Breakdown:</h4>
          
          {tokensToUse > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Coins className="h-3 w-3 text-tennis-yellow" />
                <span>Token Discount:</span>
              </div>
              <span className="text-tennis-green-primary font-medium">
                -${tokenDiscount.toFixed(2)}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm border-t pt-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-3 w-3 text-tennis-green-primary" />
              <span className="font-medium">Cash Payment:</span>
            </div>
            <span className="text-lg font-bold text-tennis-green-dark">
              ${cashAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          className="w-full bg-tennis-green-primary hover:bg-tennis-green-primary/90 text-white font-orbitron font-bold"
          onClick={handlePayment}
          disabled={isProcessing || (cashAmount > 0 && cashAmount < 0.50)} // Minimum Stripe amount
        >
          {isProcessing ? (
            'Processing...'
          ) : (
            <>
              {tokensToUse > 0 ? 'Pay with Tokens + Card' : 'Pay with Card'}
              {cashAmount > 0 && ` - $${cashAmount.toFixed(2)}`}
            </>
          )}
        </Button>

        {cashAmount > 0 && cashAmount < 0.50 && (
          <p className="text-xs text-red-500 text-center">
            Minimum card payment is $0.50. Use more tokens or increase cash amount.
          </p>
        )}
      </CardContent>
    </Card>
  );
}