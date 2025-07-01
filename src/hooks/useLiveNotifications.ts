import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useLiveNotifications() {
  const { user } = useAuth();
  const channelRef = useRef<any>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!user || isInitialized.current) return;

    isInitialized.current = true;
    const channelName = `live-notifications-${user.id}`;
    console.log('🔔 [NOTIFICATIONS] Setting up live notification channel:', channelName);

    const channel = supabase.channel(channelName);

    // Listen for invitation updates for current user
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'match_invitations',
        filter: `inviter_id=eq.${user.id}`
      },
      (payload) => {
        const invitation = payload.new as any;
        if (invitation?.status === 'accepted') {
          toast.success(`🎾 Your ${invitation.invitation_category} invitation was accepted!`, {
            description: `${invitation.invitee_name} accepted your invitation`,
            duration: 5000,
          });
        } else if (invitation?.status === 'declined') {
          toast.info(`❌ Invitation declined`, {
            description: `${invitation.invitee_name} declined your ${invitation.invitation_category} invitation`,
            duration: 4000,
          });
        }
      }
    );

    // Listen for new invitations received
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'match_invitations',
        filter: `invitee_id=eq.${user.id}`
      },
      (payload) => {
        const invitation = payload.new as any;
        const category = invitation?.invitation_category === 'match' ? 'Match' : 'Social Play';
        toast.success(`📨 New ${category} Invitation!`, {
          description: `You received an invitation from someone`,
          duration: 6000,
          action: {
            label: 'View',
            onClick: () => {
              // Could navigate to invitations or specific invitation
              console.log('Navigate to invitations');
            },
          },
        });
      }
    );

    // Listen for active match session updates
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'active_match_sessions',
        filter: `player_id=eq.${user.id}`
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          toast.success('🎾 Match Started!', {
            description: 'Your match session is now active',
            duration: 4000,
          });
        } else if (payload.eventType === 'UPDATE' && (payload.new as any)?.status === 'completed') {
          toast.info('🏆 Match Completed!', {
            description: 'Your match session has ended',
            duration: 4000,
          });
        }
      }
    );

    // Listen for social play session updates
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'social_play_sessions',
        filter: `created_by=eq.${user.id}`
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          toast.success('👥 Social Play Created!', {
            description: 'Your social play session is ready',
            duration: 4000,
          });
        } else if (payload.eventType === 'UPDATE' && (payload.new as any)?.status === 'active') {
          toast.success('🎉 Social Play Started!', {
            description: 'Your social play session is now active',
            duration: 4000,
          });
        }
      }
    );

    // Listen for participant join/leave in social play sessions
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'social_play_participants'
      },
      (payload) => {
        // Only show notifications for sessions the user created or participates in
        if (payload.eventType === 'INSERT' && (payload.new as any)?.status === 'joined') {
          toast.info('👋 Player Joined!', {
            description: 'Someone joined your social play session',
            duration: 3000,
          });
        } else if (payload.eventType === 'UPDATE' && (payload.new as any)?.status === 'left') {
          toast.info('👋 Player Left', {
            description: 'A player left the social play session',
            duration: 3000,
          });
        }
      }
    );

    channel.subscribe((status) => {
      console.log('🔔 [NOTIFICATIONS] Channel status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ [NOTIFICATIONS] Live notifications active');
      }
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        console.log('🧹 [NOTIFICATIONS] Cleaning up notification channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isInitialized.current = false;
      }
    };
  }, [user]);

  return {};
}