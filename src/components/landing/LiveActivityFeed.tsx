
import React from 'react';
import { useLandingPageData } from '@/hooks/useLandingPageData';
import { ActivityPulse } from './ActivityPulse';
import { formatDistanceToNow } from 'date-fns';

interface LiveActivityFeedProps {
  className?: string;
  maxItems?: number;
}

export function LiveActivityFeed({ className, maxItems = 6 }: LiveActivityFeedProps) {
  const { recentActivity, loading } = useLandingPageData();

  console.log('LiveActivityFeed render:', { loading, activityCount: recentActivity?.length });

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: maxItems }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-black/20 rounded animate-pulse">
            <div className="w-4 h-4 bg-tennis-green-primary/30 rounded-full" />
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-tennis-green-primary/20 rounded w-3/4" />
              <div className="h-3 bg-tennis-green-primary/10 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!recentActivity || recentActivity.length === 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <ActivityPulse size="small" />
          <span className="text-tennis-green-primary font-orbitron text-sm uppercase tracking-wider">
            Live Activity Feed
          </span>
        </div>
        <div className="text-center text-tennis-green-light/60 py-8">
          <div className="text-lg mb-2">⚡</div>
          <div className="text-sm">No recent activity</div>
        </div>
      </div>
    );
  }

  const displayedActivity = recentActivity.slice(0, maxItems);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <ActivityPulse size="small" />
        <span className="text-tennis-green-primary font-orbitron text-sm uppercase tracking-wider">
          Live Activity Feed
        </span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-tennis-green-primary/30">
        {displayedActivity.map((activity, index) => (
          <div 
            key={activity.id} 
            className="flex items-start gap-3 p-2 bg-black/20 border border-tennis-green-primary/20 rounded hover:bg-black/30 transition-all duration-200"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ActivityPulse size="small" className="mt-1 flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-tennis-green-light text-sm truncate">
                  {activity.player_name}
                </span>
                {activity.location && (
                  <span className="text-xs text-tennis-green-light/60">
                    📍 {activity.location}
                  </span>
                )}
              </div>
              
              <p className="text-tennis-green-light/80 text-xs mb-1">
                {activity.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-tennis-green-light/50">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </span>
                {activity.xp_earned && (
                  <span className="text-xs text-tennis-yellow">
                    +{activity.xp_earned} XP  
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
