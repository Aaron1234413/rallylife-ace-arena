
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { MatchInvitation, MatchParticipant, SendInvitationParams } from '@/types/match-invitations';

export function useMatchInvitations() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<MatchInvitation[]>([]);
  const [participants, setParticipants] = useState<MatchParticipant[]>([]);
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
          invitee:profiles!match_invitations_invitee_id_fkey(full_name),
          session:active_match_sessions(opponent_name)
        `)
        .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)
        .eq('status', 'pending')
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
        message: inv.message,
        status: inv.status as 'pending' | 'accepted' | 'declined',
        expires_at: inv.expires_at,
        created_at: inv.created_at,
        updated_at: inv.updated_at,
        inviter_name: inv.inviter?.full_name,
        invitee_name: inv.invitee?.full_name,
        session_opponent_name: inv.session?.opponent_name
      }));

      setInvitations(typedInvitations);
    } catch (error) {
      console.error('Error in fetchInvitations:', error);
    }
  };

  const fetchParticipants = async (sessionId: string) => {
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
        joined_at: p.joined_at,
        user_name: p.user?.full_name
      }));
    } catch (error) {
      console.error('Error in fetchParticipants:', error);
      return [];
    }
  };

  const sendInvitation = async ({ sessionId, inviteeId, inviteeEmail, message }: SendInvitationParams) => {
    if (!user) return;

    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

      // Get invitee name if we have an ID
      let inviteeName = 'Unknown Player';
      if (inviteeId) {
        const { data: inviteeProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', inviteeId)
          .single();
        
        if (inviteeProfile) {
          inviteeName = inviteeProfile.full_name || 'Unknown Player';
        }
      } else if (inviteeEmail) {
        inviteeName = inviteeEmail;
      }

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
      await fetchInvitations();
    } catch (error) {
      console.error('Error in sendInvitation:', error);
      toast.error('Failed to send invitation');
    }
  };

  const acceptInvitation = async (inviteId: string) => {
    if (!user) return;

    try {
      // Get invitation details
      const { data: invitation, error: inviteError } = await supabase
        .from('match_invitations')
        .select('*')
        .eq('id', inviteId)
        .single();

      if (inviteError || !invitation) {
        toast.error('Invitation not found');
        return;
      }

      // Check if expired
      if (new Date(invitation.expires_at) < new Date()) {
        toast.error('This invitation has expired');
        return;
      }

      // Get user's full name for participant record
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const userName = userProfile?.full_name || 'Unknown Player';

      // Add to match participants
      const { error: participantError } = await supabase
        .from('match_participants')
        .insert({
          match_session_id: invitation.match_session_id,
          user_id: user.id,
          participant_name: userName,
          participant_role: 'player'
        });

      if (participantError) {
        console.error('Error adding participant:', participantError);
        toast.error('Failed to join match');
        return;
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('match_invitations')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', inviteId);

      if (updateError) {
        console.error('Error updating invitation:', updateError);
      }

      toast.success('Invitation accepted! You\'ve joined the match.');
      await fetchInvitations();
    } catch (error) {
      console.error('Error in acceptInvitation:', error);
      toast.error('Failed to accept invitation');
    }
  };

  const declineInvitation = async (inviteId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('match_invitations')
        .update({ status: 'declined', updated_at: new Date().toISOString() })
        .eq('id', inviteId);

      if (error) {
        console.error('Error declining invitation:', error);
        toast.error('Failed to decline invitation');
        return;
      }

      toast.success('Invitation declined');
      await fetchInvitations();
    } catch (error) {
      console.error('Error in declineInvitation:', error);
      toast.error('Failed to decline invitation');
    }
  };

  const cleanupExpiredInvitations = async () => {
    if (!user) return;

    try {
      await supabase
        .from('match_invitations')
        .update({ status: 'declined' })
        .lt('expires_at', new Date().toISOString())
        .eq('status', 'pending');
    } catch (error) {
      console.error('Error cleaning up expired invitations:', error);
    }
  };

  useEffect(() => {
    if (user && !subscriptionInitialized.current) {
      const loadData = async () => {
        setLoading(true);
        await fetchInvitations();
        await cleanupExpiredInvitations();
        setLoading(false);
      };

      loadData();

      // Set up real-time subscription
      const channelName = `match-invitations-${user.id}-${Date.now()}`;
      const channel = supabase.channel(channelName);
      
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_invitations',
          filter: `or(inviter_id.eq.${user.id},invitee_id.eq.${user.id})`
        },
        (payload) => {
          console.log('Match invitation real-time update:', payload);
          
          // Show toast for new invitations
          if (payload.eventType === 'INSERT' && payload.new.invitee_id === user.id) {
            toast.info('🎾 New match invitation received!');
          }
          
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

  return {
    invitations,
    participants,
    loading,
    sendInvitation,
    acceptInvitation,
    declineInvitation,
    fetchParticipants,
    refreshInvitations: fetchInvitations
  };
}
