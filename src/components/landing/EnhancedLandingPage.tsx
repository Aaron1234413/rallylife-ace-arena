
import React, { memo } from 'react';
import { LiveStatsCounter } from './LiveStatsCounter';
import { LiveAchievements } from './LiveAchievements';
import { AchievementNotification } from './AchievementNotification';
import { CRTMonitor } from './CRTMonitor';

interface EnhancedLandingPageProps {
  className?: string;
}

export const EnhancedLandingPage = memo(function EnhancedLandingPage({ className }: EnhancedLandingPageProps) {
  return (
    <div className={`space-y-8 md:space-y-12 ${className}`}>
      {/* Achievement notifications overlay */}
      <AchievementNotification />

      {/* Live Stats Section with enhanced contrast - Mobile Optimized */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <CRTMonitor title="RAKO LIVE STATISTICS" size="large">
          <div className="p-3 md:p-6 bg-white/95 backdrop-blur-sm rounded">
            <LiveStatsCounter />
          </div>
        </CRTMonitor>
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
    </div>
  );
});
