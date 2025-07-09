import { useMemo } from 'react';
import { useSessionManager } from './useSessionManager';
import { useSocialPlaySessions } from './useSocialPlaySessions';
import { useAuth } from './useAuth';

interface UseUnifiedSocialPlayOptions {
  useUnified?: boolean;
  fallbackToLegacy?: boolean;
  onError?: (error: Error, source: 'unified' | 'legacy') => void;
}

/**
 * Hybrid hook that provides a unified interface for social play sessions
 * Can switch between unified sessions system and legacy social play system
 */
export function useUnifiedSocialPlay(options: UseUnifiedSocialPlayOptions = {}) {
  const { 
    useUnified = true, 
    fallbackToLegacy = true, 
    onError 
  } = options;
  
  const { user } = useAuth();
  
  // Use unified session manager
  const unifiedSessions = useSessionManager({
    sessionType: 'social_play',
    includeNonClubSessions: true,
    filterUserParticipation: useUnified && !!user?.id
  });
  
  // Use legacy social play sessions as fallback
  const legacySessions = useSocialPlaySessions();
  
  // Determine which system to use
  const shouldUseLegacy = useMemo(() => {
    if (!useUnified) return true;
    if (!user?.id) return fallbackToLegacy;
    if (unifiedSessions.error && fallbackToLegacy) return true;
    return false;
  }, [useUnified, user?.id, unifiedSessions.error, fallbackToLegacy]);
  
  // Map unified sessions to legacy format for compatibility
  const mappedUnifiedSessions = useMemo(() => {
    return unifiedSessions.sessions.map(session => ({
      id: session.id,
      created_by: session.creator_id,
      session_type: session.format || 'singles' as 'singles' | 'doubles',
      competitive_level: 'medium' as 'low' | 'medium' | 'high',
      status: 'pending' as 'pending' | 'active' | 'paused' | 'completed' | 'cancelled',
      start_time: null,
      end_time: null,
      paused_duration: 0,
      location: session.location || null,
      notes: session.notes || null,
      mood: null,
      final_score: null,
      created_at: session.created_at,
      updated_at: session.updated_at,
      participants: session.participants?.map(p => ({
        id: p.id,
        session_id: session.id,
        user_id: p.user_id,
        session_creator_id: session.creator_id,
        status: p.status as 'joined' | 'left',
        role: 'participant',
        joined_at: p.joined_at,
        user: {
          id: p.user_id,
          full_name: p.user?.full_name || 'Unknown User',
          avatar_url: p.user?.avatar_url || null
        }
      })) || []
    }));
  }, [unifiedSessions.sessions]);
  
  // Create unified interface
  const result = useMemo(() => {
    if (shouldUseLegacy) {
      return {
        // Legacy system
        sessions: legacySessions.sessions || [],
        activeSession: legacySessions.activeSession || null,
        isLoading: legacySessions.isLoading,
        error: null,
        source: 'legacy' as const,
        
        // Legacy methods
        createSession: legacySessions.createSession,
        updateSessionStatus: legacySessions.updateSessionStatus,
        cleanupExpiredSessions: legacySessions.cleanupExpiredSessions,
        
        // Status flags
        isCreatingSession: legacySessions.isCreatingSession,
        isUpdatingSession: legacySessions.isUpdatingSession,
        isCleaningUp: legacySessions.isCleaningUp,
        
        // Unified methods (mapped to legacy)
        joinSession: () => Promise.resolve(),
        leaveSession: () => Promise.resolve(),
        startSession: () => Promise.resolve(),
        completeSession: () => Promise.resolve(),
        refresh: () => Promise.resolve()
      };
    } else {
      return {
        // Unified system
        sessions: mappedUnifiedSessions,
        activeSession: mappedUnifiedSessions.find(s => s.status === 'active') || null,
        isLoading: unifiedSessions.loading,
        error: unifiedSessions.error,
        source: 'unified' as const,
        
        // Legacy methods (not available in unified)
        createSession: () => {
          console.warn('createSession not implemented in unified system yet');
        },
        updateSessionStatus: () => {
          console.warn('updateSessionStatus not implemented in unified system yet');
        },
        cleanupExpiredSessions: () => {
          console.warn('cleanupExpiredSessions not implemented in unified system yet');
        },
        
        // Status flags
        isCreatingSession: false,
        isUpdatingSession: false,
        isCleaningUp: false,
        
        // Unified methods
        joinSession: unifiedSessions.joinSession,
        leaveSession: unifiedSessions.leaveSession,
        startSession: unifiedSessions.startSession,
        completeSession: unifiedSessions.completeSession,
        refresh: unifiedSessions.refreshSessions
      };
    }
  }, [
    shouldUseLegacy,
    legacySessions,
    mappedUnifiedSessions,
    unifiedSessions
  ]);
  
  return result;
}