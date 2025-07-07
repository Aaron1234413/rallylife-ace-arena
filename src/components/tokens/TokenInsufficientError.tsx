import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Coins, ExternalLink, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TokenInsufficientErrorProps {
  tokensNeeded: number;
  currentBalance?: number;
  sessionTitle?: string;
  onRefreshBalance?: () => void;
  className?: string;
}

export function TokenInsufficientError({
  tokensNeeded,
  currentBalance = 0,
  sessionTitle,
  onRefreshBalance,
  className
}: TokenInsufficientErrorProps) {
  const tokensShort = tokensNeeded - currentBalance;

  return (
    <Card className={`border-l-4 border-l-red-500 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
          Insufficient Tokens
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <Coins className="h-4 w-4" />
          <AlertDescription>
            You need <strong>{tokensNeeded} tokens</strong> to join 
            {sessionTitle ? ` "${sessionTitle}"` : ' this session'}, but you only have{' '}
            <strong>{currentBalance} tokens</strong>.
            <br />
            <span className="text-red-600 font-medium">
              You're {tokensShort} tokens short.
            </span>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/store?category=tokens" className="w-full">
            <Button className="w-full bg-tennis-green-primary hover:bg-tennis-green-medium">
              <Coins className="h-4 w-4 mr-2" />
              Go to Store
            </Button>
          </Link>
          
          {onRefreshBalance && (
            <Button 
              variant="outline" 
              onClick={onRefreshBalance}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Balance
            </Button>
          )}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>Session stake:</span>
            <span className="font-medium">{tokensNeeded} tokens</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Your balance:</span>
            <span className="font-medium">{currentBalance} tokens</span>
          </div>
          <hr className="border-gray-300 dark:border-gray-600" />
          <div className="flex items-center justify-between text-red-600 dark:text-red-400">
            <span>Still needed:</span>
            <span className="font-bold">{tokensShort} tokens</span>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          <span>
            Visit our token store to purchase more tokens and join exciting sessions!
          </span>
        </div>
      </CardContent>
    </Card>
  );
}