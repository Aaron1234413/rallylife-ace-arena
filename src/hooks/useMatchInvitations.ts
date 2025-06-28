
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MatchInvitation {
  id: string;
  created_by: string;
  invited_user_id?: string;
  invited_user_name: string;
  invited_user_email?: string;
  match_type: 'singles' | 'doubles';
  is_doubles: boolean;
  start_time: string;
  opponent_name?: string;
  opponent_id?: string;
  partner_name?: string;
  partner_id?: string;
  opponent_1_name?: string;
  opponent_1_id?: string;
  opponent_2_name?: string;
  opponent_2_id?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  created_at: string;
  expires_at: string;
  responded_at?: string;
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
        .eq('invited_user_id', user.id)
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
        .eq('created_by', user.id)
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
      const invitationData = {
        created_by: user.id,
        invited_user_id: params.invitedUserId,
        invited_user_name: params.invitedUserName,
        invited_user_email: params.invitedUserEmail,
        match_type: params.matchType,
        is_doubles: params.isDoubles,
        start_time: params.startTime.toISOString(),
        opponent_name: params.opponentName,
        opponent_id: params.opponentId,
        partner_name: params.partnerName,
        partner_id: params.partnerId,
        opponent_1_name: params.opponent1Name,
        opponent_1_id: params.opponent1Id,
        opponent_2_name: params.opponent2Name,
        opponent_2_id: params.opponent2Id,
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
        .eq('invited_user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error accepting invitation:', updateError);
        throw updateError;
      }

      // Now create the active match session
      const sessionData = {
        player_id: invitation.created_by, // The original creator becomes the session owner
        opponent_name: invitation.invited_user_name,
        opponent_id: invitation.invited_user_id,
        is_doubles: invitation.is_doubles,
        partner_name: invitation.partner_name,
        partner_id: invitation.partner_id,
        opponent_1_name: invitation.opponent_1_name,
        opponent_1_id: invitation.opponent_1_id,
        opponent_2_name: invitation.opponent_2_name,
        opponent_2_id: invitation.opponent_2_id,
        match_type: invitation.match_type,
        start_time: invitation.start_time,
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
        .eq('invited_user_id', user.id);

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
        .eq('created_by', user.id);

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
          filter: `created_by=eq.${user.id}`
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
          filter: `invited_user_id=eq.${user.id}`
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
