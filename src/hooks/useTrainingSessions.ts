import { useSessionManager } from './useSessionManager';

/**
 * Hook for managing training sessions
 */
export function useTrainingSessions() {
  return useSessionManager({
    sessionType: 'training',
    includeNonClubSessions: true
  });
}