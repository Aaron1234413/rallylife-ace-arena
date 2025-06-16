
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Zap, TrendingUp, Star } from 'lucide-react';
import { EnhancedXPProgress } from '@/components/xp/EnhancedXPProgress';
import { HPStatusIndicator } from '@/components/hp/HPStatusIndicator';
import { TokenEarningIndicator } from '@/components/tokens/TokenEarningIndicator';

interface PlayerVitalsHeroProps {
  hpData: any;
  xpData: any;
  tokenData: any;
  loading: boolean;
}

export function PlayerVitalsHero({ hpData, xpData, tokenData, loading }: PlayerVitalsHeroProps) {
  if (loading) {
    return (
      <Card className="w-full bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate earning rate based on tokens
  const getEarningRate = () => {
    const totalTokens = (tokenData?.regular_tokens || 0) + (tokenData?.premium_tokens || 0);
    if (totalTokens >= 100) return 'high';
    if (totalTokens >= 50) return 'medium';
    return 'low';
  };

  return (
    <Card className="w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-0 shadow-lg overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Player Vitals Dashboard</h2>
          <p className="text-gray-600">Advanced progress tracking and status monitoring</p>
        </div>

        {/* Enhanced Vitals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Enhanced HP Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
              <div className="w-2 h-6 bg-red-500 rounded"></div>
              Health Points
            </h3>
            <HPStatusIndicator
              currentHP={hpData?.current_hp || 0}
              maxHP={hpData?.max_hp || 100}
              showDetails={true}
              size="medium"
            />
          </div>

          {/* Enhanced XP Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
              <div className="w-2 h-6 bg-yellow-500 rounded"></div>
              Experience Progress
            </h3>
            <EnhancedXPProgress
              currentLevel={xpData?.current_level || 1}
              currentXP={xpData?.current_xp || 0}
              xpToNextLevel={xpData?.xp_to_next_level || 100}
              totalXPEarned={xpData?.total_xp_earned}
              showMilestones={true}
              size="medium"
            />
          </div>

          {/* Enhanced Token Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
              <div className="w-2 h-6 bg-blue-500 rounded"></div>
              Token Economy
            </h3>
            <TokenEarningIndicator
              regularTokens={tokenData?.regular_tokens || 0}
              premiumTokens={tokenData?.premium_tokens || 0}
              dailyEarned={15} // This would come from actual data
              weeklyAverage={85} // This would come from actual data
              earningRate={getEarningRate()}
            />
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Today</span>
            </div>
            <div className="text-lg font-bold text-blue-600">3</div>
            <div className="text-xs text-gray-600">Activities</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Streak</span>
            </div>
            <div className="text-lg font-bold text-orange-600">7</div>
            <div className="text-xs text-gray-600">Days</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Rank</span>
            </div>
            <div className="text-lg font-bold text-green-600">#42</div>
            <div className="text-xs text-gray-600">This Week</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Goal</span>
            </div>
            <div className="text-lg font-bold text-purple-600">75%</div>
            <div className="text-xs text-gray-600">Complete</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
