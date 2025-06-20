
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Star, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

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
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use actual data - no fallbacks to mock values
  const hpPercentage = hpData ? (hpData.current_hp / hpData.max_hp) * 100 : 0;
  const xpPercentage = xpData ? (xpData.current_xp / (xpData.current_xp + xpData.xp_to_next_level)) * 100 : 0;
  
  const getHPStatus = (percentage: number) => {
    if (percentage >= 80) return { label: 'Excellent', color: 'bg-green-500', textColor: 'text-green-700' };
    if (percentage >= 60) return { label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-700' };
    if (percentage >= 40) return { label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    if (percentage >= 20) return { label: 'Low', color: 'bg-orange-500', textColor: 'text-orange-700' };
    return { label: 'Critical', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  const hpStatus = getHPStatus(hpPercentage);

  return (
    <Card className="w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-0 shadow-lg overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Player Vitals</h2>
          <p className="text-gray-600">Track your progress and stay motivated</p>
        </div>

        {/* Main Vitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* HP Section */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className={cn("h-6 w-6", hpPercentage <= 30 ? "text-red-500" : "text-red-400")} 
                    fill={hpPercentage <= 30 ? "currentColor" : "none"} />
              <h3 className="font-semibold text-lg">Health Points</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">HP</span>
                <span className="font-bold">{hpData?.current_hp || 0}/{hpData?.max_hp || 100}</span>
              </div>
              <Progress 
                value={hpPercentage} 
                className="h-3 bg-gray-200"
                indicatorClassName={cn(
                  "transition-all duration-500",
                  hpPercentage >= 80 ? "bg-green-500" :
                  hpPercentage >= 60 ? "bg-blue-500" :
                  hpPercentage >= 40 ? "bg-yellow-500" :
                  hpPercentage >= 20 ? "bg-orange-500" : "bg-red-500"
                )}
              />
              <Badge variant="secondary" className={cn("text-xs", hpStatus.textColor, "bg-white")}>
                {hpStatus.label}
              </Badge>
            </div>
          </div>

          {/* XP Section */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="h-6 w-6 text-yellow-500" fill="currentColor" />
              <h3 className="font-semibold text-lg">Experience</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Badge variant="outline" className="font-bold text-yellow-700 border-yellow-300">
                  Level {xpData?.current_level || 1}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">XP</span>
                <span className="font-bold">
                  {xpData?.current_xp || 0}/{(xpData?.current_xp || 0) + (xpData?.xp_to_next_level || 100)}
                </span>
              </div>
              <Progress 
                value={xpPercentage} 
                className="h-3 bg-gray-200"
                indicatorClassName="bg-yellow-500 transition-all duration-500"
              />
              <p className="text-xs text-gray-600">
                {xpData?.xp_to_next_level || 100} XP to next level
              </p>
            </div>
          </div>

          {/* Tokens Section */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coins className="h-6 w-6 text-yellow-500" />
              <h3 className="font-semibold text-lg">Tokens</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="font-bold text-lg">{tokenData?.regular_tokens || 0}</div>
                  <div className="text-xs text-gray-600">Regular</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-purple-600">{tokenData?.premium_tokens || 0}</div>
                  <div className="text-xs text-gray-600">Premium</div>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs bg-white">
                {tokenData?.lifetime_earned || 0} Total Earned
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
