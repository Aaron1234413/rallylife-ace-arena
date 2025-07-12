import { useCallback, useEffect } from 'react';
import { useUnifiedSessions } from './useUnifiedSessions';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useSessionSubscriptionManager } from './useSessionSubscriptionManager';

interface UseStandardSessionFetchOptions {
  clubId?: string;
  includeNonClubSessions?: boolean;
  filterUserParticipation?: boolean;
  filterUserSessions?: boolean;
  enableRealTime?: boolean;
}

/**
 * Standardized session fetching hook with consistent error handling and data structure
 */
export function useStandardSessionFetch(options: UseStandardSessionFetchOptions = {}) {
  const { user } = useAuth();
  const {
    clubId,
    includeNonClubSessions = true,
    filterUserParticipation = false,
    filterUserSessions = false,
    enableRealTime = true
  } = options;

  const { 
    sessions, 
    loading, 
    joining,
    createSession,
    joinSession,
    leaveSession,
    getSessionParticipants,
    startSession,
    completeSession,
    cancelSession,
    refreshSessions,
    validateStatusTransition,
    checkAutoTriggers,
    executeSessionAction,
    sessionStateMachine
  } = useUnifiedSessions({
    clubId,
    includeNonClubSessions,
    filterUserSessions
  });

  // Enhanced error handling with toast notifications
  const handleError = useCallback((error: any, context: string) => {
    console.error(`Session fetch error in ${context}:`, error);
    
    let errorMessage = 'Failed to load sessions';
    
    if (error?.message?.includes('Failed to fetch')) {
      errorMessage = 'Network error - please check your connection';
    } else if (error?.message?.includes('permission')) {
      errorMessage = 'You don\'t have permission to view these sessions';
    } else if (error?.message?.includes('timeout')) {
      errorMessage = 'Request timed out - please try again';
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage, {
      duration: 5000,
      action: {
        label: 'Retry',
        onClick: () => refreshSessions()
      }
    });
  }, [refreshSessions]);

  // Enhanced refresh function with error handling
  const safeRefreshSessions = useCallback(async () => {
    try {
      await refreshSessions();
    } catch (error) {
      handleError(error, 'refresh');
    }
  }, [refreshSessions, handleError]);

  // Enhanced join session with error handling
  const safeJoinSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const result = await joinSession(sessionId);
      if (result) {
        toast.success('Successfully joined session!');
      }
      return result;
    } catch (error) {
      handleError(error, 'join session');
      return false;
    }
  }, [joinSession, handleError]);

  // Enhanced leave session with error handling
  const safeLeaveSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const result = await leaveSession(sessionId);
      if (result) {
        toast.success('Successfully left session');
      }
      return result;
    } catch (error) {
      handleError(error, 'leave session');
      return false;
    }
  }, [leaveSession, handleError]);

  // Enhanced create session with error handling
  const safeCreateSession = useCallback(async (sessionData: any) => {
    try {
      const result = await createSession(sessionData);
      if (result) {
        toast.success('Session created successfully!');
      }
      return result;
    } catch (error) {
      handleError(error, 'create session');
      return null;
    }
  }, [createSession, handleError]);

  // Enhanced cancel session with error handling
  const safeCancelSession = useCallback(async (sessionId: string, reason?: string): Promise<boolean> => {
    try {
      const result = await cancelSession(sessionId, reason);
      if (result) {
        toast.success('Session cancelled successfully');
      }
      return result;
    } catch (error) {
      handleError(error, 'cancel session');
      return false;
    }
  }, [cancelSession, handleError]);

  // Enhanced real-time session updates with conflict resolution
  const { isConnected, connectionStatus, isHealthy } = useSessionSubscriptionManager({
    enableAutoRefresh: true,
    autoRefreshCallback: refreshSessions
  });

  // Data processing and filtering
  const processedSessions = sessions || [];
  
  // Separate sessions by user relationship - using proper session properties
  const availableSessions = processedSessions.filter(s => !s.user_has_joined);
  const mySessions = processedSessions.filter(s => s.user_has_joined || s.creator_id === user?.id);
  const createdSessions = processedSessions.filter(s => s.creator_id === user?.id);
  const joinedSessions = processedSessions.filter(s => s.user_has_joined && s.creator_id !== user?.id);

  return {
    // Core data
    sessions: processedSessions,
    availableSessions,
    mySessions,
    createdSessions,
    joinedSessions,
    
    // Loading states
    loading,
    joining,
    
    // Safe action methods with error handling
    refreshSessions: safeRefreshSessions,
    joinSession: safeJoinSession,
    leaveSession: safeLeaveSession,
    createSession: safeCreateSession,
    cancelSession: safeCancelSession,
    
    // Additional utilities
    getSessionParticipants,
    startSession,
    completeSession,
    executeSessionAction,
    validateStatusTransition,
    checkAutoTriggers,
    sessionStateMachine,
    
    // Meta information
    sessionCount: processedSessions.length,
    availableCount: availableSessions.length,
    mySessionCount: mySessions.length,
    
    // Configuration info
    config: {
      clubId,
      includeNonClubSessions,
      filterUserSessions,
      enableRealTime
    },
    
    // Real-time connection status
    isRealTimeConnected: isConnected,
    realTimeStatus: connectionStatus,
    isRealTimeHealthy: isHealthy
  };
}