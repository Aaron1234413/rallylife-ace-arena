import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Coins,
  Users,
  Activity
} from 'lucide-react';

interface EconomicsAnalyticsProps {
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
}

export function EconomicsAnalytics({ club, tokenPoolData }: EconomicsAnalyticsProps) {
  // Mock analytics data
  const revenueData = {
    monthly_revenue: 2840,
    token_purchases: 1200,
    service_bookings: 980,
    membership_fees: 660
  };

  const usageMetrics = {
    active_payers: 23,
    conversion_rate: 68,
    avg_spend_per_member: 42,
    token_utilization: 87
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-900">
                  ${revenueData.monthly_revenue}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600">+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Coins className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Token Utilization</p>
                <p className="text-2xl font-bold text-blue-900">
                  {usageMetrics.token_utilization}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-blue-600">+5.2% efficiency</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-700">Active Payers</p>
                <p className="text-2xl font-bold text-purple-900">
                  {usageMetrics.active_payers}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-purple-600">{usageMetrics.conversion_rate}% conversion</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-700">Avg. Spend</p>
                <p className="text-2xl font-bold text-orange-900">
                  ${usageMetrics.avg_spend_per_member}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              <span className="text-orange-600">-2.1% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-500" />
            Revenue Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Token Purchases</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">${revenueData.token_purchases}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(revenueData.token_purchases / revenueData.monthly_revenue) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600 w-10">42.3%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">Service Bookings</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">${revenueData.service_bookings}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(revenueData.service_bookings / revenueData.monthly_revenue) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600 w-10">34.5%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium">Membership Fees</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">${revenueData.membership_fees}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${(revenueData.membership_fees / revenueData.monthly_revenue) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600 w-10">23.2%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <h4 className="font-medium text-emerald-900 mb-2">Token Economy Health</h4>
              <div className="space-y-2 text-sm text-emerald-700">
                <div className="flex justify-between">
                  <span>Circulation Rate:</span>
                  <span className="font-medium">87% (Excellent)</span>
                </div>
                <div className="flex justify-between">
                  <span>Velocity:</span>
                  <span className="font-medium">2.3x/month</span>
                </div>
                <div className="flex justify-between">
                  <span>Member Engagement:</span>
                  <span className="font-medium">High</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Growth Opportunities</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Increase premium service adoption</li>
                <li>• Launch member referral program</li>
                <li>• Optimize token pricing for popular services</li>
                <li>• Introduce seasonal tournaments</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}