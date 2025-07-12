import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface SessionAction {
  id: string;
  type: 'join' | 'edit' | 'cancel' | 'complete' | 'start' | 'pause' | 'end';
  label: string;
  icon: string;
  variant: 'default' | 'outline' | 'destructive' | 'secondary';
  loadingText: string;
}

export function useEnhancedSessionActions() {
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Status validation logic
  const validateStatusTransition = (currentStatus: string, newStatus: string): boolean => {
    const validTransitions = {
      'open': ['active', 'cancelled'],
      'waiting': ['active', 'cancelled'], // Allow waiting -> active transition
      'active': ['completed', 'cancelled', 'paused'],  
      'paused': ['active', 'cancelled', 'completed'],
      'completed': [], // final state
      'cancelled': [] // final state
    };
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  };

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
    const participantCount = session.participant_count || session.current_participants || 0;
    const isFull = participantCount >= session.max_players;

    // Join action for non-creators who can join
    if (!isCreator && userRole === 'member' && participantCount < session.max_players && !session.user_joined) {
      actions.push({
        id: 'join',
        type: 'join',
        label: 'Join Session',
        icon: '🎾',
        variant: 'default',
        loadingText: 'Joining...'
      });
    }

    // Start action for creators when session is full
    if (isCreator && isFull && session.status === 'waiting') {
      actions.push({
        id: 'start',
        type: 'start',
        label: 'Start Session',
        icon: '▶️',
        variant: 'default',
        loadingText: 'Starting...'
      });
    }

    // Pause/Resume action for creators during active/paused sessions
    if (isCreator && (session.status === 'active' || session.status === 'paused')) {
      actions.push({
        id: 'pause',
        type: 'pause',
        label: session.status === 'active' ? 'Pause Session' : 'Resume Session',
        icon: session.status === 'active' ? '⏸️' : '▶️',
        variant: 'secondary',
        loadingText: session.status === 'active' ? 'Pausing...' : 'Resuming...'
      });
    }

    // End/Complete action for any participant during active sessions
    if ((isCreator || session.user_joined) && session.status === 'active') {
      actions.push({
        id: 'end',
        type: 'end',
        label: 'End Session',
        icon: '🏁',
        variant: 'destructive',
        loadingText: 'Ending...'
      });
    }

    // Edit action for creators and admins
    if (isCreator || userRole === 'admin') {
      actions.push({
        id: 'edit',
        type: 'edit',
        label: 'Edit Session',
        icon: '✏️',
        variant: 'outline',
        loadingText: 'Loading...'
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
          // Get current session state for validation
          const session = await getSessionById(sessionId);
          
          // Validate session can be started
          if (!validateStatusTransition(session.status, 'active')) {
            throw new Error(`Cannot start session with status '${session.status}'. Session must be in 'open' or 'waiting' status.`);
          }
          
          if (session.participant_count < 2) {
            throw new Error('Need at least 2 participants to start the session');
          }
          
          if (session.creator_id !== user.id) {
            throw new Error('Only the session creator can start the session');
          }

          // Call start session RPC with correct parameters
          const { data: startData, error: startError } = await supabase
            .rpc('start_session', {
              session_id_param: sessionId
            });

          if (startError) throw startError;
          
          if (startData && typeof startData === 'object' && 'success' in startData && startData.success) {
            toast.success('Session started successfully!');
            return true;
          } else {
            const errorMessage = typeof startData === 'object' && 'message' in startData 
              ? String(startData.message) 
              : 'Failed to start session';
            toast.error(errorMessage);
            return false;
          }

        case 'pause':
          // Get current session state for validation
          const pauseSession = await getSessionById(sessionId);
          
          // Validate session can be paused/resumed
          const targetStatus = pauseSession.status === 'active' ? 'paused' : 'active';
          if (!validateStatusTransition(pauseSession.status, targetStatus)) {
            throw new Error(`Cannot ${targetStatus === 'paused' ? 'pause' : 'resume'} session with status '${pauseSession.status}'`);
          }
          
          if (pauseSession.creator_id !== user.id) {
            throw new Error('Only the session creator can pause/resume the session');
          }

          // Call pause session RPC
          const { data: pauseData, error: pauseError } = await supabase
            .rpc('pause_session', {
              session_id_param: sessionId,
              user_id_param: user.id
            });

          if (pauseError) throw pauseError;
          
          if (pauseData && typeof pauseData === 'object' && 'success' in pauseData && pauseData.success) {
            const newStatus = pauseData.new_status === 'paused' ? 'Session paused' : 'Session resumed';
            toast.success(newStatus);
            return true;
          } else {
            const errorMessage = typeof pauseData === 'object' && 'message' in pauseData 
              ? String(pauseData.message) 
              : 'Failed to pause/resume session';
            toast.error(errorMessage);
            return false;
          }

        case 'end':
          // Get current session state for validation
          const endSession = await getSessionById(sessionId);
          
          // Validate session can be completed
          if (!validateStatusTransition(endSession.status, 'completed')) {
            throw new Error(`Cannot end session with status '${endSession.status}'. Session must be active to end.`);
          }
          
          // Check if user has permission to end session
          const isParticipant = endSession.creator_id === user.id || 
                               (await supabase
                                .from('session_participants')
                                .select('id')
                                .eq('session_id', sessionId)
                                .eq('user_id', user.id)
                                .single()).data !== null;
          
          if (!isParticipant) {
            throw new Error('Only participants can end the session');
          }

          // Call complete session RPC
          const { data: completeData, error: completeError } = await supabase
            .rpc('complete_session', {
              session_id_param: sessionId,
              winner_id_param: null
            });

          if (completeError) throw completeError;
          
          if (completeData && typeof completeData === 'object' && 'success' in completeData && completeData.success) {
            toast.success('Session completed successfully!');
            return true;
          } else {
            const errorMessage = typeof completeData === 'object' && 'message' in completeData 
              ? String(completeData.message) 
              : 'Failed to complete session';
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
          // Navigate to edit page
          navigate(`/sessions/${sessionId}/edit`);
          return true;

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
    validateStatusTransition
  };
}