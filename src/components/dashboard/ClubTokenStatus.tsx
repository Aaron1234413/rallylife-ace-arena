import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  ChevronRight,
  Building
} from 'lucide-react';
import { useClubTokenPool } from '@/hooks/useClubTokenPool';
import { Link } from 'react-router-dom';

interface ClubTokenStatusProps {
  clubId: string;
  clubName: string;
}

export function ClubTokenStatus({ clubId, clubName }: ClubTokenStatusProps) {
  const { currentPool, loading } = useClubTokenPool(clubId);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentPool) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Unable to load club token status
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalTokens = currentPool.allocated_tokens + currentPool.rollover_tokens + currentPool.purchased_tokens;
  const availableTokens = totalTokens - currentPool.used_tokens;
  const usagePercentage = totalTokens > 0 ? (currentPool.used_tokens / totalTokens) * 100 : 0;
  const isLowTokens = availableTokens < (totalTokens * 0.2); // Less than 20% remaining

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 ${
      isLowTokens ? 'border-orange-200 bg-orange-50' : 'border-tennis-green-primary/20'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building className="h-4 w-4 text-tennis-green-primary" />
            {clubName}
          </CardTitle>
          <Badge variant={isLowTokens ? "destructive" : "outline"} className="text-xs">
            {currentPool.month_year}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Token Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Available Tokens</span>
            <div className="text-right">
              <div className="text-lg font-bold text-tennis-green-primary">
                {availableTokens.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                of {totalTokens.toLocaleString()}
              </div>
            </div>
          </div>
          
          <Progress 
            value={100 - usagePercentage} 
            className="h-2"
          />
          
          <div className="text-xs text-gray-500 text-center">
            {usagePercentage.toFixed(1)}% used this month
          </div>
        </div>

        {/* Token Breakdown */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Monthly Allocation</div>
            <div className="font-medium">{currentPool.allocated_tokens.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-600">Used</div>
            <div className="font-medium">{currentPool.used_tokens.toLocaleString()}</div>
          </div>
          {currentPool.rollover_tokens > 0 && (
            <div>
              <div className="text-gray-600">Rollover</div>
              <div className="font-medium text-green-600">+{currentPool.rollover_tokens.toLocaleString()}</div>
            </div>
          )}
          {currentPool.purchased_tokens > 0 && (
            <div>
              <div className="text-gray-600">Purchased</div>
              <div className="font-medium text-blue-600">+{currentPool.purchased_tokens.toLocaleString()}</div>
            </div>
          )}
        </div>

        {/* Token Value */}
        <div className="bg-tennis-green-bg/30 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Token Value</span>
            <div className="text-right">
              <div className="font-medium text-tennis-green-dark">
                ${(availableTokens * 0.007).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">
                $0.007 per token
              </div>
            </div>
          </div>
        </div>

        {/* Low Tokens Warning */}
        {isLowTokens && (
          <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              <div className="text-sm">
                <div className="font-medium">Low Token Balance</div>
                <div className="text-xs">Consider purchasing more tokens</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link to={`/club/${clubId}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View Club
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
          <Link to="/store?tab=club-tokens" className="flex-1">
            <Button size="sm" className="w-full bg-tennis-green-primary hover:bg-tennis-green-medium">
              <Coins className="h-3 w-3 mr-1" />
              Buy Tokens
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}