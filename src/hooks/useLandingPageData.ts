
import { useLandingData } from './useLandingData';
import { useGlobalActivity } from './useGlobalActivity';
import { useLiveNotifications } from './useLiveNotifications';
import { useMemo } from 'react';

export function useLandingPageData() {
  const landingData = useLandingData();
  const globalActivity = useGlobalActivity();
  const notifications = useLiveNotifications();

  console.log('useLandingPageData hook called:', {
    landingDataLoading: landingData.loading,
    globalActivityLoading: globalActivity.loading,
    statsExists: !!landingData.stats,
    recentActivityCount: landingData.recentActivity?.length,
    achievementsCount: landingData.liveAchievements?.length,
    activityLocationsCount: globalActivity.activityLocations?.length
  });

  // Memoize the return object to prevent unnecessary re-renders
  const memoizedData = useMemo(() => ({
    // Live stats and counters
    stats: landingData.stats,
    recentActivity: landingData.recentActivity || [],
    liveAchievements: landingData.liveAchievements || [],
    
    // Global activity map data
    activityLocations: globalActivity.activityLocations || [],
    
    // Live notifications
    currentNotification: notifications.currentNotification,
    pendingNotifications: notifications.pendingCount,
    
    // Loading states
    loading: landingData.loading || globalActivity.loading,
    
    // Refresh function
    refreshAll: landingData.refreshData
  }), [
    landingData.stats,
    landingData.recentActivity,
    landingData.liveAchievements,
    landingData.loading,
    landingData.refreshData,
    globalActivity.activityLocations,
    globalActivity.loading,
    notifications.currentNotification,
    notifications.pendingCount
  ]);

  return memoizedData;
}
