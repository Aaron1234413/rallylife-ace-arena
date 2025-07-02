
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Star, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HPStatusAlert } from './HPStatusAlert';
import { WellbeingCenter } from '@/components/recovery';
import { toast } from 'sonner';

interface PlayerVitalsHeroProps {
  hpData: any;
  xpData: any;
  tokenData: any;
  loading: boolean;
  onRestoreHP?: (amount: number, activityType: string, description?: string) => Promise<void>;
}

export function PlayerVitalsHero({ hpData, xpData, tokenData, loading, onRestoreHP }: PlayerVitalsHeroProps) {
  const [wellbeingCenterOpen, setWellbeingCenterOpen] = useState(false);
  const [previousHP, setPreviousHP] = useState<number | null>(null);
  const [announceHP, setAnnounceHP] = useState(false);

  // Track HP changes for screen reader announcements
  useEffect(() => {
    if (hpData?.current_hp !== undefined) {
      if (previousHP !== null && previousHP !== hpData.current_hp) {
        setAnnounceHP(true);
        setTimeout(() => setAnnounceHP(false), 1000);
      }
      setPreviousHP(hpData.current_hp);
    }
  }, [hpData?.current_hp, previousHP]);

  if (loading) {
    return (
      <Card className="w-full bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg">
        <CardContent className="p-4 sm:p-6">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 sm:h-20 bg-gray-200 rounded"></div>
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
      progressColor: 'bg-gradient-to-r from-green-400 to-green-600',
      pulseIntensity: 'none',
      ariaLabel: 'Health status: Excellent',
      glowColor: 'shadow-green-200/50'
    };
    if (percentage >= 40) return { 
      label: percentage >= 60 ? 'Good' : 'Fair', 
      color: percentage >= 60 ? 'bg-blue-500' : 'bg-yellow-500', 
      textColor: percentage >= 60 ? 'text-blue-700' : 'text-yellow-700',
      bgGradient: percentage >= 60 ? 'from-blue-50 to-sky-50' : 'from-yellow-50 to-orange-50',
      borderColor: percentage >= 60 ? 'border-blue-200' : 'border-yellow-200',
      progressColor: percentage >= 60 ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-gradient-to-r from-yellow-400 to-yellow-600',
      pulseIntensity: 'none',
      ariaLabel: `Health status: ${percentage >= 60 ? 'Good' : 'Fair'}`,
      glowColor: percentage >= 60 ? 'shadow-blue-200/50' : 'shadow-yellow-200/50'
    };
    return { 
      label: hpPercentage >= 20 ? 'Low' : 'Critical', 
      color: hpPercentage >= 20 ? 'bg-orange-500' : 'bg-red-500', 
      textColor: hpPercentage >= 20 ? 'text-orange-700' : 'text-red-700',
      bgGradient: hpPercentage >= 20 ? 'from-orange-50 to-red-50' : 'from-red-50 via-red-100 to-pink-50',
      borderColor: hpPercentage >= 20 ? 'border-orange-200' : 'border-red-200',
      progressColor: hpPercentage >= 20 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 'bg-gradient-to-r from-red-400 to-red-600',
      pulseIntensity: hpPercentage >= 20 ? 'animate-pulse-slow' : 'animate-pulse',
      ariaLabel: `Health status: ${hpPercentage >= 20 ? 'Low' : 'Critical'} - Wellbeing session recommended`,
      glowColor: hpPercentage >= 20 ? 'shadow-orange-200/50' : 'shadow-red-200/50'
    };
  };

  const hpStatus = getHPStatus(hpPercentage);

  const handleOpenWellbeingCenter = () => {
    console.log('Opening Wellbeing Center from HP Status Alert');
    setWellbeingCenterOpen(true);
  };

  const handleQuickRestore = async () => {
    if (!onRestoreHP) {
      toast.error('Wellbeing function not available');
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

  if (wellbeingCenterOpen) {
    return (
      <WellbeingCenter onBack={() => setWellbeingCenterOpen(false)} />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Screen reader announcements for HP changes */}
      <div 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announceHP && `Health Points updated: ${hpData?.current_hp || 0} out of ${hpData?.max_hp || 100}`}
      </div>

      <Card className="w-full bg-gradient-to-br from-white via-tennis-green-bg/20 to-tennis-green-subtle/30 border border-tennis-green-light/30 shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm overflow-hidden">
        {/* Subtle animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-tennis-green-primary/5 to-transparent animate-shimmer pointer-events-none"></div>
        
        <CardContent className="p-4 sm:p-6 lg:p-8 relative z-10">
          {/* Header - Enhanced with Orbitron typography */}
          <div className="text-center mb-6 sm:mb-8 animate-fade-in">
            <h2 className="font-orbitron text-2xl sm:text-3xl lg:text-4xl text-tennis-green-dark mb-2 tracking-tight font-bold">
              Player Vitals
            </h2>
            <p className="text-base lg:text-lg text-gray-600">
              Track your progress and stay motivated
            </p>
          </div>

          {/* Main Vitals Grid - Enhanced with tech styling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* HP Section - Enhanced with glow effects */}
            <div 
              className={cn(
                "p-4 sm:p-6 rounded-2xl border-2 transition-all duration-700 transform hover:scale-105 group",
                "focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-tennis-green-primary",
                `bg-gradient-to-br ${hpStatus.bgGradient}`,
                hpStatus.borderColor,
                hpPercentage < 40 ? `shadow-lg ${hpStatus.glowColor} hover:shadow-xl hover:${hpStatus.glowColor.replace('/50', '/70')}` : `shadow-md hover:shadow-lg ${hpStatus.glowColor}`,
                hpStatus.pulseIntensity,
                "motion-reduce:animate-none motion-reduce:transition-none",
                "hover:border-tennis-green-primary/40"
              )}
              role="region"
              aria-labelledby="hp-heading"
              aria-describedby="hp-description"
            >
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Heart 
                    className={cn(
                      "h-6 w-6 sm:h-7 sm:w-7 transition-all duration-500 group-hover:scale-110", 
                      hpPercentage <= 30 ? "text-red-500 animate-pulse motion-reduce:animate-none" : "text-red-400"
                    )} 
                    fill={hpPercentage <= 30 ? "currentColor" : "none"}
                    aria-hidden="true"
                  />
                  <h3 
                    id="hp-heading"
                    className="font-orbitron text-lg sm:text-xl text-gray-900 transition-colors duration-300 group-hover:text-tennis-green-primary font-bold"
                  >
                    Health Points
                  </h3>
                </div>
                
                <div className="space-y-3" id="hp-description">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-gray-700 transition-colors duration-300">HP</span>
                    <span 
                      className={cn(
                        "font-bold transition-all duration-500 transform text-lg sm:text-xl",
                        hpPercentage < 40 ? "text-red-700 scale-110" : "text-gray-900",
                        "animate-number-change motion-reduce:animate-none"
                      )}
                      aria-label={`Current health: ${hpData?.current_hp || 0} out of ${hpData?.max_hp || 100} points`}
                    >
                      {hpData?.current_hp || 0}/{hpData?.max_hp || 100}
                    </span>
                  </div>
                  <Progress 
                    value={hpPercentage} 
                    className="h-3 sm:h-4 bg-gray-200 rounded-full transition-all duration-500 hover:h-4 sm:hover:h-5"
                    indicatorClassName={cn(
                      "transition-all duration-1000 rounded-full",
                      hpStatus.progressColor,
                      hpPercentage < 40 ? "animate-progress-urgent motion-reduce:animate-progress-smooth" : "animate-progress-smooth motion-reduce:animate-none"
                    )}
                    aria-label={`Health at ${Math.round(hpPercentage)}%`}
                  />
                  <div className="flex justify-center">
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs font-semibold px-3 sm:px-4 py-1 sm:py-2 rounded-full border-2 bg-white/90 backdrop-blur-sm transition-all duration-300",
                        hpStatus.textColor,
                        hpStatus.borderColor.replace('border-', 'border-'),
                        hpPercentage < 40 ? "animate-pulse motion-reduce:animate-none transform hover:scale-105" : "hover:scale-105",
                        "shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tennis-green-primary"
                      )}
                      aria-label={hpStatus.ariaLabel}
                      tabIndex={0}
                    >
                      {hpStatus.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* XP Section - Enhanced with tech styling */}
            <div 
              className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 shadow-md hover:shadow-lg hover:shadow-yellow-200/50 transition-all duration-500 transform hover:scale-105 group motion-reduce:transform-none motion-reduce:transition-none hover:border-tennis-green-primary/40"
              role="region"
              aria-labelledby="xp-heading"
              aria-describedby="xp-description"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Star 
                  className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-500 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none" 
                  fill="currentColor"
                  aria-hidden="true"
                />
                <h3 
                  id="xp-heading"
                  className="font-orbitron text-lg sm:text-xl text-gray-900 transition-colors duration-300 group-hover:text-tennis-green-primary font-bold"
                >
                  Experience
                </h3>
              </div>
              
              <div className="space-y-3" id="xp-description">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge 
                    variant="outline" 
                    className="font-orbitron font-bold text-base px-3 sm:px-4 py-1 sm:py-2 text-yellow-700 border-yellow-300 bg-white/90 transition-all duration-300 hover:scale-105 hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    tabIndex={0}
                    aria-label={`Current level: ${xpData?.current_level || 1}`}
                  >
                    Level {xpData?.current_level || 1}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-gray-700 transition-colors duration-300">XP</span>
                  <span 
                    className="font-bold text-lg sm:text-xl text-gray-900 transition-all duration-500 animate-number-change motion-reduce:animate-none"
                    aria-label={`Experience points: ${xpData?.current_xp || 0} out of ${(xpData?.current_xp || 0) + (xpData?.xp_to_next_level || 100)} needed for next level`}
                  >
                    {xpData?.current_xp || 0}/{(xpData?.current_xp || 0) + (xpData?.xp_to_next_level || 100)}
                  </span>
                </div>
                <Progress 
                  value={xpPercentage} 
                  className="h-3 sm:h-4 bg-gray-200 rounded-full transition-all duration-500 hover:h-4 sm:hover:h-5"
                  indicatorClassName="bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-1000 rounded-full animate-progress-smooth motion-reduce:animate-none"
                  aria-label={`Experience progress: ${Math.round(xpPercentage)}% to next level`}
                />
                <p className="text-sm text-gray-600 font-medium transition-colors duration-300">
                  {xpData?.xp_to_next_level || 100} XP to next level
                </p>
              </div>
            </div>

            {/* Tokens Section - Enhanced with tech styling */}
            <div 
              className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 shadow-md hover:shadow-lg hover:shadow-purple-200/50 transition-all duration-500 transform hover:scale-105 group motion-reduce:transform-none motion-reduce:transition-none sm:col-span-2 lg:col-span-1 hover:border-tennis-green-primary/40"
              role="region"
              aria-labelledby="tokens-heading"
              aria-describedby="tokens-description"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Coins 
                  className="h-6 w-6 sm:h-7 sm:w-7 text-purple-500 transition-all duration-300 group-hover:rotate-y-180 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none"
                  aria-hidden="true"
                />
                <h3 
                  id="tokens-heading"
                  className="font-orbitron text-lg sm:text-xl text-gray-900 transition-colors duration-300 group-hover:text-tennis-green-primary font-bold"
                >
                  Tokens
                </h3>
              </div>
              
              <div className="space-y-3" id="tokens-description">
                <div className="flex items-center justify-center gap-4 sm:gap-6">
                  <div 
                    className="text-center transition-all duration-300 hover:scale-105 focus-within:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                    tabIndex={0}
                    aria-label={`Regular tokens: ${tokenData?.regular_tokens || 0}`}
                  >
                    <div className="font-bold text-xl sm:text-2xl text-gray-900 transition-all duration-500 animate-number-change motion-reduce:animate-none">
                      {tokenData?.regular_tokens || 0}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Regular</div>
                  </div>
                  <div 
                    className="text-center transition-all duration-300 hover:scale-105 focus-within:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                    tabIndex={0}
                    aria-label={`Premium tokens: ${tokenData?.premium_tokens || 0}`}
                  >
                    <div className="font-bold text-xl sm:text-2xl text-purple-600 transition-all duration-500 animate-number-change motion-reduce:animate-none">
                      {tokenData?.premium_tokens || 0}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Premium</div>
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className="text-sm bg-white/90 backdrop-blur-sm border-purple-200 px-3 sm:px-4 py-1 sm:py-2 transition-all duration-300 hover:scale-105 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  tabIndex={0}
                  aria-label={`Lifetime tokens earned: ${tokenData?.lifetime_earned || 0}`}
                >
                  {tokenData?.lifetime_earned || 0} Total Earned
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HP Status Alert */}
      <HPStatusAlert
        hpPercentage={hpPercentage}
        currentHP={hpData?.current_hp || 0}
        maxHP={hpData?.max_hp || 100}
        onOpenRecoveryCenter={handleOpenWellbeingCenter}
        onQuickRestore={handleQuickRestore}
        className="animate-fade-in motion-reduce:animate-none"
      />
    </div>
  );
}
