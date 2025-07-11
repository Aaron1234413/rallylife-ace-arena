import { useUnifiedSessions } from './useUnifiedSessions';

/**
 * Hook for managing training sessions
 * Uses unified sessions system which supports coordinate data
 */
export function useTrainingSessions() {
  return useUnifiedSessions({
    includeNonClubSessions: true
  });
}