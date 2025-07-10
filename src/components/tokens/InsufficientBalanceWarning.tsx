import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Coins, Plus, ShoppingCart } from 'lucide-react';

interface InsufficientBalanceWarningProps {
  currentBalance: number;
  requiredAmount: number;
  tokenType?: 'regular' | 'premium';
  onPurchaseClick?: () => void;
  className?: string;
}

export function InsufficientBalanceWarning({
  currentBalance,
  requiredAmount,
  tokenType = 'regular',
  onPurchaseClick,
  className
}: InsufficientBalanceWarningProps) {
  const shortfall = requiredAmount - currentBalance;
  const isInsufficient = currentBalance < requiredAmount;

  if (!isInsufficient) return null;

  return (
    <Alert className={`border-red-200 bg-red-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="space-y-3">
        <div>
          <h4 className="font-medium text-red-800 mb-2">Insufficient Token Balance</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-red-600">Current Balance:</span>
              <div className="flex items-center gap-1 mt-1">
                <Coins className="h-4 w-4 text-red-500" />
                <span className="font-medium text-red-700">{currentBalance}</span>
                <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                  {tokenType}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-red-600">Required Amount:</span>
              <div className="flex items-center gap-1 mt-1">
                <Coins className="h-4 w-4 text-red-500" />
                <span className="font-medium text-red-700">{requiredAmount}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 p-2 bg-red-100 rounded-md">
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-700">Shortfall:</span>
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-red-600" />
                <span className="font-bold text-red-800">{shortfall} tokens needed</span>
              </div>
            </div>
          </div>
        </div>

        {onPurchaseClick && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onPurchaseClick}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Purchase Tokens
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Earn More Tokens
            </Button>
          </div>
        )}

        <div className="text-xs text-red-600">
          <p>• You cannot join this session without sufficient tokens</p>
          <p>• Consider earning more tokens through training sessions or challenges</p>
          <p>• Token packs are available for purchase to top up your balance</p>
        </div>
      </AlertDescription>
    </Alert>
  );
}