import { useEffect } from 'react';
import { realtimeManager } from '@/services/RealtimeSubscriptionManager';

// Global hook to manage realtime subscription lifecycle
export function useRealtimeManager() {
  useEffect(() => {
    // Initialize the manager
    realtimeManager.initialize();
    
    console.log('🎯 Realtime manager initialized globally');
    
    // Global cleanup on app unmount
    return () => {
      console.log('🧹 Global cleanup of realtime manager');
      realtimeManager.cleanup();
    };
  }, []);

  // Return utility functions for debugging
  return {
    getActiveSubscriptionsCount: () => realtimeManager.getActiveSubscriptionsCount(),
    getSubscriptionInfo: () => realtimeManager.getSubscriptionInfo(),
    cleanup: () => realtimeManager.cleanup()
  };
}