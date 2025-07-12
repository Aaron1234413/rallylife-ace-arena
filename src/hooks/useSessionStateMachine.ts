import { UnifiedSession } from './useUnifiedSessions';

// Session State Machine Definition
export const sessionStateMachine = {
  open: {
    canTransitionTo: ['active', 'cancelled'],
    autoTriggers: {
      active: (session: UnifiedSession) => session.participant_count === session.max_players
    }
  },
  waiting: {
    canTransitionTo: ['active', 'cancelled'],
    autoTriggers: {
      active: (session: UnifiedSession) => session.participant_count === session.max_players
    }
  },
  active: {
    canTransitionTo: ['completed', 'cancelled', 'paused'],
    autoTriggers: {}
  },
  paused: {
    canTransitionTo: ['active', 'cancelled', 'completed'],
    autoTriggers: {}
  },
  completed: { 
    canTransitionTo: [], 
    autoTriggers: {} 
  },
  cancelled: { 
    canTransitionTo: [], 
    autoTriggers: {} 
  }
};

export type SessionStatus = keyof typeof sessionStateMachine;

// Validation function for status transitions
export const validateStatusTransition = (currentStatus: string, targetStatus: string): boolean => {
  const currentState = sessionStateMachine[currentStatus as SessionStatus];
  if (!currentState) {
    console.warn(`Unknown session status: ${currentStatus}`);
    return false;
  }
  return currentState.canTransitionTo.includes(targetStatus);
};

// Check for auto-triggers based on session state
export const checkAutoTriggers = (session: UnifiedSession): string | null => {
  const currentState = sessionStateMachine[session.status as SessionStatus];
  if (!currentState) return null;

  for (const [targetStatus, triggerFn] of Object.entries(currentState.autoTriggers)) {
    if (triggerFn(session)) {
      console.log(`Auto-trigger detected: ${session.status} -> ${targetStatus} for session ${session.id}`);
      return targetStatus;
    }
  }
  return null;
};

// Helper function to get all valid transitions for a status
export const getValidTransitions = (currentStatus: string): string[] => {
  const currentState = sessionStateMachine[currentStatus as SessionStatus];
  return currentState ? currentState.canTransitionTo : [];
};

// Helper function to check if a session is in a final state
export const isFinalState = (status: string): boolean => {
  return status === 'completed' || status === 'cancelled';
};

// Helper function to check if a session can be modified
export const canModifySession = (status: string): boolean => {
  return !isFinalState(status);
};