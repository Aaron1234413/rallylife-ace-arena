
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Zap, Coins, Star } from 'lucide-react';

interface PlayerStatusCardProps {
  hpData?: any;
  xpData?: any;
  tokenData?: any;
  loading?: boolean;
}

export function PlayerStatusCard({ hpData, xpData, tokenData, loading }: PlayerStatusCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hpPercentage = hpData ? (hpData.current_hp / hpData.max_hp) * 100 : 0;
  const xpPercentage = xpData ? 
    (xpData.current_xp / (xpData.current_xp + xpData.xp_to_next_level)) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Player Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* HP Status */}
        {hpData && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Health Points</span>
              </div>
              <span className="font-medium">{hpData.current_hp}/{hpData.max_hp}</span>
            </div>
            <Progress value={hpPercentage} className="h-2" />
          </div>
        )}

        {/* XP Status */}
        {xpData && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Level {xpData.current_level}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {xpData.xp_to_next_level} XP to next
              </span>
            </div>
            <Progress value={xpPercentage} className="h-2" />
          </div>
        )}

        {/* Tokens */}
        {tokenData && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span>Tokens</span>
            </div>
            <Badge variant="secondary">
              {tokenData.regular_tokens}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
