import { useSessionManager } from './useSessionManager';

/**
 * Hook for managing match sessions
 */
export function useMatchSessions() {
  return useSessionManager({
    sessionType: 'match',
    includeNonClubSessions: true
  });
}