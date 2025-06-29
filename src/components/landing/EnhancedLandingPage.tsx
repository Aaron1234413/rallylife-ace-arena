
import React from 'react';
import { GlobalActivityMap } from './GlobalActivityMap';
import { LiveLocationTracker } from './LiveLocationTracker';
import { LiveStatsCounter } from './LiveStatsCounter';
import { LiveActivityFeed } from './LiveActivityFeed';
import { LiveAchievements } from './LiveAchievements';
import { AchievementNotification } from './AchievementNotification';
import { CRTMonitor } from './CRTMonitor';

interface EnhancedLandingPageProps {
  className?: string;
}

export function EnhancedLandingPage({ className }: EnhancedLandingPageProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Achievement notifications overlay */}
      <AchievementNotification />

      {/* Live Stats Section */}
      <CRTMonitor title="LIVE STATISTICS" size="large">
        <div className="p-6">
          <LiveStatsCounter />
        </div>
      </CRTMonitor>

      {/* Interactive Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CRTMonitor title="GLOBAL ACTIVITY MAP" size="medium">
          <div className="p-4">
            <GlobalActivityMap />
          </div>
        </CRTMonitor>
        
        <CRTMonitor title="LIVE LOCATION TRACKER" size="medium">
          <div className="p-4">
            <LiveLocationTracker />
          </div>
        </CRTMonitor>
      </div>

      {/* Activity & Achievements Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CRTMonitor title="LIVE ACTIVITY FEED" size="medium">
          <div className="p-4">
            <LiveActivityFeed maxItems={8} />
          </div>
        </CRTMonitor>
        
        <CRTMonitor title="RECENT ACHIEVEMENTS" size="medium">
          <div className="p-4">
            <LiveAchievements />
          </div>
        </CRTMonitor>
      </div>

      {/* Network Status */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 border border-tennis-green-primary/30 rounded">
          <div className="w-2 h-2 bg-tennis-green-primary rounded-full animate-pulse"></div>
          <span className="text-tennis-green-light text-sm font-orbitron tracking-wider uppercase">
            Live Network Status: Online
          </span>
        </div>
      </div>
    </div>
  );
}
