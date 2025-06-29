
import React from 'react';

interface WelcomeBannerProps {
  profile?: any;
  hpData?: any;
  xpData?: any;
  tokenData?: any;
  equippedItems?: any[];
  onSignOut?: () => Promise<void>;
}

export function WelcomeBanner({ 
  profile, 
  hpData, 
  xpData, 
  tokenData, 
  equippedItems, 
  onSignOut 
}: WelcomeBannerProps) {
  return (
    <div className="relative text-center mb-6 p-6 rounded-2xl bg-gradient-to-br from-tennis-green-bg/30 via-white/80 to-tennis-green-subtle/20 backdrop-blur-sm border border-tennis-green-light/20 shadow-lg">
      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-tennis-green-primary/5 to-transparent animate-shimmer pointer-events-none rounded-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 bg-tennis-green-primary rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-2 h-2 bg-tennis-green-primary rounded-full animate-ping opacity-30"></div>
            </div>
            <span className="text-xs text-tennis-green-medium font-medium tracking-wider uppercase">System Online</span>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-tennis-green-dark mb-2 transition-all duration-300 hover:text-tennis-green-medium">
          Welcome back to <span className="font-orbitron text-tennis-green-primary">Rako</span>! 🎾
        </h1>
        <p className="text-muted-foreground text-base">
          Track your progress, connect with players, and level up your game
        </p>
      </div>
    </div>
  );
}
