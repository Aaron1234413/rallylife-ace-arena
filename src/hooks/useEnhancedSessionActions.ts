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

    // End/Complete action for creators during active sessions
    if (isCreator && session.status === 'active') {
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
          // Call start session RPC
          const { data: startData, error: startError } = await supabase
            .rpc('start_session', {
              session_id_param: sessionId,
              starter_id_param: user.id
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
          // Navigate to completion modal/flow
          toast.success('Opening session completion...');
          // This should open a completion modal instead of directly completing
          return true;

        case 'join':
          // Handle join session logic
          const { error: joinError } = await supabase
            .from('session_participants')
            .insert({
              session_id: sessionId,
              user_id: user.id,
              status: 'joined',
              joined_at: new Date().toISOString()
            });

          if (joinError) throw joinError;
          toast.success('Successfully joined session!');
          return true;

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
    loading
  };
}