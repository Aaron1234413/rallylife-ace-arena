import { useSessionManager } from './useSessionManager';

/**
 * Hook for getting user's sessions across all types
 */
export function useMySessionsUnified() {
  return useSessionManager({
    sessionType: 'all',
    includeNonClubSessions: true,
    filterUserParticipation: true
  });
}

/**
 * Hook for getting sessions created by the user
 */
export function useMyCreatedSessions() {
  return useSessionManager({
    sessionType: 'all',
    includeNonClubSessions: true,
    filterUserSessions: true
  });
}