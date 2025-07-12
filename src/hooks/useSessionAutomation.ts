import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useSessionAutomation() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Subscribe to session changes for real-time updates
    const channel = supabase
      .channel('session-automation')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions'
        },
        (payload) => {
          const session = payload.new as any;
          
          // If this is our session and it just became full, show notification
          if (session && session.creator_id === user.id) {
            const participantCount = session.current_participants || 0;
            const isFull = participantCount >= session.max_players;
            
            if (isFull && session.status === 'waiting') {
              toast.success(
                `🎾 Session Full! Your ${session.session_type} session is ready to start.`,
                {
                  duration: 8000,
                  action: {
                    label: 'Start Now',
                    onClick: async () => {
                      const { data, error } = await supabase
                        .rpc('start_session', {
                          session_id_param: session.id
                        });
                      
                        if (error) {
                        toast.error('Failed to start session');
                      } else if (data && typeof data === 'object' && 'success' in data && data.success) {
                        toast.success('Session started successfully!');
                      }
                    }
                  }
                }
              );
            }
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
              
              if (isFull && session.status === 'waiting') {
                toast.success(
                  `🎾 Session Full! Your ${session.session_type} session is ready to start.`,
                  {
                    duration: 8000,
                    action: {
                      label: 'Start Now',
                      onClick: async () => {
                        const { data, error } = await supabase
                          .rpc('start_session', {
                            session_id_param: session.id
                          });
                        
                        if (error) {
                          toast.error('Failed to start session');
                        } else if (data && typeof data === 'object' && 'success' in data && data.success) {
                          toast.success('Session started successfully!');
                        }
                      }
                    }
                  }
                );
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return null;
}