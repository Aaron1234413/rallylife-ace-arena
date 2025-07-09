import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useSessionManager } from './useSessionManager';

interface EnhancedSessionActionsOptions {
  clubId?: string;
  sessionType?: 'social_play' | 'training' | 'match' | 'wellbeing' | 'club_booking' | 'club_event' | 'all';
  includeNonClubSessions?: boolean;
  onSuccessRedirect?: string;
  enableOptimisticUpdates?: boolean;
}

export function useEnhancedSessionActions(options: EnhancedSessionActionsOptions = {}) {
  const navigate = useNavigate();
  const {
    sessions,
    loading,
    joining: baseJoining,
    error,
    joinSession: baseJoinSession,
    leaveSession: baseLeaveSession,
    startSession: baseStartSession,
    completeSession: baseCompleteSession,
    cancelSession: baseCancelSession,
    getSessionParticipants,
    refreshSessions
  } = useSessionManager({
    clubId: options.clubId,
    sessionType: options.sessionType,
    includeNonClubSessions: options.includeNonClubSessions
  });

  // Enhanced loading states
  const [actionStates, setActionStates] = useState<Record<string, {
    joining?: boolean;
    leaving?: boolean;
    starting?: boolean;
    completing?: boolean;
    cancelling?: boolean;
  }>>({});

  // Optimistic updates state
  const [optimisticSessions, setOptimisticSessions] = useState(sessions);

  // Update optimistic sessions when real sessions change
  useEffect(() => {
    setOptimisticSessions(sessions);
  }, [sessions]);

  const updateActionState = useCallback((sessionId: string, action: string, loading: boolean) => {
    setActionStates(prev => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        [action]: loading
      }
    }));
  }, []);

  const applyOptimisticUpdate = useCallback((sessionId: string, update: any) => {
    if (!options.enableOptimisticUpdates) return;
    
    setOptimisticSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, ...update }
          : session
      )
    );
  }, [options.enableOptimisticUpdates]);

  // Enhanced join session with loading states and navigation
  const joinSession = useCallback(async (sessionId: string) => {
    const loadingToast = toast.loading('Joining session...');
    updateActionState(sessionId, 'joining', true);
    
    // Optimistic update
    applyOptimisticUpdate(sessionId, { 
      participant_count: (sessions.find(s => s.id === sessionId)?.participant_count || 0) + 1,
      user_has_joined: true 
    });

    try {
      const success = await baseJoinSession(sessionId);
      
      if (success) {
        toast.dismiss(loadingToast);
        toast.success('Successfully joined session! 🎾', {
          description: 'You\'ll receive notifications about session updates.',
          action: {
            label: 'View My Sessions',
            onClick: () => navigate('/sessions?tab=joined')
          }
        });

        // Smart navigation based on context
        if (options.onSuccessRedirect) {
          setTimeout(() => navigate(options.onSuccessRedirect!), 2000);
        } else if (options.clubId) {
          setTimeout(() => navigate(`/club/${options.clubId}/sessions?tab=joined`), 2000);
        }

        return true;
      } else {
        // Revert optimistic update on failure
        applyOptimisticUpdate(sessionId, { 
          participant_count: (sessions.find(s => s.id === sessionId)?.participant_count || 1) - 1,
          user_has_joined: false 
        });
        return false;
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      // Revert optimistic update on error
      applyOptimisticUpdate(sessionId, { 
        participant_count: (sessions.find(s => s.id === sessionId)?.participant_count || 1) - 1,
        user_has_joined: false 
      });
      return false;
    } finally {
      updateActionState(sessionId, 'joining', false);
    }
  }, [baseJoinSession, sessions, navigate, options, updateActionState, applyOptimisticUpdate]);

  // Enhanced leave session
  const leaveSession = useCallback(async (sessionId: string) => {
    const loadingToast = toast.loading('Leaving session...');
    updateActionState(sessionId, 'leaving', true);
    
    // Optimistic update
    applyOptimisticUpdate(sessionId, { 
      participant_count: Math.max(0, (sessions.find(s => s.id === sessionId)?.participant_count || 1) - 1),
      user_has_joined: false 
    });

    try {
      const success = await baseLeaveSession(sessionId);
      
      if (success) {
        toast.dismiss(loadingToast);
        toast.success('Left session successfully', {
          description: 'You\'ll no longer receive notifications for this session.'
        });
        return true;
      } else {
        // Revert optimistic update
        applyOptimisticUpdate(sessionId, { 
          participant_count: (sessions.find(s => s.id === sessionId)?.participant_count || 0) + 1,
          user_has_joined: true 
        });
        return false;
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      // Revert optimistic update
      applyOptimisticUpdate(sessionId, { 
        participant_count: (sessions.find(s => s.id === sessionId)?.participant_count || 0) + 1,
        user_has_joined: true 
      });
      return false;
    } finally {
      updateActionState(sessionId, 'leaving', false);
    }
  }, [baseLeaveSession, sessions, updateActionState, applyOptimisticUpdate]);

  // Enhanced start session
  const startSession = useCallback(async (sessionId: string) => {
    const loadingToast = toast.loading('Starting session...');
    updateActionState(sessionId, 'starting', true);
    
    // Optimistic update
    applyOptimisticUpdate(sessionId, { status: 'active' });

    try {
      const success = await baseStartSession(sessionId);
      
      if (success) {
        toast.dismiss(loadingToast);
        toast.success('Session started! 🎾', {
          description: 'Participants have been notified.',
          action: {
            label: 'View Session',
            onClick: () => navigate(`/sessions/${sessionId}`)
          }
        });
        return true;
      } else {
        // Revert optimistic update
        applyOptimisticUpdate(sessionId, { status: 'scheduled' });
        return false;
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      applyOptimisticUpdate(sessionId, { status: 'scheduled' });
      return false;
    } finally {
      updateActionState(sessionId, 'starting', false);
    }
  }, [baseStartSession, updateActionState, applyOptimisticUpdate, navigate]);

  // Enhanced complete session
  const completeSession = useCallback(async (
    sessionId: string, 
    completionData?: {
      winnerId?: string;
      sessionDuration?: number;
      completionNotes?: string;
      sessionRating?: number;
      matchScore?: string;
    }
  ) => {
    const loadingToast = toast.loading('Completing session...');
    updateActionState(sessionId, 'completing', true);
    
    // Optimistic update
    applyOptimisticUpdate(sessionId, { status: 'completed' });

    try {
      const success = await baseCompleteSession(sessionId, completionData);
      
      if (success) {
        toast.dismiss(loadingToast);
        toast.success('Session completed! 🏆', {
          description: 'Great game! Don\'t forget to log your activity.',
          action: {
            label: 'Log Activity',
            onClick: () => navigate('/track')
          }
        });
        return true;
      } else {
        applyOptimisticUpdate(sessionId, { status: 'active' });
        return false;
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      applyOptimisticUpdate(sessionId, { status: 'active' });
      return false;
    } finally {
      updateActionState(sessionId, 'completing', false);
    }
  }, [baseCompleteSession, updateActionState, applyOptimisticUpdate, navigate]);

  // Enhanced cancel session
  const cancelSession = useCallback(async (sessionId: string) => {
    const loadingToast = toast.loading('Cancelling session...');
    updateActionState(sessionId, 'cancelling', true);

    try {
      const success = await baseCancelSession(sessionId);
      
      if (success) {
        toast.dismiss(loadingToast);
        toast.success('Session cancelled successfully', {
          description: 'Participants have been notified and stakes refunded.'
        });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      return false;
    } finally {
      updateActionState(sessionId, 'cancelling', false);
    }
  }, [baseCancelSession, updateActionState]);

  return {
    sessions: optimisticSessions,
    loading,
    error,
    actionStates,
    
    // Enhanced actions
    joinSession,
    leaveSession,
    startSession,
    completeSession,
    cancelSession,
    
    // Utility functions
    getSessionParticipants,
    refreshSessions,
    
    // Helper functions
    isActionLoading: (sessionId: string, action: string) => 
      actionStates[sessionId]?.[action as keyof typeof actionStates[string]] || false,
  };
}