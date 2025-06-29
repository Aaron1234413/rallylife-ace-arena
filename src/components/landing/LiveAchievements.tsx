
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
          <div key={i} className="flex items-center gap-3 p-3 bg-tennis-green-subtle/20 rounded animate-pulse">
            <div className="w-8 h-8 bg-tennis-yellow/30 rounded-full" />
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-tennis-green-medium/30 rounded w-3/4" />
              <div className="h-3 bg-tennis-green-medium/20 rounded w-1/2" />
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
          <span className="text-tennis-green-dark font-orbitron text-sm uppercase tracking-wider font-bold">
            Recent Achievements
          </span>
        </div>
        <div className="text-center text-tennis-green-medium py-8">
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
        <span className="text-tennis-green-dark font-orbitron text-sm uppercase tracking-wider font-bold">
          Recent Achievements
        </span>
      </div>

      <div className="space-y-2">
        {liveAchievements.map((achievement, index) => (
          <div 
            key={achievement.id}
            className="flex items-center gap-3 p-3 bg-gradient-to-r from-tennis-yellow/20 to-tennis-yellow/10 border border-tennis-yellow/40 rounded hover:from-tennis-yellow/30 hover:to-tennis-yellow/20 transition-all duration-300"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="text-2xl animate-pulse">🏆</div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-tennis-green-dark text-sm mb-1 font-bold">
                {achievement.player_name}
              </div>
              <div className="text-tennis-green-dark text-xs font-orbitron font-bold mb-1">
                {achievement.achievement_name}
              </div>
              <div className="text-tennis-green-medium text-xs mb-2">
                {achievement.achievement_description}
              </div>
              <div className="text-xs text-tennis-green-medium/70">
                {formatDistanceToNow(new Date(achievement.timestamp), { addSuffix: true })}
              </div>
            </div>
            
            <div className="text-tennis-yellow animate-pulse">
              ✨
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
