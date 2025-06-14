
import { useCallback, useEffect } from 'react';
import { RPMEventData, RPMMessageHandler } from '@/types/readyPlayerMe';

export function useRPMMessageHandler(handlers: RPMMessageHandler) {
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const { source, eventName, data }: RPMEventData = event.data;
      
      // Only handle Ready Player Me messages
      if (source !== 'readyplayerme') return;
      
      console.log('RPM Event:', { eventName, data });
      
      switch (eventName) {
        case 'v1.frame.ready':
          handlers.onFrameReady?.();
          break;
          
        case 'v1.avatar.exported':
          if (data?.url) {
            // Extract avatar ID from the full URL
            const avatarId = data.url.split('/').pop()?.replace('.glb', '') || '';
            handlers.onAvatarExported?.({
              url: data.url,
              id: avatarId
            });
          }
          break;
          
        case 'v1.user.set':
          handlers.onUserSet?.(data);
          break;
          
        case 'v1.user.updated':
          handlers.onUserSet?.(data);
          break;
          
        default:
          console.log('Unhandled RPM event:', eventName);
      }
    } catch (error) {
      console.error('Error handling RPM message:', error);
      handlers.onError?.('Failed to process avatar creation event');
    }
  }, [handlers]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);
}
