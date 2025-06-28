
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
  const subscriptionInitialized = useRef(false);

  const fetchReceivedInvitations = async () => {
    if (!user) return;

    try {
      console.log('🔍 [DATA FLOW] Fetching received invitations for user:', user.id);
      const { data, error } = await supabase
        .from('match_invitations')
        .select('*')
        .eq('invitee_id', user.id)
        .in('status', ['pending'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [DATA FLOW] Error fetching received invitations:', error);
        return;
      }

      const invitations = (data || []).map(toMatchInvitation);
      console.log('✅ [DATA FLOW] Fetched received invitations:', {
        count: invitations.length,
        invitations: invitations.map(i => ({
          id: i.id,
          from: i.invitee_name,
          type: i.invitation_type,
          status: i.status
        }))
      });
      
      setReceivedInvitations(invitations);
    } catch (error) {
      console.error('💥 [DATA FLOW] Error in fetchReceivedInvitations:', error);
    }
  };

  const fetchSentInvitations = async () => {
    if (!user) return;

    try {
      console.log('🔍 [DATA FLOW] Fetching sent invitations for user:', user.id);
      const { data, error } = await supabase
        .from('match_invitations')
        .select('*')
        .eq('inviter_id', user.id)
        .in('status', ['pending'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [DATA FLOW] Error fetching sent invitations:', error);
        return;
      }

      const invitations = (data || []).map(toMatchInvitation);
      console.log('✅ [DATA FLOW] Fetched sent invitations:', {
        count: invitations.length,
        invitations: invitations.map(i => ({
          id: i.id,
          to: i.invitee_name,
          type: i.invitation_type,
          status: i.status
        }))
      });
      
      setSentInvitations(invitations);
    } catch (error) {
      console.error('💥 [DATA FLOW] Error in fetchSentInvitations:', error);
    }
  };

  const createInvitation = async (params: CreateInvitationParams) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('🚀 [DATA FLOW] Creating invitation with params:', {
        invitedUserName: params.invitedUserName,
        matchType: params.matchType,
        isDoubles: params.isDoubles
      });

      // Generate a unique session ID for this invitation
      const sessionId = crypto.randomUUID();
      
      // Create invitation data with proper field mapping
      const invitationData = {
        inviter_id: user.id,
        invitee_id: params.invitedUserId || null,
        invitee_name: params.invitedUserName,
        invitee_email: params.invitedUserEmail || null,
        invitation_type: params.matchType, // Use matchType directly ('singles' or 'doubles')
        match_session_id: sessionId,
        message: params.message || null,
        status: 'pending' as const
      };

      console.log('📤 [DATA FLOW] Sending invitation data to database:', invitationData);

      const { data, error } = await supabase
        .from('match_invitations')
        .insert(invitationData)
        .select()
        .single();

      if (error) {
        console.error('❌ [DATA FLOW] Database error creating invitation:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Failed to create invitation: ${error.message}`);
      }

      console.log('✅ [DATA FLOW] Match invitation created successfully:', {
        id: data.id,
        inviter_id: data.inviter_id,
        invitee_name: data.invitee_name,
        invitation_type: data.invitation_type,
        status: data.status
      });
      
      // Force refresh sent invitations immediately to update UI
      console.log('🔄 [DATA FLOW] Refreshing sent invitations after creation...');
      await fetchSentInvitations();
      
      return toMatchInvitation(data);
    } catch (error) {
      console.error('💥 [DATA FLOW] Error in createInvitation:', error);
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
      console.log('🧹 [DATA FLOW] Cleaning up match invitations channel subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      subscriptionInitialized.current = false;
    }
  };

  // Manual refresh function that can be called from components
  const refreshInvitations = async () => {
    console.log('🔄 [DATA FLOW] Manually refreshing all invitations...');
    await Promise.all([
      fetchReceivedInvitations(),
      fetchSentInvitations()
    ]);
    console.log('✅ [DATA FLOW] Manual refresh completed');
  };

  useEffect(() => {
    if (user && !subscriptionInitialized.current) {
      const loadData = async () => {
        console.log('🏗️ [DATA FLOW] Initial data load started for user:', user.id);
        setLoading(true);
        await Promise.all([
          fetchReceivedInvitations(),
          fetchSentInvitations()
        ]);
        setLoading(false);
        console.log('✅ [DATA FLOW] Initial data load completed');
      };

      loadData();

      // Clean up any existing channel
      cleanupChannel();

      // Set up real-time subscription for invitations with unique channel name
      const channelName = `match-invitations-${user.id}-${Date.now()}`;
      console.log('📡 [DATA FLOW] Setting up real-time channel:', channelName);
      
      const channel = supabase.channel(channelName);
      
      // Listen for changes to invitations where user is the inviter (sent invitations)
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_invitations',
          filter: `inviter_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📨 [DATA FLOW] Real-time update for sent invitations:', {
            event: payload.eventType,
            id: payload.new && typeof payload.new === 'object' && 'id' in payload.new ? payload.new.id : 
                payload.old && typeof payload.old === 'object' && 'id' in payload.old ? payload.old.id : 'unknown',
            status: payload.new && typeof payload.new === 'object' && 'status' in payload.new ? payload.new.status : 'deleted'
          });
          fetchSentInvitations();
        }
      );

      // Listen for changes to invitations where user is the invitee (received invitations)
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_invitations',
          filter: `invitee_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📨 [DATA FLOW] Real-time update for received invitations:', {
            event: payload.eventType,
            id: payload.new && typeof payload.new === 'object' && 'id' in payload.new ? payload.new.id : 
                payload.old && typeof payload.old === 'object' && 'id' in payload.old ? payload.old.id : 'unknown',
            status: payload.new && typeof payload.new === 'object' && 'status' in payload.new ? payload.new.status : 'deleted'
          });
          fetchReceivedInvitations();
        }
      );

      // Subscribe to the channel
      channel.subscribe((status) => {
        console.log('📡 [DATA FLOW] Channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          subscriptionInitialized.current = true;
          console.log('✅ [DATA FLOW] Real-time subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ [DATA FLOW] Channel subscription error');
          subscriptionInitialized.current = false;
        } else if (status === 'TIMED_OUT') {
          console.warn('⏰ [DATA FLOW] Channel subscription timed out');
          subscriptionInitialized.current = false;
        }
      });

      channelRef.current = channel;

      return () => {
        cleanupChannel();
      };
    } else if (!user) {
      // Clean up when user logs out
      console.log('👋 [DATA FLOW] User logged out, cleaning up data');
      cleanupChannel();
      setReceivedInvitations([]);
      setSentInvitations([]);
      setLoading(false);
    }
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🏁 [DATA FLOW] Component unmounting, cleaning up');
      cleanupChannel();
    };
  }, []);

  // Debug state changes
  useEffect(() => {
    console.log('📊 [DATA FLOW] State update - Received invitations:', {
      count: receivedInvitations.length,
      ids: receivedInvitations.map(i => i.id)
    });
  }, [receivedInvitations]);

  useEffect(() => {
    console.log('📊 [DATA FLOW] State update - Sent invitations:', {
      count: sentInvitations.length,
      ids: sentInvitations.map(i => i.id)
    });
  }, [sentInvitations]);

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
