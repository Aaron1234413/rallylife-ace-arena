
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Star, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HPStatusAlert } from './HPStatusAlert';
import { RecoveryCenter } from '@/components/recovery';
import { toast } from 'sonner';

interface PlayerVitalsHeroProps {
  hpData: any;
  xpData: any;
  tokenData: any;
  loading: boolean;
  onRestoreHP?: (amount: number, activityType: string, description?: string) => Promise<void>;
}

export function PlayerVitalsHero({ hpData, xpData, tokenData, loading, onRestoreHP }: PlayerVitalsHeroProps) {
  const [recoveryCenterOpen, setRecoveryCenterOpen] = useState(false);

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
    if (percentage >= 80) return { 
      label: 'Excellent', 
      color: 'bg-green-500', 
      textColor: 'text-green-700',
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      progressColor: 'bg-green-500'
    };
    if (percentage >= 40) return { 
      label: percentage >= 60 ? 'Good' : 'Fair', 
      color: percentage >= 60 ? 'bg-blue-500' : 'bg-yellow-500', 
      textColor: percentage >= 60 ? 'text-blue-700' : 'text-yellow-700',
      bgGradient: percentage >= 60 ? 'from-blue-50 to-sky-50' : 'from-yellow-50 to-orange-50',
      borderColor: percentage >= 60 ? 'border-blue-200' : 'border-yellow-200',
      progressColor: percentage >= 60 ? 'bg-blue-500' : 'bg-yellow-500'
    };
    return { 
      label: hpPercentage >= 20 ? 'Low' : 'Critical', 
      color: hpPercentage >= 20 ? 'bg-orange-500' : 'bg-red-500', 
      textColor: hpPercentage >= 20 ? 'text-orange-700' : 'text-red-700',
      bgGradient: hpPercentage >= 20 ? 'from-orange-50 to-red-50' : 'from-red-50 via-red-100 to-pink-50',
      borderColor: hpPercentage >= 20 ? 'border-orange-200' : 'border-red-200',
      progressColor: hpPercentage >= 20 ? 'bg-orange-500' : 'bg-red-500'
    };
  };

  const hpStatus = getHPStatus(hpPercentage);

  const handleOpenRecoveryCenter = () => {
    console.log('Opening Recovery Center from HP Status Alert');
    setRecoveryCenterOpen(true);
  };

  const handleQuickRestore = async () => {
    if (!onRestoreHP) {
      toast.error('Recovery function not available');
      return;
    }

    try {
      await onRestoreHP(10, 'quick_restore', 'Emergency HP restoration');
      toast.success('Quick HP restore completed! +10 HP');
    } catch (error) {
      console.error('Error with quick restore:', error);
      toast.error('Failed to restore HP. Please try again.');
    }
  };

  if (recoveryCenterOpen) {
    return (
      <RecoveryCenter onBack={() => setRecoveryCenterOpen(false)} />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-0 shadow-xl overflow-hidden">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Player Vitals</h2>
            <p className="text-gray-600 text-lg">Track your progress and stay motivated</p>
          </div>

          {/* Main Vitals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* HP Section - Enhanced with status-driven styling */}
            <div className={cn(
              "p-6 rounded-2xl border-2 transition-all duration-300",
              `bg-gradient-to-br ${hpStatus.bgGradient}`,
              hpStatus.borderColor,
              hpPercentage < 40 ? "shadow-lg ring-2 ring-red-200" : "shadow-md"
            )}>
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Heart 
                    className={cn(
                      "h-7 w-7 transition-all duration-300", 
                      hpPercentage <= 30 ? "text-red-500 animate-pulse" : "text-red-400"
                    )} 
                    fill={hpPercentage <= 30 ? "currentColor" : "none"} 
                  />
                  <h3 className="font-bold text-xl text-gray-900">Health Points</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-gray-700">HP</span>
                    <span className={cn(
                      "font-bold transition-all duration-300",
                      hpPercentage < 40 ? "text-2xl text-red-700" : "text-xl text-gray-900"
                    )}>
                      {hpData?.current_hp || 0}/{hpData?.max_hp || 100}
                    </span>
                  </div>
                  <Progress 
                    value={hpPercentage} 
                    className="h-4 bg-gray-200 rounded-full"
                    indicatorClassName={cn(
                      "transition-all duration-500 rounded-full",
                      hpStatus.progressColor
                    )}
                  />
                  <div className="flex justify-center">
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-sm font-semibold px-4 py-2 rounded-full border-2 bg-white/80 backdrop-blur-sm",
                        hpStatus.textColor,
                        hpStatus.borderColor.replace('border-', 'border-'),
                        hpPercentage < 40 ? "animate-pulse" : ""
                      )}
                    >
                      {hpStatus.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* XP Section - Enhanced styling */}
            <div className="text-center space-y-4 p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 shadow-md">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Star className="h-7 w-7 text-yellow-500" fill="currentColor" />
                <h3 className="font-bold text-xl text-gray-900">Experience</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge variant="outline" className="font-bold text-lg px-4 py-2 text-yellow-700 border-yellow-300 bg-white/80">
                    Level {xpData?.current_level || 1}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-gray-700">XP</span>
                  <span className="font-bold text-xl text-gray-900">
                    {xpData?.current_xp || 0}/{(xpData?.current_xp || 0) + (xpData?.xp_to_next_level || 100)}
                  </span>
                </div>
                <Progress 
                  value={xpPercentage} 
                  className="h-4 bg-gray-200 rounded-full"
                  indicatorClassName="bg-yellow-500 transition-all duration-500 rounded-full"
                />
                <p className="text-sm text-gray-600 font-medium">
                  {xpData?.xp_to_next_level || 100} XP to next level
                </p>
              </div>
            </div>

            {/* Tokens Section - Enhanced styling */}
            <div className="text-center space-y-4 p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 shadow-md">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Coins className="h-7 w-7 text-purple-500" />
                <h3 className="font-bold text-xl text-gray-900">Tokens</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <div className="font-bold text-2xl text-gray-900">{tokenData?.regular_tokens || 0}</div>
                    <div className="text-sm text-gray-600 font-medium">Regular</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-2xl text-purple-600">{tokenData?.premium_tokens || 0}</div>
                    <div className="text-sm text-gray-600 font-medium">Premium</div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-sm bg-white/80 backdrop-blur-sm border-purple-200 px-4 py-2">
                  {tokenData?.lifetime_earned || 0} Total Earned
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HP Status Alert - Contextual recovery suggestions */}
      <HPStatusAlert
        hpPercentage={hpPercentage}
        currentHP={hpData?.current_hp || 0}
        maxHP={hpData?.max_hp || 100}
        onOpenRecoveryCenter={handleOpenRecoveryCenter}
        onQuickRestore={handleQuickRestore}
      />
    </div>
  );
}
