
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import type { MatchInvitation, MatchParticipant, SendInvitationParams } from '@/types/match-invitations';

export function useMatchInvitations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [invitations, setInvitations] = useState<MatchInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const subscriptionInitialized = useRef(false);

  const fetchInvitations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('match_invitations')
        .select(`
          *,
          inviter:profiles!match_invitations_inviter_id_fkey(full_name),
          session:active_match_sessions(opponent_name)
        `)
        .eq('invitee_id', user.id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
        return;
      }

      const typedInvitations: MatchInvitation[] = (data || []).map(inv => ({
        id: inv.id,
        match_session_id: inv.match_session_id,
        inviter_id: inv.inviter_id,
        invitee_id: inv.invitee_id,
        invitee_email: inv.invitee_email,
        invitee_name: inv.invitee_name,
        invitation_type: inv.invitation_type,
        message: inv.message,
        status: inv.status as 'pending' | 'accepted' | 'declined',
        expires_at: inv.expires_at,
        responded_at: inv.responded_at,
        created_at: inv.created_at,
        updated_at: inv.updated_at,
        inviter_name: inv.inviter?.full_name,
        session_opponent_name: inv.session?.opponent_name
      }));

      setInvitations(typedInvitations);
    } catch (error) {
      console.error('Error in fetchInvitations:', error);
    }
  };

  const sendInvitation = async ({ sessionId, inviteeId, inviteeEmail, inviteeName, message }: SendInvitationParams) => {
    if (!user) return;

    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error } = await supabase
        .from('match_invitations')
        .insert({
          match_session_id: sessionId,
          inviter_id: user.id,
          invitee_id: inviteeId,
          invitee_email: inviteeEmail,
          invitee_name: inviteeName,
          invitation_type: 'match',
          message,
          status: 'pending',
          expires_at: expiresAt.toISOString()
        });

      if (error) {
        console.error('Error sending invitation:', error);
        toast.error('Failed to send invitation');
        return;
      }

      toast.success('Invitation sent successfully!');
      
      queryClient.invalidateQueries({ queryKey: ['match-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['match-sessions'] });
      
      await fetchInvitations();
    } catch (error) {
      console.error('Error in sendInvitation:', error);
      toast.error('Failed to send invitation');
    }
  };

  const acceptInvitation = async (inviteId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('accept_match_invitation', {
        invitation_id: inviteId
      });

      if (error) {
        console.error('Error accepting invitation:', error);
        toast.error('Failed to accept invitation');
        return;
      }

      const result = data as { success: boolean; message: string; error?: string };
      
      if (!result.success) {
        toast.error(result.error || 'Failed to accept invitation');
        return;
      }

      toast.success('Invitation accepted! Match session is now active.');
      
      // Force refresh of all related data
      queryClient.invalidateQueries({ queryKey: ['match-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['match-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['match-participants'] });
      
      await fetchInvitations();
    } catch (error) {
      console.error('Error in acceptInvitation:', error);
      toast.error('Failed to accept invitation');
    }
  };

  const declineInvitation = async (inviteId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('decline_match_invitation', {
        invitation_id: inviteId
      });

      if (error) {
        console.error('Error declining invitation:', error);
        toast.error('Failed to decline invitation');
        return;
      }

      const result = data as { success: boolean; message: string; error?: string };
      
      if (!result.success) {
        toast.error(result.error || 'Failed to decline invitation');
        return;
      }

      toast.success('Invitation declined');
      
      queryClient.invalidateQueries({ queryKey: ['match-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['match-sessions'] });
      
      await fetchInvitations();
    } catch (error) {
      console.error('Error in declineInvitation:', error);
      toast.error('Failed to decline invitation');
    }
  };

  useEffect(() => {
    if (user && !subscriptionInitialized.current) {
      const loadData = async () => {
        setLoading(true);
        await fetchInvitations();
        setLoading(false);
      };

      loadData();

      const channelName = `match-invitations-${user.id}-${Date.now()}`;
      const channel = supabase.channel(channelName);
      
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_invitations',
          filter: `invitee_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New match invitation received:', payload);
          toast.info('🎾 New match invitation received!');
          fetchInvitations();
        }
      );

      channel.subscribe((status) => {
        console.log('Match invitations channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          subscriptionInitialized.current = true;
        }
      });

      channelRef.current = channel;

      return () => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
        }
      };
    } else if (!user) {
      setInvitations([]);
      setLoading(false);
    }
  }, [user]);

  const fetchParticipants = async (sessionId: string): Promise<MatchParticipant[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('match_participants')
        .select(`
          *,
          user:profiles(full_name)
        `)
        .eq('match_session_id', sessionId);

      if (error) {
        console.error('Error fetching participants:', error);
        return [];
      }

      return (data || []).map(p => ({
        id: p.id,
        match_session_id: p.match_session_id,
        user_id: p.user_id,
        participant_name: p.participant_name,
        participant_role: p.participant_role,
        joined_at: p.joined_at
      }));
    } catch (error) {
      console.error('Error in fetchParticipants:', error);
      return [];
    }
  };

  return {
    invitations,
    loading,
    sendInvitation,
    acceptInvitation,
    declineInvitation,
    fetchParticipants,
    refreshInvitations: fetchInvitations
  };
}
