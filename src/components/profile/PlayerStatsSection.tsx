import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Heart, Zap, Coins, Trophy } from 'lucide-react';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { useMatchHistory } from '@/hooks/useMatchHistory';

export function PlayerStatsSection() {
  const { hpData, loading: hpLoading } = usePlayerHP();
  const { xpData, loading: xpLoading } = usePlayerXP();
  const { regularTokens, loading: tokensLoading } = usePlayerTokens();
  const { matchHistory, loading: matchLoading } = useMatchHistory();

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
          <Zap className="h-5 w-5" />
          Player Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* HP Stat */}
          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
            <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="space-y-2">
              <p className="text-xs text-red-600/70 font-medium">Health Points</p>
              {hpLoading ? (
                <div className="animate-pulse h-6 bg-red-200 rounded"></div>
              ) : (
                <>
                  <p className="text-lg font-bold text-red-700">
                    {hpData?.current_hp || 0} / {hpData?.max_hp || 100}
                  </p>
                  <Progress 
                    value={((hpData?.current_hp || 0) / (hpData?.max_hp || 100)) * 100} 
                    className="h-2"
                  />
                </>
              )}
            </div>
          </div>

          {/* XP Stat */}
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="space-y-2">
              <p className="text-xs text-blue-600/70 font-medium">Level & XP</p>
              {xpLoading ? (
                <div className="animate-pulse h-6 bg-blue-200 rounded"></div>
              ) : (
                <>
                  <p className="text-lg font-bold text-blue-700">
                    Level {xpData?.current_level || 1}
                  </p>
                  <Progress 
                    value={xpData?.xp_to_next_level ? 
                      ((xpData.current_xp / (xpData.current_xp + xpData.xp_to_next_level)) * 100) : 0
                    } 
                    className="h-2"
                  />
                </>
              )}
            </div>
          </div>

          {/* Tokens Stat */}
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
            <Coins className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="space-y-2">
              <p className="text-xs text-yellow-600/70 font-medium">Tokens</p>
              {tokensLoading ? (
                <div className="animate-pulse h-6 bg-yellow-200 rounded"></div>
              ) : (
                <p className="text-lg font-bold text-yellow-700">
                  {regularTokens || 0}
                </p>
              )}
            </div>
          </div>

          {/* Match Stats */}
          <div className="text-center p-4 bg-gradient-to-br from-tennis-green-light/20 to-tennis-green-medium/20 rounded-lg">
            <Trophy className="h-8 w-8 text-tennis-green-medium mx-auto mb-2" />
            <div className="space-y-2">
              <p className="text-xs text-tennis-green-dark/70 font-medium">Win Rate</p>
              {matchLoading ? (
                <div className="animate-pulse h-6 bg-tennis-green-light rounded"></div>
              ) : (
                <>
                <p className="text-lg font-bold text-tennis-green-dark">
                    {matchHistory?.winRate.toFixed(0) || 0}%
                  </p>
                  <p className="text-xs text-tennis-green-dark/60">
                    {matchHistory?.matchesWon || 0}W - {matchHistory?.matchesLost || 0}L
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}