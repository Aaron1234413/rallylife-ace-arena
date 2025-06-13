
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { useReadyPlayerMe } from '@/hooks/useReadyPlayerMe';
import { ReadyPlayerMeAvatar } from './ReadyPlayerMeAvatar';

interface PlayerAvatarDisplayProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PlayerAvatarDisplay({ 
  size = 'md', 
  className = ''
}: PlayerAvatarDisplayProps) {
  const { avatarUrl, loading } = useReadyPlayerMe();

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-tennis-green-light animate-pulse ${className}`} />
    );
  }

  // If we have a Ready Player Me avatar, use that
  if (avatarUrl) {
    return (
      <div className={`relative ${className}`}>
        <ReadyPlayerMeAvatar 
          avatarUrl={avatarUrl}
          size={size}
        />

        {/* Player indicator */}
        <div className="absolute -top-1 -right-1">
          <Badge variant="secondary" className="text-xs bg-tennis-green-light text-white">
            PLAYER
          </Badge>
        </div>
      </div>
    );
  }

  // Fallback to default avatar
  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-tennis-green-light bg-gray-100 flex items-center justify-center`}>
        <User className="h-6 w-6 text-gray-500" />
      </div>

      {/* Player indicator */}
      <div className="absolute -top-1 -right-1">
        <Badge variant="secondary" className="text-xs bg-tennis-green-light text-white">
          PLAYER
        </Badge>
      </div>
    </div>
  );
}
