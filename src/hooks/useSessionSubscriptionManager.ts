import { useEffect, useCallback } from 'react';
import { useUnifiedRealTimeManager } from './useUnifiedRealTimeManager';
import type { UnifiedSession } from './useUnifiedSessions';

interface UseSessionSubscriptionManagerOptions {
  onSessionUpdate?: (session: UnifiedSession) => void;
  onParticipantUpdate?: (sessionId: string) => void;
  onStatusChange?: (sessionId: string, oldStatus: string, newStatus: string) => void;
  enableAutoRefresh?: boolean;
  autoRefreshCallback?: () => void;
}

/**
 * Simplified hook that wraps the unified real-time manager
 * for session-specific subscriptions with automatic refresh
 */
export function useSessionSubscriptionManager(options: UseSessionSubscriptionManagerOptions = {}) {
  const {
    onSessionUpdate,
    onParticipantUpdate,
    onStatusChange,
    enableAutoRefresh = true,
    autoRefreshCallback
  } = options;

  // Enhanced real-time manager with conflict resolution
  const {
    isConnected,
    connectionStatus,
    conflicts,
    cleanup
  } = useUnifiedRealTimeManager({
    onSessionUpdate: useCallback((session: UnifiedSession) => {
      console.log('Session updated via real-time:', session.id);
      onSessionUpdate?.(session);
      
      // Auto-refresh if enabled
      if (enableAutoRefresh && autoRefreshCallback) {
        autoRefreshCallback();
      }
    }, [onSessionUpdate, enableAutoRefresh, autoRefreshCallback]),

    onParticipantUpdate: useCallback((sessionId: string) => {
      console.log('Participant updated via real-time:', sessionId);
      onParticipantUpdate?.(sessionId);
      
      // Auto-refresh if enabled
      if (enableAutoRefresh && autoRefreshCallback) {
        autoRefreshCallback();
      }
    }, [onParticipantUpdate, enableAutoRefresh, autoRefreshCallback]),

    onStatusChange: useCallback((sessionId: string, oldStatus: string, newStatus: string) => {
      console.log('Status changed via real-time:', sessionId, oldStatus, '->', newStatus);
      onStatusChange?.(sessionId, oldStatus, newStatus);
      
      // Auto-refresh if enabled
      if (enableAutoRefresh && autoRefreshCallback) {
        autoRefreshCallback();
      }
    }, [onStatusChange, enableAutoRefresh, autoRefreshCallback]),

    onConflictResolved: useCallback((resolution) => {
      console.log('Conflict resolved:', resolution);
      
      // Auto-refresh on conflict resolution to ensure consistency
      if (enableAutoRefresh && autoRefreshCallback) {
        autoRefreshCallback();
      }
    }, [enableAutoRefresh, autoRefreshCallback]),

    enableConflictResolution: true,
    subscriptionTimeout: 30000,
    maxRetries: 5
  });

  // Monitor connection health and trigger refresh on reconnection
  useEffect(() => {
    if (connectionStatus.isFullyConnected && enableAutoRefresh && autoRefreshCallback) {
      // Refresh data when connection is fully restored
      console.log('Connection fully restored, refreshing data');
      autoRefreshCallback();
    }
  }, [connectionStatus.isFullyConnected, enableAutoRefresh, autoRefreshCallback]);

  return {
    // Connection status
    isConnected,
    connectionStatus,
    
    // Conflict information
    recentConflicts: conflicts.slice(-5), // Last 5 conflicts
    hasRecentConflicts: conflicts.length > 0,
    
    // Manual cleanup
    cleanup,
    
    // Health indicators
    isHealthy: connectionStatus.isFullyConnected && !connectionStatus.hasErrors,
    lastConflict: conflicts[conflicts.length - 1]
  };
}