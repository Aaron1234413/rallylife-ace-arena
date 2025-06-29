
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

  const getBorderColor = () => {
    switch (currentNotification.type) {
      case 'achievement': return 'border-yellow-400/50';
      case 'level_up': return 'border-blue-400/50';
      case 'match_win': return 'border-green-400/50';
      case 'milestone': return 'border-purple-400/50';
      default: return 'border-tennis-green-primary/50';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in-scale">
      <div className={`
        bg-gradient-to-r ${getBackgroundColor()} 
        border ${getBorderColor()} rounded-lg p-4 max-w-sm
        shadow-2xl backdrop-blur-sm
        animate-slide-in-right
        hover:scale-105 transition-transform duration-300
      `}>
        <div className="flex items-start gap-3">
          <div className="text-2xl animate-bounce">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-orbitron font-bold text-white text-sm mb-1 tracking-wider">
              {currentNotification.player_name}
            </div>
            <div className="text-white/90 text-xs leading-relaxed">
              {currentNotification.message}
            </div>
            {currentNotification.details && (
              <div className="text-white/70 text-xs mt-2 flex items-center gap-2">
                {currentNotification.details.level && (
                  <span className="bg-white/20 px-2 py-1 rounded font-orbitron text-xs">
                    Level {currentNotification.details.level}
                  </span>
                )}
                {currentNotification.details.xp_earned && (
                  <span className="bg-white/20 px-2 py-1 rounded font-orbitron text-xs">
                    +{currentNotification.details.xp_earned} XP
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="text-white/60 text-xs animate-pulse">
            ✨
          </div>
        </div>
        
        {/* Progress bar for notification timeout */}
        <div className="mt-3 w-full bg-white/20 rounded-full h-1 overflow-hidden">
          <div className="h-full bg-white/60 rounded-full animate-[shrink_4s_linear_forwards]" 
               style={{
                 animation: 'shrink 4s linear forwards',
                 transformOrigin: 'left'
               }} />
        </div>
      </div>
    </div>
  );
}
