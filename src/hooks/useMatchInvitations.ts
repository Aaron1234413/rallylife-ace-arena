
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MatchInvitation {
  id: string;
  inviter_id: string;
  invitee_id?: string;
  invitee_name: string;
  invitee_email?: string;
  invitation_type: string;
  match_session_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  created_at: string;
  expires_at: string;
  responded_at?: string;
  updated_at: string;
}

interface CreateInvitationParams {
  invitedUserName: string;
  invitedUserId?: string;
  invitedUserEmail?: string;
  matchType: 'singles' | 'doubles';
  isDoubles: boolean;
  startTime: Date;
  opponentName?: string;
  opponentId?: string;
  partnerName?: string;
  partnerId?: string;
  opponent1Name?: string;
  opponent1Id?: string;
  opponent2Name?: string;
  opponent2Id?: string;
  message?: string;
}

export function useMatchInvitations() {
  const { user } = useAuth();
  const [receivedInvitations, setReceivedInvitations] = useState<MatchInvitation[]>([]);
  const [sentInvitations, setSentInvitations] = useState<MatchInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);

  const fetchReceivedInvitations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('match_invitations')
        .select('*')
        .eq('invitee_id', user.id)
        .in('status', ['pending'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching received invitations:', error);
        return;
      }

      setReceivedInvitations(data || []);
    } catch (error) {
      console.error('Error in fetchReceivedInvitations:', error);
    }
  };

  const fetchSentInvitations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('match_invitations')
        .select('*')
        .eq('inviter_id', user.id)
        .in('status', ['pending'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sent invitations:', error);
        return;
      }

      setSentInvitations(data || []);
    } catch (error) {
      console.error('Error in fetchSentInvitations:', error);
    }
  };

  const createInvitation = async (params: CreateInvitationParams) => {
    if (!user) return;

    try {
      // First create a temporary match session ID (we'll use this pattern)
      const tempSessionId = crypto.randomUUID();
      
      const invitationData = {
        inviter_id: user.id,
        invitee_id: params.invitedUserId,
        invitee_name: params.invitedUserName,
        invitee_email: params.invitedUserEmail,
        invitation_type: params.matchType,
        match_session_id: tempSessionId,
        message: params.message,
        status: 'pending' as const
      };

      const { data, error } = await supabase
        .from('match_invitations')
        .insert(invitationData)
        .select()
        .single();

      if (error) {
        console.error('Error creating invitation:', error);
        throw error;
      }

      console.log('Match invitation created successfully:', data);
      
      // Refresh sent invitations
      await fetchSentInvitations();
      
      return data;
    } catch (error) {
      console.error('Error in createInvitation:', error);
      throw error;
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    if (!user) return;

    try {
      // First, update the invitation status
      const { data: invitation, error: updateError } = await supabase
        .from('match_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId)
        .eq('invitee_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error accepting invitation:', updateError);
        throw updateError;
      }

      // For now, we'll create a basic active match session
      // This should be enhanced based on the invitation type
      const sessionData = {
        player_id: invitation.inviter_id,
        opponent_name: invitation.invitee_name,
        opponent_id: invitation.invitee_id,
        is_doubles: invitation.invitation_type === 'doubles',
        match_type: invitation.invitation_type,
        start_time: new Date().toISOString(),
        status: 'active' as const,
        sets: [{ playerScore: '', opponentScore: '', completed: false }],
        current_set: 0
      };

      const { data: session, error: sessionError } = await supabase
        .from('active_match_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating match session:', sessionError);
        throw sessionError;
      }

      console.log('Match session created from accepted invitation:', session);
      
      // Refresh invitations
      await fetchReceivedInvitations();
      await fetchSentInvitations();
      
      return session;
    } catch (error) {
      console.error('Error in acceptInvitation:', error);
      throw error;
    }
  };

  const declineInvitation = async (invitationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('match_invitations')
        .update({ status: 'declined' })
        .eq('id', invitationId)
        .eq('invitee_id', user.id);

      if (error) {
        console.error('Error declining invitation:', error);
        throw error;
      }

      console.log('Invitation declined successfully');
      
      // Refresh invitations
      await fetchReceivedInvitations();
      
    } catch (error) {
      console.error('Error in declineInvitation:', error);
      throw error;
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('match_invitations')
        .update({ status: 'expired' })
        .eq('id', invitationId)
        .eq('inviter_id', user.id);

      if (error) {
        console.error('Error canceling invitation:', error);
        throw error;
      }

      console.log('Invitation canceled successfully');
      
      // Refresh sent invitations
      await fetchSentInvitations();
      
    } catch (error) {
      console.error('Error in cancelInvitation:', error);
      throw error;
    }
  };

  const cleanupChannel = () => {
    if (channelRef.current) {
      console.log('Cleaning up match invitations channel subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([
          fetchReceivedInvitations(),
          fetchSentInvitations()
        ]);
        setLoading(false);
      };

      loadData();

      // Clean up any existing channel
      cleanupChannel();

      // Set up real-time subscription for invitations
      const channelName = `match-invitations-${user.id}-${Date.now()}`;
      const channel = supabase.channel(channelName);
      
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_invitations',
          filter: `inviter_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Match invitation update (sent):', payload);
          fetchSentInvitations();
        }
      );

      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_invitations',
          filter: `invitee_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Match invitation update (received):', payload);
          fetchReceivedInvitations();
        }
      );

      channel.subscribe((status) => {
        console.log('Match invitations channel subscription status:', status);
      });

      channelRef.current = channel;

      return () => {
        cleanupChannel();
      };
    } else {
      cleanupChannel();
      setReceivedInvitations([]);
      setSentInvitations([]);
      setLoading(false);
    }
  }, [user]);

  return {
    receivedInvitations,
    sentInvitations,
    loading,
    createInvitation,
    acceptInvitation,
    declineInvitation,
    cancelInvitation,
    refreshInvitations: () => {
      fetchReceivedInvitations();
      fetchSentInvitations();
    }
  };
}
