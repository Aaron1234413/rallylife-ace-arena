import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const LiveSessionStatusUpdater: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`session-updates-${user.id}`);

    // Listen for match session updates where user is involved
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'active_match_sessions'
      },
      (payload) => {
        const session = payload.new || payload.old;
        const sessionData = session as any;
        const isUserInvolved = 
          sessionData?.player_id === user.id ||
          sessionData?.opponent_id === user.id ||
          sessionData?.partner_id === user.id ||
          sessionData?.opponent_1_id === user.id ||
          sessionData?.opponent_2_id === user.id;

        if (!isUserInvolved) return;

        if (payload.eventType === 'UPDATE') {
          const oldData = payload.old as any;
          const newData = payload.new as any;
          
          // Detect score updates
          if (oldData?.sets !== newData?.sets) {
            toast.info('📊 Score Updated', {
              description: 'Match score has been updated',
              duration: 2000,
            });
          }
          
          // Detect session status changes
          if (oldData?.status !== newData?.status) {
            if (newData?.status === 'completed') {
              toast.success('🏆 Match Complete!', {
                description: 'The match session has ended',
                duration: 4000,
              });
            } else if (newData?.status === 'paused') {
              toast.info('⏸️ Match Paused', {
                description: 'The match has been paused',
                duration: 3000,
              });
            } else if (newData?.status === 'active' && oldData?.status === 'paused') {
              toast.info('▶️ Match Resumed', {
                description: 'The match has been resumed',
                duration: 3000,
              });
            }
          }
        }
      }
    );

    // Listen for social play participant changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'social_play_participants'
      },
      (payload) => {
        const participantData = payload.new as any;
        if (payload.eventType === 'INSERT' && participantData?.status === 'joined') {
          // Check if this is for a session the user is involved in
          toast.info('👋 New Player Joined!', {
            description: 'Someone joined the social play session',
            duration: 3000,
          });
        } else if (payload.eventType === 'UPDATE' && participantData?.status === 'left') {
          toast.info('👋 Player Left', {
            description: 'A player left the social play session',
            duration: 3000,
          });
        }
      }
    );

    channel.subscribe((status) => {
      console.log('🔄 [SESSION_UPDATES] Channel status:', status);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return null; // This is a utility component with no UI
};