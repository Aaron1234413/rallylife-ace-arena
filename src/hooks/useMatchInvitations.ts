
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MatchInvitation {
  id: string;
  match_session_id: string;
  inviter_id: string;
  invitee_id?: string;
  invitee_name: string;
  invitee_email?: string;
  invitation_type: 'singles_opponent' | 'doubles_partner' | 'doubles_opponent_1' | 'doubles_opponent_2';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  expires_at: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

interface MatchParticipant {
  id: string;
  match_session_id: string;
  user_id?: string;
  participant_name: string;
  participant_role: 'creator' | 'opponent' | 'partner' | 'opponent_1' | 'opponent_2';
  is_external: boolean;
  can_edit_score: boolean;
  joined_at: string;
  created_at: string;
}

interface CreateInvitationParams {
  matchSessionId: string;
  inviteeName: string;
  inviteeId?: string;
  inviteeEmail?: string;
  invitationType: MatchInvitation['invitation_type'];
  message?: string;
}

export function useMatchInvitations() {
  const { user } = useAuth();
  const [pendingInvitations, setPendingInvitations] = useState<MatchInvitation[]>([]);
  const [sentInvitations, setSentInvitations] = useState<MatchInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch invitations for current user
  const fetchInvitations = async () => {
    if (!user) return;

    try {
      // Get invitations received by user
      const { data: received, error: receivedError } = await supabase
        .from('match_invitations')
        .select('*')
        .eq('invitee_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;

      // Get invitations sent by user
      const { data: sent, error: sentError } = await supabase
        .from('match_invitations')
        .select('*')
        .eq('inviter_id', user.id)
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      setPendingInvitations(received || []);
      setSentInvitations(sent || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Failed to load match invitations');
    } finally {
      setLoading(false);
    }
  };

  // Create invitation
  const createInvitation = async (params: CreateInvitationParams) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('match_invitations')
        .insert({
          match_session_id: params.matchSessionId,
          inviter_id: user.id,
          invitee_id: params.inviteeId,
          invitee_name: params.inviteeName,
          invitee_email: params.inviteeEmail,
          invitation_type: params.invitationType,
          message: params.message
        })
        .select()
        .single();

      if (error) throw error;

      // If invitee is an internal user, send a notification
      if (params.inviteeId) {
        toast.success(`Match invitation sent to ${params.inviteeName}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  };

  // Create match participant
  const createParticipant = async (
    matchSessionId: string,
    userId: string | null,
    participantName: string,
    participantRole: MatchParticipant['participant_role'],
    isExternal: boolean = false,
    canEditScore: boolean = false
  ) => {
    try {
      const { data, error } = await supabase
        .from('match_participants')
        .insert({
          match_session_id: matchSessionId,
          user_id: userId,
          participant_name: participantName,
          participant_role: participantRole,
          is_external: isExternal,
          can_edit_score: canEditScore
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating participant:', error);
      throw error;
    }
  };

  // Respond to invitation
  const respondToInvitation = async (invitationId: string, response: 'accepted' | 'declined') => {
    try {
      const { data, error } = await supabase
        .from('match_invitations')
        .update({
          status: response,
          responded_at: new Date().toISOString()
        })
        .eq('id', invitationId)
        .select()
        .single();

      if (error) throw error;

      // If accepted, create participant record
      if (response === 'accepted' && user) {
        const invitation = pendingInvitations.find(inv => inv.id === invitationId);
        if (invitation) {
          await createParticipant(
            invitation.match_session_id,
            user.id,
            user.email || 'Player', // Use profile name if available
            invitation.invitation_type.replace('singles_', '').replace('doubles_', '') as MatchParticipant['participant_role'],
            false,
            true // Allow editing scores when invitation is accepted
          );
        }
      }

      await fetchInvitations(); // Refresh invitations
      toast.success(`Match invitation ${response}`);
      return data;
    } catch (error) {
      console.error('Error responding to invitation:', error);
      throw error;
    }
  };

  // Get participants for a match
  const getMatchParticipants = async (matchSessionId: string): Promise<MatchParticipant[]> => {
    try {
      const { data, error } = await supabase
        .from('match_participants')
        .select('*')
        .eq('match_session_id', matchSessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching match participants:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvitations();

      // Set up real-time subscription for invitations
      const channel = supabase
        .channel('match_invitations')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'match_invitations',
            filter: `invitee_id=eq.${user.id}`
          },
          () => {
            fetchInvitations();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    pendingInvitations,
    sentInvitations,
    loading,
    createInvitation,
    createParticipant,
    respondToInvitation,
    getMatchParticipants,
    refreshInvitations: fetchInvitations
  };
}
