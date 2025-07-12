import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  Coins, 
  Star,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { useUnifiedSessionCompletion } from '@/hooks/useUnifiedSessionCompletion';
import { format } from 'date-fns';

interface RewardAuditLogProps {
  sessionId: string;
  className?: string;
}

interface RewardTransaction {
  participant_name: string;
  transaction_type: string;
  amount: number;
  before_value: number;
  after_value: number;
  calculation_data: Record<string, any>;
  created_at: string;
}

export function RewardAuditLog({ sessionId, className }: RewardAuditLogProps) {
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getRewardAudit } = useUnifiedSessionCompletion();

  const loadAuditLog = async () => {
    setIsLoading(true);
    try {
      const audit = await getRewardAudit(sessionId);
      setTransactions(audit);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLog();
  }, [sessionId]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'xp_gain':
        return <Star className="h-4 w-4 text-blue-600" />;
      case 'hp_gain':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'hp_loss':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'token_earn':
        return <Coins className="h-4 w-4 text-yellow-600" />;
      case 'token_refund':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'xp_gain':
        return 'text-blue-600';
      case 'hp_gain':
        return 'text-green-600';
      case 'hp_loss':
        return 'text-red-600';
      case 'token_earn':
      case 'token_refund':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'xp_gain':
        return 'XP Gained';
      case 'hp_gain':
        return 'HP Restored';
      case 'hp_loss':
        return 'HP Lost';
      case 'token_earn':
        return 'Tokens Earned';
      case 'token_refund':
        return 'Tokens Refunded';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  if (transactions.length === 0 && !isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="h-4 w-4" />
            Reward Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground py-4">
            No reward transactions found for this session.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="h-4 w-4" />
            Reward Audit Log
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadAuditLog}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getTransactionIcon(transaction.transaction_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium truncate">
                        {transaction.participant_name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {formatTransactionType(transaction.transaction_type)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>
                        {transaction.before_value} → {transaction.after_value}
                      </span>
                      <span className={`font-medium ${getTransactionColor(transaction.transaction_type)}`}>
                        ({transaction.amount > 0 ? '+' : ''}{transaction.amount})
                      </span>
                    </div>
                    
                    {transaction.calculation_data && Object.keys(transaction.calculation_data).length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {transaction.calculation_data.is_winner && (
                          <Badge variant="secondary" className="text-xs mr-1">Winner</Badge>
                        )}
                        {transaction.calculation_data.type && (
                          <span>{transaction.calculation_data.type}</span>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(transaction.created_at), 'MMM d, h:mm a')}
                    </div>
                  </div>
                </div>
                
                {index < transactions.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}