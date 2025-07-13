import { useEnhancedSessionActions } from './useEnhancedSessionActions';
import { useUnifiedSessions } from './useUnifiedSessions';
import type { UnifiedSession } from './useUnifiedSessions';

/**
 * Unified session actions hook providing a consolidated API for all session operations
 */
export const useSessionActions = () => {
  const { executeAction: enhancedExecuteAction } = useEnhancedSessionActions();
  const { 
    joinSession, 
    leaveSession, 
    createSession,
    startSession,
    completeSession,
    cancelSession
  } = useUnifiedSessions();
  
  return {
    // Consolidated API
    join: joinSession,
    leave: leaveSession,
    start: (sessionId: string) => enhancedExecuteAction(
      { id: 'start', type: 'start', label: 'Start', icon: 'play', variant: 'default' as const, loadingText: 'Starting...' }, 
      sessionId
    ),
    end: (sessionId: string) => enhancedExecuteAction(
      { id: 'end', type: 'end', label: 'End Session', icon: 'square', variant: 'destructive' as const, loadingText: 'Preparing completion...' }, 
      sessionId
    ),
    pause: (sessionId: string) => enhancedExecuteAction(
      { id: 'pause', type: 'pause', label: 'Pause', icon: 'pause', variant: 'outline' as const, loadingText: 'Pausing...' }, 
      sessionId
    ),
    complete: (sessionId: string, completionData?: any) => completeSession(sessionId, completionData),
    cancel: (sessionId: string, reason?: string) => cancelSession(sessionId, reason),
    create: createSession,
    
    // Status checks
    canJoin: (session: UnifiedSession) => 
      session.status === 'open' && 
      !session.user_has_joined && 
      (session.participant_count || 0) < session.max_players,
    
    canStart: (session: UnifiedSession) => 
      session.status === 'open' && 
      session.user_has_joined && 
      (session.participant_count || 0) >= 2, // Need at least 2 players to start
    
    canEnd: (session: UnifiedSession) => 
      session.status === 'active' && 
      session.user_has_joined,
    
    canPause: (session: UnifiedSession) => 
      session.status === 'active' && 
      session.user_has_joined,
    
    canComplete: (session: UnifiedSession) => 
      session.status === 'active' && 
      session.user_has_joined,
    
    canCancel: (session: UnifiedSession) => 
      (session.status === 'open' || session.status === 'active') && 
      session.user_has_joined,
    
    canLeave: (session: UnifiedSession) => 
      session.status === 'open' && 
      session.user_has_joined,
    
    canEdit: (session: UnifiedSession) => 
      session.status === 'open' && 
      session.user_has_joined
  };
};