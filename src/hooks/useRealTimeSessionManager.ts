import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { UnifiedSession } from './useUnifiedSessions';

interface UseRealTimeSessionManagerProps {
  onSessionUpdate?: (session: UnifiedSession) => void;
  onParticipantUpdate?: (sessionId: string) => void;
  onStatusChange?: (sessionId: string, oldStatus: string, newStatus: string) => void;
}

export function useRealTimeSessionManager({
  onSessionUpdate,
  onParticipantUpdate,
  onStatusChange
}: UseRealTimeSessionManagerProps = {}) {
  const { user } = useAuth();
  const channelRef = useRef<any>(null);
  const subscriptionsRef = useRef<Set<string>>(new Set());

  // Clean up existing subscriptions
  const cleanup = useCallback(() => {
    if (channelRef.current) {
      console.log('Cleaning up real-time session subscriptions');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      subscriptionsRef.current.clear();
    }
  }, []);

  // Setup real-time subscriptions
  const setupRealTimeSubscriptions = useCallback(() => {
    if (!user || channelRef.current) return;

    console.log('Setting up real-time session subscriptions');
    
    const channel = supabase
      .channel('session-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions'
        },
        async (payload) => {
          console.log('Session change detected:', payload);
          
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          if (eventType === 'UPDATE' && newRecord && oldRecord) {
            // Status change notification
            if (newRecord.status !== oldRecord.status) {
              onStatusChange?.(newRecord.id, oldRecord.status, newRecord.status);
              
              // Show status change notification to participants
              if (await isUserInSession(newRecord.id)) {
                showStatusChangeNotification(newRecord.status, oldRecord.status);
              }
            }
            
            onSessionUpdate?.(newRecord as UnifiedSession);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_participants'
        },
        (payload) => {
          console.log('Participant change detected:', payload);
          
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          if (newRecord && 'session_id' in newRecord && newRecord.session_id) {
            onParticipantUpdate?.(newRecord.session_id as string);
          } else if (oldRecord && 'session_id' in oldRecord && oldRecord.session_id) {
            onParticipantUpdate?.(oldRecord.session_id as string);
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to session updates');
        }
      });

    channelRef.current = channel;
  }, [user, onSessionUpdate, onParticipantUpdate, onStatusChange]);

  // Check if user is in a specific session
  const isUserInSession = async (sessionId: string): Promise<boolean> => {
    if (!user) return false;
    
    const { data: session } = await supabase
      .from('sessions')
      .select('creator_id')
      .eq('id', sessionId)
      .single();
      
    if (session?.creator_id === user.id) return true;
    
    const { data: participant } = await supabase
      .from('session_participants')
      .select('id')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .single();
      
    return !!participant;
  };

  // Show appropriate status change notifications
  const showStatusChangeNotification = (newStatus: string, oldStatus: string) => {
    switch (newStatus) {
      case 'active':
        if (oldStatus === 'waiting' || oldStatus === 'open') {
          toast.success('🎾 Session started! Get ready to play!', {
            duration: 5000
          });
        } else if (oldStatus === 'paused') {
          toast.info('▶️ Session resumed', {
            duration: 3000
          });
        }
        break;
        
      case 'paused':
        toast.info('⏸️ Session paused', {
          duration: 3000
        });
        break;
        
      case 'completed':
        toast.success('🏁 Session completed! Great game!', {
          duration: 5000
        });
        break;
        
      case 'cancelled':
        toast.error('❌ Session has been cancelled', {
          duration: 5000
        });
        break;
        
      case 'waiting':
        if (oldStatus === 'open') {
          toast.info('⏳ Session is now waiting to start', {
            duration: 3000
          });
        }
        break;
    }
  };

  // Initialize subscriptions
  useEffect(() => {
    setupRealTimeSubscriptions();
    return cleanup;
  }, [setupRealTimeSubscriptions, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    cleanup,
    setupRealTimeSubscriptions,
    isSubscribed: !!channelRef.current
  };
}

// Hook for session-specific real-time updates
export function useSessionRealTime(sessionId: string | null) {
  const { user } = useAuth();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!sessionId || !user) return;

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          console.log(`Session ${sessionId} updated:`, payload);
          // Trigger a refresh of session data
          window.dispatchEvent(new CustomEvent('session-updated', { 
            detail: { sessionId, data: payload.new } 
          }));
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [sessionId, user]);

  return {
    isSubscribed: !!channelRef.current
  };
}