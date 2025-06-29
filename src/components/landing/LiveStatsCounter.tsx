
import React, { useEffect, useState } from 'react';
import { useLandingPageData } from '@/hooks/useLandingPageData';

interface LiveStatsCounterProps {
  className?: string;
}

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

function AnimatedCounter({ value, duration = 1000, className }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const startValue = displayValue;
    const difference = value - startValue;
    const steps = Math.abs(difference);
    const stepTime = duration / Math.max(steps, 20);
    
    if (difference === 0) return;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / Math.max(steps, 20);
      const easedProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const currentValue = Math.round(startValue + (difference * easedProgress));
      
      setDisplayValue(currentValue);
      
      if (currentStep >= Math.max(steps, 20)) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration, displayValue]);

  return (
    <span className={className}>
      {displayValue.toLocaleString()}
    </span>
  );
}

export function LiveStatsCounter({ className }: LiveStatsCounterProps) {
  const { stats, loading } = useLandingPageData();

  if (loading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-tennis-green-subtle/20 border border-tennis-green-medium/30 rounded p-4 animate-pulse">
            <div className="h-8 bg-tennis-green-medium/20 rounded mb-2"></div>
            <div className="h-4 bg-tennis-green-medium/10 rounded"></div>
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
      color: 'text-tennis-green-dark',
      bgColor: 'bg-tennis-green-primary/10'
    },
    {
      label: 'Active Players',
      value: stats.active_players,
      icon: '👥',
      color: 'text-tennis-yellow',
      bgColor: 'bg-tennis-yellow/10'
    },
    {
      label: 'XP Distributed',
      value: stats.total_xp_distributed,
      icon: '⚡',
      color: 'text-tennis-green-dark',
      bgColor: 'bg-tennis-green-accent/10'
    },
    {
      label: 'Achievements Today',
      value: stats.achievements_unlocked_today,
      icon: '🏆',
      color: 'text-tennis-yellow',
      bgColor: 'bg-tennis-yellow/10'
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {counters.map((counter, index) => (
        <div 
          key={counter.label} 
          className={`
            bg-tennis-green-subtle/20 border border-tennis-green-medium/30 rounded p-4 
            hover:border-tennis-green-primary/60 transition-all duration-300 
            hover:bg-tennis-green-subtle/30 hover:scale-105 transform
            ${counter.bgColor}
          `}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="text-center">
            <div className="text-2xl mb-2 animate-bounce" style={{ animationDelay: `${index * 200}ms` }}>
              {counter.icon}
            </div>
            <div className={`text-2xl font-orbitron font-bold mb-1 ${counter.color} transition-all duration-500`}>
              <AnimatedCounter value={counter.value} />
            </div>
            <div className="text-xs text-tennis-green-medium uppercase tracking-wider font-bold">
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
