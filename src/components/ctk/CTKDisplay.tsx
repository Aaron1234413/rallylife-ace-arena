
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, TrendingUp, ShoppingCart, Users, Loader2 } from 'lucide-react';
import { useCoachTokens } from '@/hooks/useCoachTokens';

export function CTKDisplay() {
  const { tokenData, loading, error } = useCoachTokens();

  if (loading) {
    return (
      <Card className="border-tennis-green-light">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Coach Tokens (CTK)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-tennis-green-medium">Loading CTK data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !tokenData) {
    return (
      <Card className="border-tennis-green-light">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Coach Tokens (CTK)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Unable to load CTK data. Tokens will be automatically initialized when you sign up.</p>
        </CardContent>
      </Card>
    );
  }

  if (!tokenData) {
    return (
      <Card className="border-tennis-green-light">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Coach Tokens (CTK)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-tennis-green-medium">CTK tokens will be automatically set up when you complete registration.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-tennis-green-light">
      <CardHeader className="bg-tennis-green-light text-white p-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Coins className="h-5 w-5" />
          Coach Tokens (CTK)
        </CardTitle>
        <CardDescription className="text-tennis-green-bg text-sm">
          Professional Development Currency
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Current Balance */}
          <div className="text-center">
            <div className="text-3xl font-bold text-tennis-green-dark">
              {tokenData.current_tokens.toLocaleString()}
            </div>
            <p className="text-sm text-tennis-green-medium">Current CTK Balance</p>
          </div>

          {/* Lifetime Earned */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-800">Lifetime Earned</span>
            </div>
            <div className="text-blue-700 font-medium">
              {tokenData.lifetime_earned.toLocaleString()} CTK
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Earn more through successful coaching and platform engagement!
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Badge variant="outline" className="p-2 justify-center">
              <ShoppingCart className="h-3 w-3 mr-1" />
              CTK Store
            </Badge>
            <Badge variant="outline" className="p-2 justify-center">
              <Users className="h-3 w-3 mr-1" />
              Earn CTK
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
