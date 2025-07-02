
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

    try {
      const channel = supabase.channel(channelName);

      // Listen for invitation updates with timeout protection
      const setupChannelListeners = () => {
        // Listen for invitation status updates
        channel.on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'match_invitations',
            filter: `inviter_id=eq.${user.id}`
          },
          (payload) => {
            try {
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
            } catch (error) {
              console.warn('Error processing invitation update:', error);
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
            try {
              const invitation = payload.new as any;
              const category = invitation?.invitation_category === 'match' ? 'Match' : 'Social Play';
              toast.success(`📨 New ${category} Invitation!`, {
                description: `You received an invitation from someone`,
                duration: 6000,
              });
            } catch (error) {
              console.warn('Error processing new invitation:', error);
            }
          }
        );
      };

      setupChannelListeners();

      // Subscribe with timeout handling
      const subscriptionTimeout = setTimeout(() => {
        console.warn('🔔 [NOTIFICATIONS] Subscription timeout, cleaning up');
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
          isInitialized.current = false;
        }
      }, 10000); // 10 second timeout

      channel.subscribe((status) => {
        console.log('🔔 [NOTIFICATIONS] Channel status:', status);
        if (status === 'SUBSCRIBED') {
          clearTimeout(subscriptionTimeout);
          console.log('✅ [NOTIFICATIONS] Live notifications active');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('❌ [NOTIFICATIONS] Channel error or timeout');
          clearTimeout(subscriptionTimeout);
          isInitialized.current = false;
        }
      });

      channelRef.current = channel;

      return () => {
        clearTimeout(subscriptionTimeout);
        if (channelRef.current) {
          console.log('🧹 [NOTIFICATIONS] Cleaning up notification channel');
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
          isInitialized.current = false;
        }
      };
    } catch (error) {
      console.error('🔔 [NOTIFICATIONS] Failed to setup live notifications:', error);
      isInitialized.current = false;
    }
  }, [user]);

  return {};
}
