
import React, { useState } from 'react';
import { User, AlertCircle } from 'lucide-react';

interface RPMDisplayProps {
  avatarId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackIcon?: React.ReactNode;
  userType?: 'player' | 'coach';
}

export function RPMDisplay({ 
  avatarId, 
  size = 'md', 
  className = '',
  fallbackIcon,
  userType = 'player'
}: RPMDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  const borderColor = userType === 'coach' 
    ? 'border-tennis-green-dark' 
    : 'border-tennis-green-light';

  // Build model viewer URL
  const buildModelUrl = (id: string) => {
    const params = new URLSearchParams({
      morphTargets: 'ARKit,Oculus Visemes',
      textureAtlas: '1024',
      lod: '0'
    });
    
    return `https://models.readyplayer.me/${id}?${params.toString()}`;
  };

  // If no avatar ID, show fallback
  if (!avatarId) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-100 flex items-center justify-center border-2 ${borderColor} ${className}`}>
        {fallbackIcon || <User className="h-6 w-6 text-gray-500" />}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      {/* Loading state */}
      {isLoading && (
        <div className={`${sizeClasses[size]} rounded-full bg-gray-200 animate-pulse border-2 ${borderColor}`} />
      )}
      
      {/* Error state */}
      {hasError && (
        <div className={`${sizeClasses[size]} rounded-full bg-gray-100 flex items-center justify-center border-2 border-red-300`}>
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
      )}
      
      {/* Avatar iframe */}
      {!hasError && (
        <iframe
          src={buildModelUrl(avatarId)}
          className={`${sizeClasses[size]} rounded-full border-2 ${borderColor} ${isLoading ? 'invisible' : 'visible'}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          title="3D Avatar"
        />
      )}
    </div>
  );
}
