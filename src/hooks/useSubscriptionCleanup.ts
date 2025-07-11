import { useEffect } from 'react';
import { subscriptionCoordinator } from '@/services/SubscriptionCoordinator';

export function useSubscriptionCleanup() {
  useEffect(() => {
    // Cleanup function that runs on component unmount or page unload
    const cleanup = () => {
      console.log('Cleaning up all subscriptions...');
      subscriptionCoordinator.clearAll();
    };

    // Add event listeners for page unload scenarios
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);

    return () => {
      // Remove event listeners and clean up subscriptions
      window.removeEventListener('beforeunload', cleanup);
      window.removeEventListener('pagehide', cleanup);
      cleanup();
    };
  }, []);
}