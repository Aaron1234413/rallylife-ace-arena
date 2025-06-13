
import React from 'react';
import { TokenStore } from '@/components/tokens/TokenStore';
import { TokenConverter } from '@/components/tokens/TokenConverter';

interface TokenEconomyProps {
  tokenData: any;
  onSpendTokens: (amount: number, tokenType: string, source: string, description?: string) => Promise<any>;
  onConvertTokens: (premiumAmount: number, conversionRate?: number) => Promise<any>;
}

export function TokenEconomy({
  tokenData,
  onSpendTokens,
  onConvertTokens
}: TokenEconomyProps) {
  if (!tokenData) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <TokenStore
        onSpendTokens={onSpendTokens}
        regularTokens={tokenData.regular_tokens}
        premiumTokens={tokenData.premium_tokens}
      />
      <TokenConverter
        onConvertTokens={onConvertTokens}
        premiumTokens={tokenData.premium_tokens}
      />
    </div>
  );
}
