
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { useCoachTokens } from '@/hooks/useCoachTokens';

export function CTKTransactionHistory() {
  const { transactions, loading } = useCoachTokens();

  if (loading) {
    return (
      <Card className="border-tennis-green-light">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            CTK Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-tennis-green-medium">Loading transactions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-tennis-green-light">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          CTK Transaction History
        </CardTitle>
        <CardDescription>
          Recent Coach Token activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {transactions.length === 0 ? (
            <p className="text-tennis-green-medium text-sm">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {transaction.transaction_type === 'earn' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-tennis-green-dark">
                        {transaction.description || transaction.source}
                      </p>
                      <p className="text-xs text-tennis-green-medium">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={transaction.transaction_type === 'earn' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {transaction.transaction_type === 'earn' ? '+' : '-'}{transaction.amount} CTK
                    </Badge>
                    <p className="text-xs text-tennis-green-medium mt-1">
                      Balance: {transaction.balance_after}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
