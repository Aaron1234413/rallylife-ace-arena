
import React, { memo } from 'react';
import { LiveStatsCounter } from './LiveStatsCounter';
import { LiveAchievements } from './LiveAchievements';
import { AchievementNotification } from './AchievementNotification';
import { LiveLocationTracker } from './LiveLocationTracker';
import { CRTMonitor } from './CRTMonitor';

interface EnhancedLandingPageProps {
  className?: string;
}

export const EnhancedLandingPage = memo(function EnhancedLandingPage({ className }: EnhancedLandingPageProps) {
  return (
    <div className={`space-y-4 md:space-y-8 ${className}`}>
      {/* Achievement notifications overlay */}
      <AchievementNotification />

      {/* Live Stats Section with enhanced contrast - Mobile Optimized */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <CRTMonitor title="RAKO LIVE STATISTICS" size="large">
          <div className="p-3 md:p-6 bg-white/95 backdrop-blur-sm rounded">
            <LiveStatsCounter />
          </div>
        </CRTMonitor>
      </div>

      {/* Live Activity Locations - Mobile Optimized */}
      <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="w-full max-w-2xl">
          <CRTMonitor title="ACTIVE LOCATIONS" size="medium">
            <div className="p-3 md:p-4 bg-white/95 backdrop-blur-sm rounded">
              <LiveLocationTracker />
            </div>
          </CRTMonitor>
        </div>
      </div>

      {/* Achievements Section - Mobile Optimized */}
      <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="w-full max-w-2xl">
          <CRTMonitor title="RECENT ACHIEVEMENTS" size="medium">
            <div className="p-3 md:p-4 bg-white/95 backdrop-blur-sm rounded">
              <LiveAchievements />
            </div>
          </CRTMonitor>
        </div>
      </div>

      {/* Enhanced Network Status with improved contrast - Mobile Optimized */}
      <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-tennis-green-dark/90 border border-tennis-green-primary/60 rounded-lg backdrop-blur-sm hover:border-tennis-green-primary transition-all duration-300 animate-glow-pulse">
          <div className="relative">
            <div className="w-2 h-2 md:w-3 md:h-3 bg-tennis-green-primary rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-2 h-2 md:w-3 md:h-3 bg-tennis-green-primary rounded-full animate-ping opacity-30"></div>
          </div>
          <span className="text-tennis-green-primary text-xs md:text-sm font-orbitron tracking-wider uppercase font-bold">
            Rako Network: Online
          </span>
          <div className="text-tennis-yellow text-xs animate-float">⚡</div>
        </div>
      </div>
    </div>
  );
});
