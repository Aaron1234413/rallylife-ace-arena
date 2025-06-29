
import React from 'react';
import { useLandingPageData } from '@/hooks/useLandingPageData';

interface LiveStatsCounterProps {
  className?: string;
}

export function LiveStatsCounter({ className }: LiveStatsCounterProps) {
  const { stats, loading } = useLandingPageData();

  if (loading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-black/40 border border-tennis-green-primary/30 rounded p-4 animate-pulse">
            <div className="h-8 bg-tennis-green-primary/20 rounded mb-2"></div>
            <div className="h-4 bg-tennis-green-primary/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const counters = [
    {
      label: 'Matches Today',
      value: stats.matches_today,
      icon: '🎾',
      color: 'text-tennis-green-primary'
    },
    {
      label: 'Active Players',
      value: stats.active_players,
      icon: '👥',
      color: 'text-tennis-yellow'
    },
    {
      label: 'XP Distributed',
      value: stats.total_xp_distributed,
      icon: '⚡',
      color: 'text-tennis-green-accent'
    },
    {
      label: 'Achievements Today',
      value: stats.achievements_unlocked_today,
      icon: '🏆',
      color: 'text-yellow-400'
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {counters.map((counter, index) => (
        <div 
          key={counter.label} 
          className="bg-black/40 border border-tennis-green-primary/30 rounded p-4 hover:border-tennis-green-primary/60 transition-all duration-300 hover:bg-black/60"
        >
          <div className="text-center">
            <div className="text-2xl mb-2">{counter.icon}</div>
            <div className={`text-2xl font-orbitron font-bold mb-1 ${counter.color} transition-all duration-500`}>
              {counter.value.toLocaleString()}
            </div>
            <div className="text-xs text-tennis-green-light uppercase tracking-wider">
              {counter.label}
            </div>
            <div className="mt-2 flex justify-center">
              <div className={`w-8 h-1 ${counter.color.replace('text-', 'bg-')} animate-pulse rounded`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
