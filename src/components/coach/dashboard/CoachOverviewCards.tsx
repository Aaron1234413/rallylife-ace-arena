
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, Star, Coins, Award, Target } from 'lucide-react';

interface CoachOverviewCardsProps {
  cxpData: any;
  tokenData: any;
  crpData: any;
  cxpLoading: boolean;
  tokensLoading: boolean;
  crpLoading: boolean;
}

export function CoachOverviewCards({
  cxpData,
  tokenData,
  crpData,
  cxpLoading,
  tokensLoading,
  crpLoading
}: CoachOverviewCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* CXP Card */}
      <Card className="border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Award className="h-4 w-4 text-blue-600" />
            Coaching Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cxpLoading ? (
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-2 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : cxpData ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  Level {cxpData.current_level}
                </span>
                <Badge variant="outline" className="text-xs">
                  {cxpData.coaching_tier}
                </Badge>
              </div>
              <Progress 
                value={(cxpData.current_cxp / (cxpData.current_cxp + cxpData.cxp_to_next_level)) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {cxpData.cxp_to_next_level} CXP to next level
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Initializing...</p>
          )}
        </CardContent>
      </Card>

      {/* CTK Card */}
      <Card className="border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Coins className="h-4 w-4 text-green-600" />
            Coach Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tokensLoading ? (
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : tokenData ? (
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">
                {tokenData.current_tokens.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {tokenData.lifetime_earned.toLocaleString()} earned total
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Initializing...</p>
          )}
        </CardContent>
      </Card>

      {/* CRP Card */}
      <Card className="border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Star className="h-4 w-4 text-orange-600" />
            Reputation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {crpLoading ? (
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : crpData ? (
            <div className="space-y-1">
              <div className="text-2xl font-bold text-orange-600">
                {crpData.current_crp?.toFixed(1) || '0.0'}
              </div>
              <p className="text-xs text-muted-foreground">
                {crpData.reputation_tier || 'Unranked'} tier
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Initializing...</p>
          )}
        </CardContent>
      </Card>

      {/* Active Clients Card */}
      <Card className="border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            Active Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-purple-600">
              12
            </div>
            <p className="text-xs text-muted-foreground">
              3 new this month
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
