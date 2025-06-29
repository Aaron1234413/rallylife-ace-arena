
import React from 'react';
import { useLandingPageData } from '@/hooks/useLandingPageData';

interface ActivityPulseProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export function ActivityPulse({ className, size = 'medium' }: ActivityPulseProps) {
  const { recentActivity, loading } = useLandingPageData();

  const sizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4', 
    large: 'w-6 h-6'
  };

  const pulseIntensity = recentActivity.length > 5 ? 'high' : recentActivity.length > 2 ? 'medium' : 'low';

  const getPulseAnimation = () => {
    switch (pulseIntensity) {
      case 'high': return 'animate-[pulse_1s_ease-in-out_infinite]';
      case 'medium': return 'animate-[pulse_1.5s_ease-in-out_infinite]';
      case 'low': return 'animate-[pulse_2s_ease-in-out_infinite]';
      default: return 'animate-pulse';
    }
  };

  const getPulseColor = () => {
    switch (pulseIntensity) {
      case 'high': return 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]';
      case 'medium': return 'bg-tennis-yellow shadow-[0_0_15px_rgba(255,255,155,0.6)]';
      case 'low': return 'bg-tennis-green-primary shadow-[0_0_10px_rgba(155,255,155,0.4)]';
      default: return 'bg-tennis-green-primary';
    }
  };

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-600 rounded-full animate-pulse ${className}`} />
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className={`
        ${sizeClasses[size]} 
        ${getPulseColor()}
        rounded-full 
        ${getPulseAnimation()}
      `} />
      
      {/* Outer pulse ring */}
      <div className={`
        absolute inset-0 
        ${sizeClasses[size]} 
        border-2 border-current rounded-full 
        ${getPulseAnimation()}
        opacity-30
      `} style={{ 
        color: pulseIntensity === 'high' ? '#ef4444' : 
               pulseIntensity === 'medium' ? '#ffff9b' : '#9bff9b'
      }} />
    </div>
  );
}
