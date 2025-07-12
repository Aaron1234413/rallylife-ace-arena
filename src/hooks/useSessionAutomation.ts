import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface SessionUpdatePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: any;
  old?: any;
}

export function useSessionAutomation(onSessionUpdate?: () => void) {
  const { user } = useAuth();

  // Handle session update notifications
  const handleSessionUpdateNotification = (session: any, eventType: string) => {
    if (!session || !user) return;

    // Only show notifications for sessions involving the current user
    const isCreator = session.creator_id === user.id;
    const isParticipant = session.user_has_joined; // This would need to be determined

    if (!isCreator && !isParticipant) return;

    switch (eventType) {
      case 'UPDATE':
        // Session status changed
        if (session.status === 'active' && isParticipant) {
          toast.success(`🎾 Session "${session.session_type}" has started!`, {
            duration: 5000,
            action: {
              label: 'View Session',
              onClick: () => {
                // Navigate to session view - could be enhanced with router
                console.log('Navigate to session:', session.id);
              }
            }
          });
        } else if (session.status === 'completed' && isParticipant) {
          toast.info(`🏁 Session "${session.session_type}" has ended`, {
            duration: 5000
          });
        } else if (session.status === 'cancelled' && isParticipant) {
          toast.warning(`❌ Session "${session.session_type}" was cancelled`, {
            duration: 5000
          });
        }
        break;

      case 'INSERT':
        // New session created - only notify if it's public or user is involved
        if (isCreator) {
          toast.success(`✅ Your ${session.session_type} session was created successfully!`, {
            duration: 4000
          });
        }
        break;

      case 'DELETE':
        // Session deleted - notify participants
        if (isParticipant && !isCreator) {
          toast.warning(`Session "${session.session_type}" was removed`, {
            duration: 5000
          });
        }
        break;
    }
  };

  useEffect(() => {
    if (!user) return;

    // Create unique channel name to avoid conflicts
    const channelName = `session-updates-${user.id}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions'
        },
        (payload) => {
          console.log('Session update received:', payload);
          
          // Trigger UI refresh when sessions change
          onSessionUpdate?.();
          
          // Show notifications for session state changes
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            const sessionData = payload.new || payload.old;
            handleSessionUpdateNotification(sessionData, payload.eventType);
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
        async (payload) => {
          console.log('Session participant update received:', payload);
          
          // Trigger UI refresh when participants change
          onSessionUpdate?.();
          
          if (payload.eventType === 'INSERT') {
            const participant = payload.new as any;
            
            // Get session details to check if it's now full
            const { data: session } = await supabase
              .from('sessions')
              .select('*')
              .eq('id', participant.session_id)
              .single();
            
            if (session && session.creator_id === user.id) {
              // Count current participants
              const { count } = await supabase
                .from('session_participants')
                .select('*', { count: 'exact', head: true })
                .eq('session_id', participant.session_id);
              
              const participantCount = count || 0;
              const isFull = participantCount >= session.max_players;
              
              // Show notification when session becomes full
              if (isFull && (session.status === 'waiting' || session.status === 'open')) {
                toast.success(
                  `🎾 Session Full! Your ${session.session_type} session is ready to start.`,
                  {
                    duration: 8000,
                    action: {
                      label: 'Start Now',
                      onClick: async () => {
                        try {
                          const { data, error } = await supabase
                            .rpc('start_session', {
                              session_id_param: session.id
                            });
                          
                          if (error) {
                            console.error('Start session error:', error);
                            toast.error('Failed to start session');
                          } else if (data && typeof data === 'object' && 'success' in data && data.success) {
                            toast.success('Session started successfully!');
                            onSessionUpdate?.(); // Refresh UI after successful start
                          } else {
                            toast.error('Failed to start session');
                          }
                        } catch (error) {
                          console.error('Start session error:', error);
                          toast.error('Failed to start session');
                        }
                      }
                    }
                  }
                );
              } else if (!isFull) {
                // Notify about new participant joining
                toast.info(`👋 New player joined your ${session.session_type} session (${participantCount}/${session.max_players})`, {
                  duration: 3000
                });
              }
            }
          } else if (payload.eventType === 'DELETE') {
            const participant = payload.old as any;
            
            // Get session details to notify about participant leaving
            const { data: session } = await supabase
              .from('sessions')
              .select('*')
              .eq('id', participant.session_id)
              .single();
            
            if (session && session.creator_id === user.id) {
              // Count remaining participants
              const { count } = await supabase
                .from('session_participants')
                .select('*', { count: 'exact', head: true })
                .eq('session_id', participant.session_id);
              
              const participantCount = count || 0;
              
              toast.info(`👋 Player left your ${session.session_type} session (${participantCount}/${session.max_players})`, {
                duration: 3000
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user, onSessionUpdate]);

  return null;
}