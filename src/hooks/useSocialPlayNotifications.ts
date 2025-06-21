
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function useSocialPlayNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const channelsRef = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up social play notifications for user:', user.id);

    // Clean up existing channels first
    Object.values(channelsRef.current).forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = {};

    // Listen for participant changes (invites, acceptances, etc.)
    const participantsChannel = supabase
      .channel(`social-play-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_play_participants',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('New participant invite:', payload);
          
          if (payload.new) {
            const participant = payload.new as any;
            
            // Get session details for the toast
            const { data: session } = await supabase
              .from('social_play_sessions')
              .select('session_type, competitive_level, location, created_by, profiles:created_by(full_name)')
              .eq('id', participant.session_id)
              .single();

            if (session) {
              const creatorName = (session as any).profiles?.full_name || 'Someone';
              
              toast({
                title: 'Social Play Invitation! 🎾',
                description: `${creatorName} invited you to a ${session.competitive_level} ${session.session_type} session${session.location ? ` at ${session.location}` : ''}`,
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'social_play_participants'
        },
        async (payload) => {
          console.log('Participant status update:', payload);
          
          if (payload.new && payload.old) {
            const newParticipant = payload.new as any;
            const oldParticipant = payload.old as any;
            
            // Only process if status changed and it's not our own update
            if (newParticipant.status !== oldParticipant.status && newParticipant.user_id !== user.id) {
              // Get participant name
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', newParticipant.user_id)
                .single();

              const participantName = profile?.full_name || 'Someone';
              
              if (newParticipant.status === 'accepted') {
                toast({
                  title: 'Player Joined! 🎉',
                  description: `${participantName} accepted your invitation and joined the session`,
                });
              } else if (newParticipant.status === 'declined') {
                toast({
                  title: 'Invitation Declined',
                  description: `${participantName} declined your invitation`,
                  variant: 'destructive',
                });
              }
            }
          }
        }
      );

    // Listen for session status changes
    const sessionsChannel = supabase
      .channel(`social-play-sessions-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'social_play_sessions'
        },
        async (payload) => {
          console.log('Session status update:', payload);
          
          if (payload.new && payload.old) {
            const newSession = payload.new as any;
            const oldSession = payload.old as any;
            
            // Only process status changes for sessions we're involved in
            if (newSession.status !== oldSession.status) {
              // Check if user is involved in this session
              const { data: participation } = await supabase
                .from('social_play_participants')
                .select('id')
                .eq('session_id', newSession.id)
                .eq('user_id', user.id)
                .single();

              const isCreator = newSession.created_by === user.id;
              
              if (participation || isCreator) {
                let message = '';
                let title = '';
                
                switch (newSession.status) {
                  case 'active':
                    title = 'Session Started! ⚡';
                    message = 'Your social play session is now active';
                    break;
                  case 'paused':
                    title = 'Session Paused ⏸️';
                    message = 'Your social play session has been paused';
                    break;
                  case 'completed':
                    title = 'Session Complete! 🏆';
                    message = 'Your social play session has been completed';
                    break;
                  case 'cancelled':
                    title = 'Session Cancelled';
                    message = 'Your social play session has been cancelled';
                    break;
                }
                
                if (title && message) {
                  toast({
                    title,
                    description: message,
                    variant: newSession.status === 'cancelled' ? 'destructive' : 'default',
                  });
                }
              }
            }
          }
        }
      );

    // Subscribe to channels one by one
    participantsChannel.subscribe((status) => {
      console.log('Social play notifications channel status:', status);
    });

    sessionsChannel.subscribe((status) => {
      console.log('Social play sessions channel status:', status);
    });

    // Store channels for cleanup
    channelsRef.current = {
      participants: participantsChannel,
      sessions: sessionsChannel
    };

    return () => {
      console.log('Cleaning up social play notifications');
      Object.values(channelsRef.current).forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = {};
    };
  }, [user?.id, toast]);
}
