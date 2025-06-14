
import React from 'react';
import { RPMDisplay } from './RPMDisplay';
import { useReadyPlayerMe } from '@/hooks/useReadyPlayerMe';
import { User } from 'lucide-react';

interface RPMProfileDisplayProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  userType?: 'player' | 'coach';
  className?: string;
}

export function RPMProfileDisplay({ 
  size = 'md', 
  userType = 'player',
  className = '' 
}: RPMProfileDisplayProps) {
  const { avatarId, loading } = useReadyPlayerMe();

  if (loading) {
    const sizeClasses = {
      sm: 'w-16 h-16',
      md: 'w-24 h-24',
      lg: 'w-32 h-32',
      xl: 'w-48 h-48'
    };
    
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 animate-pulse border-2 border-tennis-green-light ${className}`} />
    );
  }

  return (
    <RPMDisplay
      avatarId={avatarId}
      size={size}
      userType={userType}
      className={className}
      fallbackIcon={<User className="h-6 w-6 text-gray-500" />}
    />
  );
}
