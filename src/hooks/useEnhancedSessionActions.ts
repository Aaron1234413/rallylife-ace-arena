import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { 
  sessionStateMachine, 
  validateStatusTransition,
  canModifySession 
} from './useSessionStateMachine';

export interface SessionAction {
  id: string;
  type: 'join' | 'edit' | 'cancel' | 'complete' | 'start' | 'pause' | 'end' | 'leave';
  label: string;
  icon: string;
  variant: 'default' | 'outline' | 'destructive' | 'secondary';
  loadingText: string;
}

// Using shared session state machine from useSessionStateMachine

export function useEnhancedSessionActions() {
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Using shared state machine validation from useSessionStateMachine

  // Get session by ID for validation
  const getSessionById = async (sessionId: string) => {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        participant_count:session_participants(count)
      `)
      .eq('id', sessionId)
      .single();
    
    if (error) throw error;
    return {
      ...data,
      participant_count: data.participant_count?.[0]?.count || 0
    };
  };

  // Check for automatic status updates
  const checkAutoStatusUpdate = async (sessionId: string) => {
    try {
      const session = await getSessionById(sessionId);
      
      // Auto-start eligibility notification for creators
      if (session.status === 'open' && 
          session.participant_count === session.max_players &&
          session.creator_id === user?.id) {
        toast.success('Session is full! You can now start the session.', {
          duration: 5000,
          action: {
            label: 'Start Now',
            onClick: () => executeAction({
              id: 'start',
              type: 'start',
              label: 'Start Session',
              icon: '▶️',
              variant: 'default',
              loadingText: 'Starting...'
            }, sessionId)
          }
        });
      }
    } catch (error) {
      console.error('Error checking auto status update:', error);
    }
  };

  const getSessionActions = (session: any, userRole: string): SessionAction[] => {
    const actions: SessionAction[] = [];
    const isCreator = session.creator_id === user?.id;
    const isParticipant = session.user_has_joined || isCreator;
    const participantCount = session.participant_count || session.current_participants || 0;

    // Join action - only for non-participants when session is open and not full
    if (!isParticipant && 
        session.status === 'open' && 
        participantCount < session.max_players) {
      actions.push({
        id: 'join',
        type: 'join',
        label: 'Join Session',
        icon: '🎾',
        variant: 'default',
        loadingText: 'Joining...'
      });
    }

    // Start action - for creators/participants when conditions are met
    if (isParticipant && 
        ['open', 'waiting'].includes(session.status) && 
        participantCount >= 2) {
      actions.push({
        id: 'start',
        type: 'start',
        label: 'Start Session',
        icon: '▶️',
        variant: 'default',
        loadingText: 'Starting...'
      });
    }

    // Pause/Resume action - only for creators during active/paused sessions
    if (isCreator && ['active', 'paused'].includes(session.status)) {
      actions.push({
        id: 'pause',
        type: 'pause',
        label: session.status === 'active' ? 'Pause Session' : 'Resume Session',
        icon: session.status === 'active' ? '⏸️' : '▶️',
        variant: 'secondary',
        loadingText: session.status === 'active' ? 'Pausing...' : 'Resuming...'
      });
    }

    // End action - for any participant during active/paused sessions
    if (isParticipant && ['active', 'paused'].includes(session.status)) {
      actions.push({
        id: 'end',
        type: 'end',
        label: 'End Session',
        icon: '🏁',
        variant: 'destructive',
        loadingText: 'Ending...'
      });
    }

    // Edit action - only for creators when session is open
    if (isCreator && session.status === 'open') {
      actions.push({
        id: 'edit',
        type: 'edit',
        label: 'Edit Session',
        icon: '✏️',
        variant: 'outline',
        loadingText: 'Loading...'
      });
    }

    // Leave action - for non-creator participants when session is open
    if (isParticipant && !isCreator && session.status === 'open') {
      actions.push({
        id: 'leave',
        type: 'leave',
        label: 'Leave Session',
        icon: '👋',
        variant: 'outline',
        loadingText: 'Leaving...'
      });
    }

    // Cancel action - for creators when session can be cancelled
    if (isCreator && ['open', 'waiting'].includes(session.status)) {
      actions.push({
        id: 'cancel',
        type: 'cancel',
        label: 'Cancel Session',
        icon: '❌',
        variant: 'destructive',
        loadingText: 'Cancelling...'
      });
    }

    return actions;
  };

  const executeAction = async (action: SessionAction, sessionId: string, clubId?: string) => {
    if (!user) {
      toast.error('Please sign in to continue');
      return false;
    }

    setLoading(action.id);
    try {
      switch (action.type) {
        case 'start':
          // Call standardized start_session RPC
          const { data: startData, error: startError } = await supabase
            .rpc('start_session', {
              session_id_param: sessionId,
              starter_id_param: user.id
            });

          if (startError) {
            console.error('Start session error:', startError);
            throw new Error(startError.message || 'Failed to start session');
          }
          
          const result = startData as { success?: boolean; message?: string; error?: string };
          if (result?.success) {
            toast.success(result.message || 'Session started successfully!');
            return true;
          } else {
            const errorMessage = result?.error || 'Failed to start session';
            toast.error(errorMessage);
            return false;
          }

        case 'pause':
          // Call standardized pause_session RPC
          const { data: pauseData, error: pauseError } = await supabase
            .rpc('pause_session', {
              session_id_param: sessionId,
              user_id_param: user.id
            });

          if (pauseError) {
            console.error('Pause session error:', pauseError);
            throw new Error(pauseError.message || 'Failed to pause/resume session');
          }
          
          const pauseResult = pauseData as { success?: boolean; message?: string; error?: string; new_status?: string };
          if (pauseResult?.success) {
            const statusMessage = pauseResult.new_status === 'paused' ? 'Session paused' : 'Session resumed';
            toast.success(pauseResult.message || statusMessage);
            return true;
          } else {
            const errorMessage = pauseResult?.error || 'Failed to pause/resume session';
            toast.error(errorMessage);
            return false;
          }

        case 'end':
          // Call standardized end_session RPC
          const { data: endData, error: endError } = await supabase
            .rpc('end_session', {
              session_id_param: sessionId,
              winner_id_param: null,
              completion_data: null,
              user_id_param: user.id
            });

          if (endError) {
            console.error('End session error:', endError);
            throw new Error(endError.message || 'Failed to end session');
          }
          
          const endResult = endData as { success?: boolean; message?: string; error?: string };
          if (endResult?.success) {
            toast.success(endResult.message || 'Session completed successfully!');
            return true;
          } else {
            const errorMessage = endResult?.error || 'Failed to end session';
            toast.error(errorMessage);
            return false;
          }

        case 'join':
          // Get current session state for validation
          const joinSession = await getSessionById(sessionId);
          
          // Validate session is open for joining
          if (joinSession.status !== 'open' && joinSession.status !== 'waiting') {
            throw new Error(`Cannot join session with status '${joinSession.status}'. Session must be open.`);
          }
          
          if (joinSession.participant_count >= joinSession.max_players) {
            throw new Error('Session is full. Cannot join.');
          }
          
          // Check if user is already a participant
          const existingParticipant = await supabase
            .from('session_participants')
            .select('id')
            .eq('session_id', sessionId)
            .eq('user_id', user.id)
            .single();
          
          if (existingParticipant.data) {
            throw new Error('You are already a participant in this session');
          }

          // Use join_session RPC function for proper token handling
          const { data: joinData, error: joinError } = await supabase
            .rpc('join_session', {
              session_id_param: sessionId,
              user_id_param: user.id
            });

          if (joinError) throw joinError;
          
          if (joinData && typeof joinData === 'object' && 'success' in joinData && joinData.success) {
            toast.success('Successfully joined session!');
            
            // Check for auto-start eligibility after joining
            setTimeout(() => checkAutoStatusUpdate(sessionId), 1000);
            
            return true;
          } else {
            const errorMessage = typeof joinData === 'object' && 'error' in joinData 
              ? String(joinData.error) 
              : 'Failed to join session';
            toast.error(errorMessage);
            return false;
          }

        case 'edit':
          // Navigate to edit session page
          navigate(`/sessions/${sessionId}/edit`);
          return true;

        case 'leave':
          // Call leave session functionality
          const { error: leaveError } = await supabase
            .from('session_participants')
            .delete()
            .eq('session_id', sessionId)
            .eq('user_id', user.id);

          if (leaveError) {
            console.error('Leave session error:', leaveError);
            throw new Error('Failed to leave session');
          }

          toast.success('Successfully left session');
          return true;

        case 'cancel':
          // Call cancel session with refunds RPC
          const { data: cancelData, error: cancelError } = await supabase
            .rpc('cancel_session_with_refunds', {
              session_id_param: sessionId,
              canceller_id_param: user.id,
              cancellation_reason_param: 'Cancelled by creator'
            });

          if (cancelError) {
            console.error('Cancel session error:', cancelError);
            throw new Error(cancelError.message || 'Failed to cancel session');
          }

          const cancelResult = cancelData as { success?: boolean; message?: string; error?: string };
          if (cancelResult?.success) {
            toast.success(cancelResult.message || 'Session cancelled successfully');
            return true;
          } else {
            const errorMessage = cancelResult?.error || 'Failed to cancel session';
            toast.error(errorMessage);
            return false;
          }

        default:
          toast.error('Action not implemented yet');
          return false;
      }
    } catch (error) {
      console.error('Action failed:', error);
      toast.error('Action failed. Please try again.');
      return false;
    } finally {
      setLoading(null);
    }
  };

  return {
    getSessionActions,
    executeAction,
    loading,
    checkAutoStatusUpdate,
    validateStatusTransition,
    sessionStateMachine
  };
}