
import React, { memo } from 'react';
import { GlobalActivityMap } from './GlobalActivityMap';
import { LiveStatsCounter } from './LiveStatsCounter';
import { LiveAchievements } from './LiveAchievements';
import { AchievementNotification } from './AchievementNotification';
import { CRTMonitor } from './CRTMonitor';

interface EnhancedLandingPageProps {
  className?: string;
}

export const EnhancedLandingPage = memo(function EnhancedLandingPage({ className }: EnhancedLandingPageProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Achievement notifications overlay */}
      <AchievementNotification />

      {/* Live Stats Section with enhanced animation */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <CRTMonitor title="LIVE STATISTICS" size="large">
          <div className="p-6">
            <LiveStatsCounter />
          </div>
        </CRTMonitor>
      </div>

      {/* Global Activity Map Section - Single column, centered */}
      <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="w-full max-w-4xl">
          <CRTMonitor title="GLOBAL TENNIS ACTIVITY" size="large">
            <div className="p-6">
              <GlobalActivityMap />
            </div>
          </CRTMonitor>
        </div>
      </div>

      {/* Achievements Section - Centered */}
      <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="w-full max-w-2xl">
          <CRTMonitor title="RECENT ACHIEVEMENTS" size="medium">
            <div className="p-4">
              <LiveAchievements />
            </div>
          </CRTMonitor>
        </div>
      </div>

      {/* Enhanced Network Status with glow effect */}
      <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-tennis-green-bg/40 border border-tennis-green-primary/30 rounded-lg backdrop-blur-sm hover:border-tennis-green-primary/60 transition-all duration-300 animate-glow-pulse">
          <div className="relative">
            <div className="w-3 h-3 bg-tennis-green-primary rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-tennis-green-primary rounded-full animate-ping opacity-30"></div>
          </div>
          <span className="text-tennis-green-light text-sm font-orbitron tracking-wider uppercase">
            Live Network Status: Online
          </span>
          <div className="text-tennis-yellow text-xs animate-float">⚡</div>
        </div>
      </div>
    </div>
  );
});
