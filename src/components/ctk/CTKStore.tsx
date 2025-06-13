
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart,
  BarChart3,
  Megaphone,
  BookOpen,
  Users,
  TrendingUp,
  Star,
  Calendar
} from 'lucide-react';
import { useCoachTokens } from '@/hooks/useCoachTokens';

export function CTKStore() {
  const { tokenData, spendTokens, spendTokensLoading } = useCoachTokens();

  const handlePurchase = (item: typeof storeItems[0]) => {
    if (!tokenData || tokenData.current_tokens < item.cost) {
      return;
    }

    spendTokens({
      amount: item.cost,
      source: item.id,
      description: item.description
    });
  };

  const canAfford = (cost: number) => {
    return tokenData && tokenData.current_tokens >= cost;
  };

  const storeItems = [
    {
      id: 'marketing_boost',
      name: 'Marketing Boost',
      description: 'Promote your profile for 7 days',
      icon: Megaphone,
      cost: 30,
      category: 'Marketing Tools',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'premium_analytics',
      name: 'Premium Analytics',
      description: 'Advanced player performance insights',
      icon: BarChart3,
      cost: 50,
      category: 'Analytics',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'professional_development',
      name: 'Professional Course',
      description: 'Access to advanced coaching techniques',
      icon: BookOpen,
      cost: 75,
      category: 'Professional Development',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'player_management',
      name: 'Player Management Tools',
      description: 'Advanced tools for managing multiple players',
      icon: Users,
      cost: 40,
      category: 'Management',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      id: 'performance_tracker',
      name: 'Performance Tracker',
      description: 'Detailed performance tracking dashboard',
      icon: TrendingUp,
      cost: 35,
      category: 'Analytics',
      color: 'bg-cyan-500 hover:bg-cyan-600'
    },
    {
      id: 'premium_badge',
      name: 'Premium Coach Badge',
      description: 'Display premium status on your profile',
      icon: Star,
      cost: 60,
      category: 'Profile Enhancement',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      id: 'scheduling_premium',
      name: 'Premium Scheduling',
      description: 'Advanced scheduling and calendar features',
      icon: Calendar,
      cost: 45,
      category: 'Management',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    }
  ];

  return (
    <Card className="border-tennis-green-light">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          CTK Store
        </CardTitle>
        <CardDescription>
          Invest your Coach Tokens in professional development and marketing tools
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tokenData && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-900">Available CTK:</span>
              <span className="font-bold text-blue-900">{tokenData.current_tokens}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {storeItems.map((item) => {
            const Icon = item.icon;
            const affordable = canAfford(item.cost);
            
            return (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-tennis-green-dark">{item.name}</h3>
                    <p className="text-sm text-tennis-green-medium">{item.description}</p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {item.category}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-bold text-tennis-green-dark">{item.cost} CTK</span>
                  <Button
                    size="sm"
                    disabled={!affordable || spendTokensLoading}
                    onClick={() => handlePurchase(item)}
                    className={affordable ? item.color : ''}
                    variant={affordable ? 'default' : 'outline'}
                  >
                    {affordable ? 'Purchase' : 'Insufficient CTK'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
