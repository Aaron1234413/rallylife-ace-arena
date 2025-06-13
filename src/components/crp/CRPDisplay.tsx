
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Award } from 'lucide-react';
import { useCoachCRP } from '@/hooks/useCoachCRP';

interface CRPDisplayProps {
  coachId?: string;
  showDetails?: boolean;
}

export function CRPDisplay({ coachId, showDetails = true }: CRPDisplayProps) {
  const { crpData, isLoading } = useCoachCRP(coachId);

  if (isLoading) {
    return (
      <Card className="border-tennis-green-light">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!crpData) {
    return (
      <Card className="border-tennis-green-light">
        <CardContent className="p-4">
          <p className="text-tennis-green-medium">No CRP data available</p>
        </CardContent>
      </Card>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'platinum': return 'bg-purple-500';
      case 'gold': return 'bg-yellow-500';
      case 'silver': return 'bg-gray-400';
      default: return 'bg-orange-600';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'platinum': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      default: return '🥉';
    }
  };

  if (!showDetails) {
    return (
      <div className="flex items-center gap-2">
        <Badge className={`${getLevelColor(crpData.reputation_level)} text-white`}>
          {getLevelIcon(crpData.reputation_level)} {crpData.reputation_level.toUpperCase()}
        </Badge>
        <span className="text-tennis-green-dark font-semibold">{crpData.current_crp} CRP</span>
      </div>
    );
  }

  return (
    <Card className="border-tennis-green-light">
      <CardHeader className="bg-tennis-green-light text-white p-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="h-5 w-5" />
          Coach Reputation
        </CardTitle>
        <CardDescription className="text-tennis-green-bg text-sm">
          Current standing and performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge className={`${getLevelColor(crpData.reputation_level)} text-white mb-2`}>
                {getLevelIcon(crpData.reputation_level)} {crpData.reputation_level.toUpperCase()}
              </Badge>
              <p className="text-2xl font-bold text-tennis-green-dark">{crpData.current_crp} CRP</p>
              <p className="text-sm text-tennis-green-medium">
                {crpData.total_crp_earned} total earned
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-tennis-green-dark">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {(crpData.visibility_score * 100).toFixed(0)}% visibility
                </span>
              </div>
              {crpData.booking_rate_bonus > 0 && (
                <div className="flex items-center gap-1 text-tennis-green-dark mt-1">
                  <Star className="h-4 w-4" />
                  <span className="text-sm">
                    +{(crpData.booking_rate_bonus * 100).toFixed(0)}% rate bonus
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-xs text-tennis-green-medium">
            Next tier: {crpData.reputation_level === 'bronze' ? 'Silver (500 CRP)' :
                       crpData.reputation_level === 'silver' ? 'Gold (1000 CRP)' :
                       crpData.reputation_level === 'gold' ? 'Platinum (2000 CRP)' :
                       'Maximum tier reached!'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
