
import React, { useEffect, useRef } from 'react';

interface ReadyPlayerMeAvatarProps {
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animations?: boolean;
  onAvatarChange?: (avatarUrl: string) => void;
}

export function ReadyPlayerMeAvatar({ 
  avatarUrl, 
  size = 'md', 
  className = '',
  animations = false,
  onAvatarChange 
}: ReadyPlayerMeAvatarProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.source !== 'readyplayerme') return;
      
      // Handle avatar selection
      if (event.data.eventName === 'v1.avatar.exported') {
        const newAvatarUrl = event.data.data.url;
        console.log('New avatar created:', newAvatarUrl);
        onAvatarChange?.(newAvatarUrl);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAvatarChange]);

  // If we have an avatar URL, display the avatar
  if (avatarUrl) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <iframe
          ref={iframeRef}
          src={`https://models.readyplayer.me/${avatarUrl}?morphTargets=ARKit,Oculus Visemes&textureAtlas=1024&lod=0`}
          className="w-full h-full rounded-full border-2 border-tennis-green-light"
          allow="camera *; microphone *"
          title="Ready Player Me Avatar"
        />
      </div>
    );
  }

  // Avatar creation interface
  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <iframe
        ref={iframeRef}
        src="https://vibe.readyplayer.me/avatar?frameApi"
        className="w-full h-full rounded-lg border-2 border-tennis-green-light"
        allow="camera *; microphone *"
        title="Create Ready Player Me Avatar"
      />
    </div>
  );
}
