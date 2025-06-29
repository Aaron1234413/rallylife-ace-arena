
import React from 'react';
import { useLandingPageData } from '@/hooks/useLandingPageData';

export function AchievementNotification() {
  const { currentNotification } = useLandingPageData();

  if (!currentNotification) return null;

  const getIcon = () => {
    switch (currentNotification.type) {
      case 'achievement': return '🏆';
      case 'level_up': return '⬆️';
      case 'match_win': return '🎾';
      case 'milestone': return '🎯';
      default: return '✨';
    }
  };

  const getBackgroundColor = () => {
    switch (currentNotification.type) {
      case 'achievement': return 'from-yellow-600/90 to-yellow-800/90';
      case 'level_up': return 'from-blue-600/90 to-blue-800/90';
      case 'match_win': return 'from-green-600/90 to-green-800/90';
      case 'milestone': return 'from-purple-600/90 to-purple-800/90';
      default: return 'from-tennis-green-primary/90 to-tennis-green-accent/90';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`
        bg-gradient-to-r ${getBackgroundColor()} 
        border border-white/20 rounded-lg p-4 max-w-sm
        shadow-2xl backdrop-blur-sm
        animate-scale-in
      `}>
        <div className="flex items-start gap-3">
          <div className="text-2xl animate-bounce">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-orbitron font-bold text-white text-sm mb-1">
              {currentNotification.player_name}
            </div>
            <div className="text-white/90 text-xs">
              {currentNotification.message}
            </div>
            {currentNotification.details && (
              <div className="text-white/70 text-xs mt-1">
                {currentNotification.details.level && `Level ${currentNotification.details.level}`}
                {currentNotification.details.xp_earned && ` • +${currentNotification.details.xp_earned} XP`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
