
import React from 'react';
import { useLandingPageData } from '@/hooks/useLandingPageData';
import { formatDistanceToNow } from 'date-fns';

interface LiveAchievementsProps {
  className?: string;
}

export function LiveAchievements({ className }: LiveAchievementsProps) {
  const { liveAchievements, loading } = useLandingPageData();

  console.log('LiveAchievements render:', { loading, achievementsCount: liveAchievements?.length });

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-black/20 rounded animate-pulse">
            <div className="w-8 h-8 bg-yellow-400/30 rounded-full" />
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-tennis-green-primary/20 rounded w-3/4" />
              <div className="h-3 bg-tennis-green-primary/10 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!liveAchievements || liveAchievements.length === 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="text-lg animate-bounce">🏆</div>
          <span className="text-tennis-green-primary font-orbitron text-sm uppercase tracking-wider">
            Recent Achievements
          </span>
        </div>
        <div className="text-center text-tennis-green-light/60 py-8">
          <div className="text-lg mb-2">🏆</div>
          <div className="text-sm">No recent achievements</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="text-lg animate-bounce">🏆</div>
        <span className="text-tennis-green-primary font-orbitron text-sm uppercase tracking-wider">
          Recent Achievements
        </span>
      </div>

      <div className="space-y-2">
        {liveAchievements.map((achievement, index) => (
          <div 
            key={achievement.id}
            className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 border border-yellow-400/30 rounded hover:from-yellow-600/30 hover:to-yellow-800/30 transition-all duration-300"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="text-2xl animate-pulse">🏆</div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-yellow-300 text-sm mb-1">
                {achievement.player_name}
              </div>
              <div className="text-yellow-200 text-xs font-orbitron font-bold mb-1">
                {achievement.achievement_name}
              </div>
              <div className="text-yellow-200/70 text-xs mb-2">
                {achievement.achievement_description}
              </div>
              <div className="text-xs text-yellow-200/50">
                {formatDistanceToNow(new Date(achievement.timestamp), { addSuffix: true })}
              </div>
            </div>
            
            <div className="text-yellow-400 animate-pulse">
              ✨
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
