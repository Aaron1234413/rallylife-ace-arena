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
  Building,
  Shield
} from 'lucide-react';
import { useClubTokenPool } from '@/hooks/useClubTokenPool';
import { calculateClubPoolStatus } from '@/utils/gameEconomics';
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

  const poolStatus = calculateClubPoolStatus(currentPool);
  const { available_balance, can_redeem, usage_percentage, is_low_balance } = poolStatus;
  
  const totalTokens = currentPool.allocated_tokens + currentPool.rollover_tokens + currentPool.purchased_tokens;
  const hasOverdraft = currentPool.overdraft_tokens > 0;

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 ${
      is_low_balance ? 'border-orange-200 bg-orange-50' : 'border-tennis-green-primary/20'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building className="h-4 w-4 text-tennis-green-primary" />
            {clubName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={is_low_balance ? "destructive" : "outline"} className="text-xs">
              {currentPool.month_year}
            </Badge>
            {hasOverdraft && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Overdraft
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Token Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Available Tokens</span>
            <div className="text-right">
              <div className={`text-lg font-bold ${can_redeem ? 'text-tennis-green-primary' : 'text-red-600'}`}>
                {available_balance.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                of {totalTokens.toLocaleString()}
                {hasOverdraft && ` (+${currentPool.overdraft_tokens} overdraft)`}
              </div>
            </div>
          </div>
          
          <Progress 
            value={Math.max(0, 100 - usage_percentage)} 
            className="h-2"
          />
          
          <div className="text-xs text-gray-500 text-center">
            {usage_percentage.toFixed(1)}% used this month
            {!can_redeem && <span className="text-red-600 font-medium"> • Pool Exhausted</span>}
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
                ${(available_balance * 0.007).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">
                $0.007 per token
              </div>
            </div>
          </div>
        </div>

        {/* Low Tokens Warning */}
        {is_low_balance && (
          <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              <div className="text-sm">
                <div className="font-medium">
                  {can_redeem ? 'Low Token Balance' : 'Token Pool Exhausted'}
                </div>
                <div className="text-xs">
                  {can_redeem 
                    ? 'Consider purchasing more tokens' 
                    : hasOverdraft 
                      ? 'Using overdraft protection'
                      : 'No tokens available for redemption'
                  }
                </div>
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