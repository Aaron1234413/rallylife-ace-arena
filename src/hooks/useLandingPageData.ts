
import { useLandingData } from './useLandingData';
import { useGlobalActivity } from './useGlobalActivity';
import { useLiveNotifications } from './useLiveNotifications';

export function useLandingPageData() {
  const landingData = useLandingData();
  const globalActivity = useGlobalActivity();
  const notifications = useLiveNotifications();

  return {
    // Live stats and counters
    stats: landingData.stats,
    recentActivity: landingData.recentActivity,
    liveAchievements: landingData.liveAchievements,
    
    // Global activity map data
    activityLocations: globalActivity.activityLocations,
    
    // Live notifications
    currentNotification: notifications.currentNotification,
    pendingNotifications: notifications.pendingCount,
    
    // Loading states
    loading: landingData.loading || globalActivity.loading,
    
    // Refresh function
    refreshAll: landingData.refreshData
  };
}
