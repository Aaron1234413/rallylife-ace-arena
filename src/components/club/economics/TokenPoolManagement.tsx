import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Coins,
  Plus,
  TrendingUp,
  Clock,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { TokenPurchaseDialog } from './TokenPurchaseDialog';

interface TokenPoolManagementProps {
  club: {
    id: string;
    name: string;
  };
  tokenPoolData: {
    monthly_allocation: number;
    current_balance: number;
    used_this_month: number;
    rollover_tokens: number;
    expires_at: string;
  };
  canManage: boolean;
}

export function TokenPoolManagement({ club, tokenPoolData, canManage }: TokenPoolManagementProps) {
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  
  const usagePercentage = (tokenPoolData.used_this_month / tokenPoolData.monthly_allocation) * 100;
  const remainingDays = Math.ceil((new Date(tokenPoolData.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <>
      <div className="space-y-6">
        {/* Token Pool Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Coins className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-emerald-700">Current Balance</p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {tokenPoolData.current_balance.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">Used this month</span>
                  <span className="text-emerald-900 font-medium">{usagePercentage.toFixed(1)}%</span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-700">Monthly Allocation</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {tokenPoolData.monthly_allocation.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <RefreshCw className="h-4 w-4" />
                <span>Renews in {remainingDays} days</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-700">Rollover Tokens</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {tokenPoolData.rollover_tokens.toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-xs text-purple-600">
                From previous month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Token Management Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-500" />
                Token Pool Management
              </CardTitle>
              {canManage && (
                <Button
                  onClick={() => setShowPurchaseDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Buy Tokens
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Usage Breakdown */}
            <div>
              <h3 className="font-semibold mb-4">Token Usage This Month</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Coaching Sessions</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">8,500 tokens</span>
                    <Badge variant="secondary">48.6%</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Court Bookings</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">6,200 tokens</span>
                    <Badge variant="secondary">35.4%</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Tournament Entries</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">2,800 tokens</span>
                    <Badge variant="secondary">16.0%</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Token Economics Info */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
              <h4 className="font-semibold text-emerald-900 mb-2">Token Economics</h4>
              <div className="space-y-2 text-sm text-emerald-700">
                <div className="flex justify-between">
                  <span>Conversion Rate:</span>
                  <span className="font-medium">$1 = 100 tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Pool Value:</span>
                  <span className="font-medium">${(tokenPoolData.current_balance / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Budget:</span>
                  <span className="font-medium">${(tokenPoolData.monthly_allocation / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Low Balance Warning */}
            {tokenPoolData.current_balance < tokenPoolData.monthly_allocation * 0.2 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">Low Token Balance Warning</span>
                </div>
                <p className="text-sm text-amber-700 mt-2">
                  Your token balance is running low. Consider purchasing additional tokens to avoid service interruptions.
                </p>
                {canManage && (
                  <Button 
                    size="sm" 
                    className="mt-3"
                    onClick={() => setShowPurchaseDialog(true)}
                  >
                    Purchase Tokens
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TokenPurchaseDialog
        open={showPurchaseDialog}
        onOpenChange={setShowPurchaseDialog}
        club={club}
      />
    </>
  );
}