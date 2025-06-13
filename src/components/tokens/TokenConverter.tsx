
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Gem, Coins, ArrowRight } from 'lucide-react';

interface TokenConverterProps {
  onConvertTokens: (premiumAmount: number, conversionRate?: number) => Promise<boolean>;
  premiumTokens: number;
  className?: string;
}

export function TokenConverter({ onConvertTokens, premiumTokens, className }: TokenConverterProps) {
  const [convertAmount, setConvertAmount] = useState(1);
  const [isConverting, setIsConverting] = useState(false);
  
  const conversionRate = 10; // 1 premium = 10 regular tokens
  const regularTokensToReceive = convertAmount * conversionRate;

  const handleConvert = async () => {
    if (convertAmount <= 0 || convertAmount > premiumTokens) return;
    
    setIsConverting(true);
    const success = await onConvertTokens(convertAmount, conversionRate);
    if (success) {
      setConvertAmount(1);
    }
    setIsConverting(false);
  };

  const canConvert = convertAmount > 0 && convertAmount <= premiumTokens && !isConverting;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Token Converter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
            <Gem className="h-4 w-4" />
            <span>1 Rally Point</span>
            <ArrowRight className="h-4 w-4" />
            <Coins className="h-4 w-4" />
            <span>10 Tokens</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Convert your Rally Points to regular Tokens
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="convert-amount">Rally Points to Convert</Label>
          <Input
            id="convert-amount"
            type="number"
            min="1"
            max={premiumTokens}
            value={convertAmount}
            onChange={(e) => setConvertAmount(Math.max(1, parseInt(e.target.value) || 1))}
            className="text-center"
          />
          <p className="text-xs text-gray-500">
            Available: {premiumTokens} Rally Points
          </p>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span>You will receive:</span>
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{regularTokensToReceive} Tokens</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleConvert}
          disabled={!canConvert}
          className="w-full"
        >
          {isConverting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Converting...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Convert Rally Points
            </>
          )}
        </Button>

        {convertAmount > premiumTokens && (
          <p className="text-sm text-red-600 text-center">
            Insufficient Rally Points
          </p>
        )}
      </CardContent>
    </Card>
  );
}
