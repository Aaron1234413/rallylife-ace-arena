import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, User, Calendar } from 'lucide-react';
import { MemberTokenActivity } from '@/types/clubAnalytics';

interface MemberActivityTableProps {
  memberActivity: MemberTokenActivity[];
}

export function MemberActivityTable({ memberActivity }: MemberActivityTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'total_redeemed' | 'monthly_spending' | 'last_activity'>('total_redeemed');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedMembers = memberActivity
    .filter(member => 
      member.member_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortBy === 'last_activity') {
        const aDate = new Date(aValue as string).getTime();
        const bDate = new Date(bValue as string).getTime();
        return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
      }
      
      const aNum = Number(aValue);
      const bNum = Number(bValue);
      return sortOrder === 'desc' ? bNum - aNum : aNum - bNum;
    });

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getSpendingLimitPercentage = (member: MemberTokenActivity) => {
    if (!member.spending_limit) return 0;
    return (member.monthly_spending / member.spending_limit) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Member Token Activity</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-6 gap-4 text-xs font-medium text-gray-500 pb-2 border-b">
            <div className="col-span-2">Member</div>
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('total_redeemed')}
                className="h-auto p-0 font-medium text-xs"
              >
                Total Redeemed
                {sortBy === 'total_redeemed' && (
                  <TrendingUp className={`ml-1 h-3 w-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                )}
              </Button>
            </div>
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('monthly_spending')}
                className="h-auto p-0 font-medium text-xs"
              >
                Monthly Spending
                {sortBy === 'monthly_spending' && (
                  <TrendingUp className={`ml-1 h-3 w-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                )}
              </Button>
            </div>
            <div className="text-center">Favorite Service</div>
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('last_activity')}
                className="h-auto p-0 font-medium text-xs"
              >
                Last Activity
                {sortBy === 'last_activity' && (
                  <Calendar className={`ml-1 h-3 w-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                )}
              </Button>
            </div>
          </div>

          {/* Member Rows */}
          {filteredAndSortedMembers.map((member) => (
            <div key={member.member_id} className="grid grid-cols-6 gap-4 items-center py-3 border-b border-gray-100 last:border-b-0">
              {/* Member Info */}
              <div className="col-span-2 flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.member_avatar} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">{member.member_name}</div>
                  {member.spending_limit && (
                    <div className="flex items-center gap-2 mt-1">
                      <Progress 
                        value={getSpendingLimitPercentage(member)} 
                        className="h-1 w-16"
                      />
                      <span className="text-xs text-gray-500">
                        {Math.round(getSpendingLimitPercentage(member))}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Redeemed */}
              <div className="text-center">
                <div className="font-bold">{member.total_redeemed.toLocaleString()}</div>
                <div className="text-xs text-gray-500">tokens</div>
              </div>

              {/* Monthly Spending */}
              <div className="text-center">
                <div className="font-medium">{member.monthly_spending.toLocaleString()}</div>
                {member.spending_limit && (
                  <div className="text-xs text-gray-500">
                    / {member.spending_limit.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Favorite Service */}
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  {member.favorite_service}
                </Badge>
              </div>

              {/* Last Activity */}
              <div className="text-center">
                <div className="text-sm">{formatDate(member.last_activity)}</div>
              </div>
            </div>
          ))}

          {filteredAndSortedMembers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No members found matching your search.' : 'No member activity data available.'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}