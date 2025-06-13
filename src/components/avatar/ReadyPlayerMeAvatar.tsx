
import React, { useEffect, useRef } from 'react';

interface ReadyPlayerMeAvatarProps {
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onAvatarChange?: (avatarUrl: string) => void;
}

export function ReadyPlayerMeAvatar({ 
  avatarUrl, 
  size = 'md', 
  className = '',
  onAvatarChange 
}: ReadyPlayerMeAvatarProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-96 h-96'
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from Ready Player Me
      if (event.origin !== 'https://demo.readyplayer.me') return;
      
      const { eventName, data } = event.data;
      
      // Handle avatar creation completion
      if (eventName === 'v1.avatar.exported' && data?.url) {
        console.log('Avatar exported from Ready Player Me:', data.url);
        onAvatarChange?.(data.url);
      }

      // Handle frame ready event
      if (eventName === 'v1.frame.ready') {
        console.log('Ready Player Me frame is ready');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAvatarChange]);

  // If we have an avatar URL and no change handler, display the avatar
  if (avatarUrl && !onAvatarChange) {
    // For displaying existing avatars, we show a preview
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-lg border-2 border-tennis-green-light bg-gray-100 flex items-center justify-center overflow-hidden`}>
        <iframe
          src={`https://models.readyplayer.me/${avatarUrl.split('/').pop()?.replace('.glb', '')}.html`}
          className="w-full h-full border-0"
          title="Ready Player Me Avatar Preview"
        />
      </div>
    );
  }

  // Avatar creation interface
  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <iframe
        ref={iframeRef}
        src="https://demo.readyplayer.me/avatar?frameApi"
        className="w-full h-full rounded-lg border-2 border-tennis-green-light"
        allow="camera *; microphone *"
        title="Create Ready Player Me Avatar"
      />
    </div>
  );
}
