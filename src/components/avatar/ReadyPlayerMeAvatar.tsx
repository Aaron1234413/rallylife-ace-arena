
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
      if (event.data?.source !== 'readyplayerme') return;
      
      // Handle avatar selection from Ready Player Me
      if (event.data.eventName === 'v1.avatar.exported' && event.data.data?.url) {
        const newAvatarUrl = event.data.data.url;
        console.log('Avatar exported from Ready Player Me:', newAvatarUrl);
        onAvatarChange?.(newAvatarUrl);
      }

      // Handle frame events
      if (event.data.eventName === 'v1.frame.ready') {
        console.log('Ready Player Me frame is ready');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAvatarChange]);

  // If we have an avatar URL and no change handler, display the avatar
  if (avatarUrl && !onAvatarChange) {
    // For displaying existing avatars, we can use the .glb model directly
    // or render it in a 3D viewer, but for now we'll show a placeholder
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-lg border-2 border-tennis-green-light bg-gray-100 flex items-center justify-center`}>
        <div className="text-center p-2">
          <div className="text-xs text-gray-600 mb-1">3D Avatar</div>
          <div className="text-xs text-tennis-green-dark font-medium">Ready Player Me</div>
        </div>
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
