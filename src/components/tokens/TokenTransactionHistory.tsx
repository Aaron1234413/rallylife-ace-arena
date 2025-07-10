import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Trophy, 
  Users, 
  GraduationCap,
  Building,
  Filter,
  Search,
  Calendar
} from 'lucide-react';
import { TokenTransaction } from '@/hooks/usePlayerTokens';

interface TokenTransactionHistoryProps {
  transactions: TokenTransaction[];
  loading?: boolean;
  className?: string;
}

export function TokenTransactionHistory({
  transactions,
  loading = false,
  className
}: TokenTransactionHistoryProps) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getTransactionIcon = (transaction: TokenTransaction) => {
    if (transaction.source.includes('session') || transaction.source.includes('challenge')) {
      return Trophy;
    }
    if (transaction.source.includes('training')) {
      return GraduationCap;
    }
    if (transaction.source.includes('social')) {
      return Users;
    }
    if (transaction.source.includes('platform')) {
      return Building;
    }
    return transaction.transaction_type === 'earn' ? TrendingUp : TrendingDown;
  };

  const getTransactionColor = (transaction: TokenTransaction) => {
    if (transaction.transaction_type === 'earn') {
      return 'text-green-600';
    }
    if (transaction.source.includes('platform')) {
      return 'text-blue-600';
    }
    return 'text-red-600';
  };

  const getSourceBadgeColor = (source: string) => {
    if (source.includes('challenge') || source.includes('session')) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    if (source.includes('training')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (source.includes('social')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (source.includes('platform')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || 
      (filter === 'earned' && transaction.transaction_type === 'earn') ||
      (filter === 'spent' && transaction.transaction_type === 'spend') ||
      (filter === 'sessions' && (transaction.source.includes('session') || transaction.source.includes('challenge'))) ||
      (filter === 'platform' && transaction.source.includes('platform'));

    const matchesSearch = !searchTerm || 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.source.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalEarned = transactions
    .filter(t => t.transaction_type === 'earn')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = transactions
    .filter(t => t.transaction_type === 'spend')
    .reduce((sum, t) => sum + t.amount, 0);

  const sessionEarnings = transactions
    .filter(t => t.transaction_type === 'earn' && (t.source.includes('session') || t.source.includes('challenge')))
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="space-y-1">
                    <div className="w-32 h-4 bg-muted rounded"></div>
                    <div className="w-20 h-3 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="w-16 h-6 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-tennis-yellow" />
          Token Transaction History
        </CardTitle>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Earned</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Coins className="h-4 w-4 text-tennis-yellow" />
              <span className="font-bold">{totalEarned}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Spent</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Coins className="h-4 w-4 text-tennis-yellow" />
              <span className="font-bold">{totalSpent}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">Sessions</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Coins className="h-4 w-4 text-tennis-yellow" />
              <span className="font-bold">{sessionEarnings}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-48">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="earned">Earned</SelectItem>
              <SelectItem value="spent">Spent</SelectItem>
              <SelectItem value="sessions">Sessions</SelectItem>
              <SelectItem value="platform">Platform</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions List */}
        <div className="space-y-2">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No transactions found</p>
              <p className="text-sm">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => {
              const Icon = getTransactionIcon(transaction);
              const colorClass = getTransactionColor(transaction);
              const badgeColor = getSourceBadgeColor(transaction.source);
              
              return (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-background border ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{transaction.description || 'Token Transaction'}</span>
                        <Badge variant="outline" className={`${badgeColor} text-xs`}>
                          {transaction.source}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </div>
                        <span>Balance: {transaction.balance_before} → {transaction.balance_after}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 font-bold ${colorClass}`}>
                    {transaction.transaction_type === 'earn' ? '+' : '-'}
                    <Coins className="h-4 w-4" />
                    {transaction.amount}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {filteredTransactions.length > 0 && (
          <div className="text-center text-xs text-muted-foreground">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        )}
      </CardContent>
    </Card>
  );
}