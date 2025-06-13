
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, Zap, Coins } from 'lucide-react';

interface PlayerStatusCardProps {
  hpData: any;
  xpData: any;
  tokenData: any;
}

export function PlayerStatusCard({ hpData, xpData, tokenData }: PlayerStatusCardProps) {
  return (
    <Card className="border-tennis-green-light">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Your Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* HP */}
        {hpData && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-red-500" />
                <span className="text-xs font-medium">HP</span>
              </div>
              <span className="text-xs">
                {hpData.current_hp}/{hpData.max_hp}
              </span>
            </div>
            <Progress 
              value={(hpData.current_hp / hpData.max_hp) * 100} 
              className="h-2"
            />
          </div>
        )}

        {/* XP */}
        {xpData && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-blue-500" />
                <span className="text-xs font-medium">Level {xpData.current_level}</span>
              </div>
              <span className="text-xs">
                {xpData.current_xp}/{xpData.current_xp + xpData.xp_to_next_level}
              </span>
            </div>
            <Progress 
              value={(xpData.current_xp / (xpData.current_xp + xpData.xp_to_next_level)) * 100} 
              className="h-2"
            />
          </div>
        )}

        {/* Tokens */}
        {tokenData && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Coins className="h-3 w-3 text-yellow-500" />
              <span className="text-xs font-medium">Tokens</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {tokenData.regular_tokens}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
