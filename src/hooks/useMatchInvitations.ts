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

// Helper function to cast database response to our interface
const toMatchInvitation = (data: any): MatchInvitation => ({
  id: data.id,
  inviter_id: data.inviter_id,
  invitee_id: data.invitee_id,
  invitee_name: data.invitee_name,
  invitee_email: data.invitee_email,
  invitation_type: data.invitation_type,
  match_session_id: data.match_session_id,
  status: data.status as 'pending' | 'accepted' | 'declined' | 'expired',
  message: data.message,
  created_at: data.created_at,
  expires_at: data.expires_at,
  responded_at: data.responded_at,
  updated_at: data.updated_at,
});

export function useMatchInvitations() {
  const { user } = useAuth();
  const [receivedInvitations, setReceivedInvitations] = useState<MatchInvitation[]>([]);
  const [sentInvitations, setSentInvitations] = useState<MatchInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);

  const fetchReceivedInvitations = async () => {
    if (!user) return;

    try {
      console.log('Fetching received invitations for user:', user.id);
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

      console.log('Fetched received invitations:', data);
      setReceivedInvitations((data || []).map(toMatchInvitation));
    } catch (error) {
      console.error('Error in fetchReceivedInvitations:', error);
    }
  };

  const fetchSentInvitations = async () => {
    if (!user) return;

    try {
      console.log('Fetching sent invitations for user:', user.id);
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

      console.log('Fetched sent invitations:', data);
      setSentInvitations((data || []).map(toMatchInvitation));
    } catch (error) {
      console.error('Error in fetchSentInvitations:', error);
    }
  };

  const createInvitation = async (params: CreateInvitationParams) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Generate a unique session ID for this invitation
      const sessionId = crypto.randomUUID();
      
      // Simplified invitation data - using match_type instead of invitation_type to avoid constraint issues
      const invitationData = {
        inviter_id: user.id,
        invitee_id: params.invitedUserId || null,
        invitee_name: params.invitedUserName,
        invitee_email: params.invitedUserEmail || null,
        invitation_type: params.matchType, // This should be 'singles' or 'doubles'
        match_session_id: sessionId,
        message: params.message || null,
        status: 'pending' as const
      };

      console.log('Creating invitation with data:', invitationData);

      // First check what columns actually exist in the table
      const { data: tableInfo, error: tableError } = await supabase
        .from('match_invitations')
        .select('*')
        .limit(0);

      if (tableError) {
        console.error('Error checking table structure:', tableError);
      }

      const { data, error } = await supabase
        .from('match_invitations')
        .insert(invitationData)
        .select()
        .single();

      if (error) {
        console.error('Detailed error creating invitation:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Failed to create invitation: ${error.message}`);
      }

      console.log('Match invitation created successfully:', data);
      
      // Force refresh sent invitations immediately
      await fetchSentInvitations();
      
      return toMatchInvitation(data);
    } catch (error) {
      console.error('Error in createInvitation:', error);
      throw error;
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    if (!user) return;

    try {
      console.log('Accepting invitation:', invitationId);

      // Get the invitation details first
      const { data: invitation, error: fetchError } = await supabase
        .from('match_invitations')
        .select('*')
        .eq('id', invitationId)
        .eq('invitee_id', user.id)
        .single();

      if (fetchError || !invitation) {
        console.error('Error fetching invitation:', fetchError);
        throw new Error('Invitation not found');
      }

      // Update the invitation status to accepted
      const { error: updateError } = await supabase
        .from('match_invitations')
        .update({ 
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', invitationId)
        .eq('invitee_id', user.id);

      if (updateError) {
        console.error('Error updating invitation:', updateError);
        throw updateError;
      }

      // Create an active match session based on the invitation
      const sessionData = {
        player_id: invitation.inviter_id, // The person who sent the invitation
        opponent_name: user.email?.split('@')[0] || 'Unknown', // Current user becomes the opponent
        opponent_id: user.id,
        is_doubles: invitation.invitation_type === 'doubles',
        match_type: invitation.invitation_type,
        start_time: new Date().toISOString(),
        status: 'active' as const,
        sets: [{ playerScore: '', opponentScore: '', completed: false }],
        current_set: 0
      };

      console.log('Creating match session:', sessionData);

      const { data: session, error: sessionError } = await supabase
        .from('active_match_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating match session:', sessionError);
        throw sessionError;
      }

      console.log('Match session created successfully:', session);
      
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
        .update({ 
          status: 'declined',
          responded_at: new Date().toISOString()
        })
        .eq('id', invitationId)
        .eq('invitee_id', user.id);

      if (error) {
        console.error('Error declining invitation:', error);
        throw error;
      }

      console.log('Invitation declined successfully');
      
      // Refresh invitations
      await fetchReceivedInvitations();
      await fetchSentInvitations();
      
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
        .update({ 
          status: 'expired',
          responded_at: new Date().toISOString()
        })
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

  // Manual refresh function that can be called from components
  const refreshInvitations = async () => {
    console.log('Manually refreshing invitations...');
    await Promise.all([
      fetchReceivedInvitations(),
      fetchSentInvitations()
    ]);
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
    refreshInvitations
  };
}
