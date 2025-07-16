import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Zap, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { TokenPackStore } from '@/components/store/TokenPackStore';

interface TokenPackPurchasingProps {
  clubId: string;
}

export function TokenPackPurchasing({ clubId }: TokenPackPurchasingProps) {
  const handlePurchase = async (pack: any): Promise<boolean> => {
    try {
      // This would integrate with the existing token pack purchase system
      console.log('Purchasing token pack for club:', clubId, pack);
      
      // In real implementation, this would call the edge function
      // to create a Stripe checkout session for club token purchases
      
      return true;
    } catch (error) {
      console.error('Error purchasing token pack:', error);
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Purchase History Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">2</div>
              <div className="text-xs text-gray-500">token packs purchased</div>
              <div className="text-sm font-medium text-green-600">
                +15,000 tokens
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">$105.00</div>
              <div className="text-xs text-gray-500">this month</div>
              <div className="text-sm text-gray-500">
                vs $87.50 last month
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">92%</div>
              <div className="text-xs text-gray-500">usage rate</div>
              <Badge variant="default" className="text-xs">
                Excellent
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Purchases */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Purchases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Sample purchase entries */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Standard Club Pack</div>
                  <div className="text-sm text-gray-500">Jan 5, 2024 • 10:30 AM</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">+25,000 tokens</div>
                <div className="text-sm text-gray-500">$175.00</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Community Pack</div>
                  <div className="text-sm text-gray-500">Jan 2, 2024 • 2:15 PM</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">+10,000 tokens</div>
                <div className="text-sm text-gray-500">$70.00</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Pack Store */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Purchase New Token Packs</h3>
        <TokenPackStore
          targetType="club"
          onPurchase={handlePurchase}
          clubId={clubId}
        />
      </div>

      {/* Purchase Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 text-sm">ℹ️</div>
            <div className="text-sm">
              <div className="font-medium text-blue-800 mb-2">Token Pack Purchase Guidelines</div>
              <ul className="space-y-1 text-blue-700">
                <li>• <strong>Community Pack:</strong> Best for small clubs with basic token needs</li>
                <li>• <strong>Standard Pack:</strong> Ideal for active clubs with regular member activity</li>
                <li>• <strong>Premium Pack:</strong> Suitable for large clubs with high token consumption</li>
                <li>• <strong>Enterprise Pack:</strong> For tennis resorts and large facilities</li>
                <li>• All purchases include rollover benefits for Plus and Pro subscription tiers</li>
                <li>• Tokens expire after 90 days if unused</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}