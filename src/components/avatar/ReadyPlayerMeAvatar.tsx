
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
      
      console.log('Ready Player Me event:', event.data);

      // Handle avatar export - this is the key event from the guide
      if (event.data.eventName === 'v1.avatar.exported') {
        const avatarUrl = event.data.data.url;
        console.log('Avatar exported:', avatarUrl);
        
        // Extract avatar ID from the URL for storage
        const avatarId = avatarUrl.split('/').pop()?.replace('.glb', '');
        if (avatarId && onAvatarChange) {
          onAvatarChange(avatarId);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAvatarChange]);

  // If we have an avatar URL, display it using Ready Player Me's web viewer
  if (avatarUrl) {
    // Use the full avatar ID to create the proper display URL
    const displayUrl = avatarUrl.includes('http') 
      ? avatarUrl 
      : `https://models.readyplayer.me/${avatarUrl}?morphTargets=ARKit,Oculus%20Visemes&textureAtlas=1024&lod=1`;

    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <iframe
          ref={iframeRef}
          src={displayUrl}
          className="w-full h-full rounded-full border-2 border-tennis-green-light"
          allow="camera *; microphone *"
          title="Ready Player Me Avatar"
        />
      </div>
    );
  }

  // Avatar creation interface - following the guide's iframe approach
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
