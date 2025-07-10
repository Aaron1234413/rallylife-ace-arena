
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  History,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Calendar,
  Trophy,
  Gift,
  Heart,
  Shirt,
  MapPin,
  Swords,
  Star,
  Gem
} from 'lucide-react';

interface TokenTransaction {
  id: string;
  transaction_type: string;
  token_type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  source: string;
  description: string;
  created_at: string;
}

interface TokenTransactionHistoryProps {
  transactions: TokenTransaction[];
  loading: boolean;
  className?: string;
}

const getSourceIcon = (source: string) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    daily_login: Calendar,
    match_win: Trophy,
    achievement: Star,
    tournament: Trophy,
    premium_bonus: Gem,
    bonus_gift: Gift,
    health_pack_small: Heart,
    health_pack_large: Heart,
    avatar_hat: Shirt,
    court_booking: MapPin,
    challenge_entry: Swords,
    premium_avatar: Gem,
    conversion: RefreshCw
  };
  
  return iconMap[source] || Gift;
};

const getTransactionColor = (type: string) => {
  switch (type) {
    case 'earn':
      return 'text-green-600';
    case 'spend':
      return 'text-red-600';
    case 'convert':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'earn':
      return ArrowUp;
    case 'spend':
      return ArrowDown;
    case 'convert':
      return RefreshCw;
    default:
      return ArrowUp;
  }
};

export function TokenTransactionHistory({ transactions, loading, className }: TokenTransactionHistoryProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Loading transactions...</p>
        </CardContent>
      </Card>
    );
  }

  if (!transactions.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No transactions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transactions.map((transaction) => {
            const SourceIcon = getSourceIcon(transaction.source);
            const TransactionIcon = getTransactionIcon(transaction.transaction_type);
            const colorClass = getTransactionColor(transaction.transaction_type);
            const isRegular = transaction.token_type === 'regular';
            
            return (
              <div key={transaction.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <SourceIcon className="h-4 w-4 text-gray-600" />
                  <TransactionIcon className={`h-4 w-4 ${colorClass}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">
                      {transaction.description}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.transaction_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString()} at{' '}
                    {new Date(transaction.created_at).toLocaleTimeString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-xs">{isRegular ? '🪙' : '💎'}</span>
                  <span className={`font-semibold text-sm ${colorClass}`}>
                    {transaction.transaction_type === 'earn' ? '+' : '-'}{transaction.amount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
