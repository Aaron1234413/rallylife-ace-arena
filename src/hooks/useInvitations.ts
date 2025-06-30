import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Invitation {
  id: string;
  inviter_id: string;
  invitee_id?: string;
  invitee_name: string;
  invitee_email?: string;
  invitation_type: string;
  invitation_category: 'match' | 'social_play';
  match_session_id: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  created_at: string;
  expires_at: string;
  responded_at?: string;
  updated_at: string;
  session_data?: Record<string, any>;
}

interface CreateMatchInvitationParams {
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

interface CreateSocialPlayInvitationParams {
  invitedUserName: string;
  invitedUserId?: string;
  invitedUserEmail?: string;
  sessionType: 'singles' | 'doubles';
  eventTitle: string;
  location: string;
  scheduledTime: Date;
  description?: string;
  message?: string;
}

// Helper function to cast database response to our interface
const toInvitation = (data: any): Invitation => ({
  id: data.id,
  inviter_id: data.inviter_id,
  invitee_id: data.invitee_id,
  invitee_name: data.invitee_name,
  invitee_email: data.invitee_email,
  invitation_type: data.invitation_type,
  invitation_category: data.invitation_category as 'match' | 'social_play',
  match_session_id: data.match_session_id,
  status: data.status as 'pending' | 'accepted' | 'declined' | 'expired',
  message: data.message,
  created_at: data.created_at,
  expires_at: data.expires_at,
  responded_at: data.responded_at,
  updated_at: data.updated_at,
  session_data: data.session_data || {},
});

export function useInvitations() {
  const { user } = useAuth();
  const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>([]);
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const subscriptionInitialized = useRef(false);

  const fetchReceivedInvitations = async () => {
    if (!user) return;

    try {
      console.log('🔍 [INVITATIONS] Fetching received invitations for user:', user.id);
      const { data, error } = await supabase
        .from('match_invitations')
        .select('*')
        .eq('invitee_id', user.id)
        .in('status', ['pending'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [INVITATIONS] Error fetching received invitations:', error);
        return;
      }

      const invitations = (data || []).map(toInvitation);
      console.log('✅ [INVITATIONS] Fetched received invitations:', {
        count: invitations.length,
        invitations: invitations.map(i => ({
          id: i.id,
          from: i.invitee_name,
          type: i.invitation_type,
          category: i.invitation_category,
          status: i.status
        }))
      });
      
      setReceivedInvitations(invitations);
    } catch (error) {
      console.error('💥 [INVITATIONS] Error in fetchReceivedInvitations:', error);
    }
  };

  const fetchSentInvitations = async () => {
    if (!user) return;

    try {
      console.log('🔍 [INVITATIONS] Fetching sent invitations for user:', user.id);
      const { data, error } = await supabase
        .from('match_invitations')
        .select('*')
        .eq('inviter_id', user.id)
        .in('status', ['pending'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [INVITATIONS] Error fetching sent invitations:', error);
        return;
      }

      const invitations = (data || []).map(toInvitation);
      console.log('✅ [INVITATIONS] Fetched sent invitations:', {
        count: invitations.length,
        invitations: invitations.map(i => ({
          id: i.id,
          to: i.invitee_name,
          type: i.invitation_type,
          category: i.invitation_category,
          status: i.status
        }))
      });
      
      setSentInvitations(invitations);
    } catch (error) {
      console.error('💥 [INVITATIONS] Error in fetchSentInvitations:', error);
    }
  };

  const createSocialPlayInvitation = async (params: CreateSocialPlayInvitationParams) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('🚀 [INVITATIONS] Creating social play invitation with params:', {
        invitedUserName: params.invitedUserName,
        sessionType: params.sessionType,
        eventTitle: params.eventTitle
      });

      // Find the session by title to link the invitation
      const { data: sessions, error: sessionError } = await supabase
        .from('social_play_sessions')
        .select('id')
        .eq('created_by', user.id)
        .eq('notes', params.eventTitle)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessionError) {
        console.error('Error finding session:', sessionError);
      }

      const sessionId = sessions?.[0]?.id || null;

      const invitationData = {
        inviter_id: user.id,
        invitee_id: params.invitedUserId || null,
        invitee_name: params.invitedUserName,
        invitee_email: params.invitedUserEmail || null,
        invitation_type: params.sessionType,
        invitation_category: 'social_play' as const,
        match_session_id: sessionId, // Link to the social play session
        message: params.message || null,
        status: 'pending' as const,
        session_data: {
          sessionType: params.sessionType,
          eventTitle: params.eventTitle,
          location: params.location,
          scheduledTime: params.scheduledTime.toISOString(),
          description: params.description,
          sessionId: sessionId,
        }
      };

      console.log('📤 [INVITATIONS] Sending social play invitation data to database:', invitationData);

      const { data, error } = await supabase
        .from('match_invitations')
        .insert(invitationData)
        .select()
        .single();

      if (error) {
        console.error('❌ [INVITATIONS] Database error creating social play invitation:', error);
        throw new Error(`Failed to create invitation: ${error.message}`);
      }

      console.log('✅ [INVITATIONS] Social play invitation created successfully:', data);
      
      await fetchSentInvitations();
      
      return toInvitation(data);
    } catch (error) {
      console.error('💥 [INVITATIONS] Error in createSocialPlayInvitation:', error);
      throw error;
    }
  };

  const createMatchInvitation = async (params: CreateMatchInvitationParams) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('🚀 [INVITATIONS] Creating match invitation with params:', {
        invitedUserName: params.invitedUserName,
        matchType: params.matchType,
        isDoubles: params.isDoubles
      });

      const invitationData = {
        inviter_id: user.id,
        invitee_id: params.invitedUserId || null,
        invitee_name: params.invitedUserName,
        invitee_email: params.invitedUserEmail || null,
        invitation_type: params.matchType,
        invitation_category: 'match' as const,
        match_session_id: null,
        message: params.message || null,
        status: 'pending' as const,
        session_data: {
          matchType: params.matchType,
          isDoubles: params.isDoubles,
          startTime: params.startTime.toISOString(),
          opponentName: params.opponentName,
          opponentId: params.opponentId,
          partnerName: params.partnerName,
          partnerId: params.partnerId,
          opponent1Name: params.opponent1Name,
          opponent1Id: params.opponent1Id,
          opponent2Name: params.opponent2Name,
          opponent2Id: params.opponent2Id,
        }
      };

      console.log('📤 [INVITATIONS] Sending match invitation data to database:', invitationData);

      const { data, error } = await supabase
        .from('match_invitations')
        .insert(invitationData)
        .select()
        .single();

      if (error) {
        console.error('❌ [INVITATIONS] Database error creating match invitation:', error);
        throw new Error(`Failed to create invitation: ${error.message}`);
      }

      console.log('✅ [INVITATIONS] Match invitation created successfully:', data);
      
      await fetchSentInvitations();
      
      return toInvitation(data);
    } catch (error) {
      console.error('💥 [INVITATIONS] Error in createMatchInvitation:', error);
      throw error;
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    if (!user) return;

    try {
      console.log('✅ [INVITATIONS] Accepting invitation:', invitationId);

      const { data: invitation, error: fetchError } = await supabase
        .from('match_invitations')
        .select('*')
        .eq('id', invitationId)
        .eq('invitee_id', user.id)
        .single();

      if (fetchError || !invitation) {
        console.error('❌ [INVITATIONS] Error fetching invitation:', fetchError);
        throw new Error('Invitation not found');
      }

      if (invitation.invitation_category === 'match') {
        // Handle match invitation acceptance
        console.log('🎾 [INVITATIONS] Creating match session for accepted invitation...');

        const sessionData = {
          player_id: invitation.inviter_id,
          opponent_name: user.email?.split('@')[0] || 'Unknown',
          opponent_id: user.id,
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
          console.error('❌ [INVITATIONS] Error creating match session:', sessionError);
          throw sessionError;
        }

        // Update the invitation with session link
        const { error: updateError } = await supabase
          .from('match_invitations')
          .update({
            status: 'accepted',
            match_session_id: session.id,
            responded_at: new Date().toISOString()
          })
          .eq('id', invitationId)
          .eq('invitee_id', user.id);

        if (updateError) throw updateError;

        toast.success('Match invitation accepted! Match session created.');
        return session;
      } else {
        // Handle social play invitation acceptance
        console.log('👥 [INVITATIONS] Accepting social play invitation...');
        
        // Update invitation status
        const { error: updateError } = await supabase
          .from('match_invitations')
          .update({
            status: 'accepted',
            responded_at: new Date().toISOString()
          })
          .eq('id', invitationId)
          .eq('invitee_id', user.id);

        if (updateError) throw updateError;

        // If there's a linked session, add the user as a participant
        if (invitation.match_session_id) {
          const { error: participantError } = await supabase
            .from('social_play_participants')
            .insert({
              session_id: invitation.match_session_id,
              user_id: user.id,
              session_creator_id: invitation.inviter_id,
              status: 'joined',
              role: 'invited_player',
              joined_at: new Date().toISOString()
            });

          // Don't throw error if participant already exists
          if (participantError && !participantError.message.includes('duplicate')) {
            console.error('Error adding participant:', participantError);
          }
        }

        toast.success('Social play invitation accepted! You\'ve joined the event.');
        return { accepted: true, invitation_category: 'social_play', session_id: invitation.match_session_id };
      }
    } catch (error) {
      console.error('💥 [INVITATIONS] Error in acceptInvitation:', error);
      toast.error('Failed to accept invitation');
      throw error;
    } finally {
      await fetchReceivedInvitations();
      await fetchSentInvitations();
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
      toast.success('Invitation declined');
      
      await fetchReceivedInvitations();
      await fetchSentInvitations();
      
    } catch (error) {
      console.error('Error in declineInvitation:', error);
      toast.error('Failed to decline invitation');
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
      toast.success('Invitation canceled');
      
      await fetchSentInvitations();
      
    } catch (error) {
      console.error('Error in cancelInvitation:', error);
      toast.error('Failed to cancel invitation');
      throw error;
    }
  };

  // Filter invitations by category
  const getInvitationsByCategory = (category: 'match' | 'social_play') => ({
    received: receivedInvitations.filter(inv => inv.invitation_category === category),
    sent: sentInvitations.filter(inv => inv.invitation_category === category)
  });

  const cleanupChannel = () => {
    if (channelRef.current) {
      console.log('🧹 [INVITATIONS] Cleaning up invitations channel subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      subscriptionInitialized.current = false;
    }
  };

  const refreshInvitations = async () => {
    console.log('🔄 [INVITATIONS] Manually refreshing all invitations...');
    setLoading(true);
    await Promise.all([
      fetchReceivedInvitations(),
      fetchSentInvitations()
    ]);
    setLoading(false);
    console.log('✅ [INVITATIONS] Manual refresh completed');
  };

  useEffect(() => {
    if (user && !subscriptionInitialized.current) {
      const loadData = async () => {
        console.log('🏗️ [INVITATIONS] Initial data load started for user:', user.id);
        setLoading(true);
        await Promise.all([
          fetchReceivedInvitations(),
          fetchSentInvitations()
        ]);
        setLoading(false);
        console.log('✅ [INVITATIONS] Initial data load completed');
      };

      loadData();

      cleanupChannel();

      const channelName = `invitations-${user.id}-${Date.now()}`;
      console.log('📡 [INVITATIONS] Setting up real-time channel:', channelName);
      
      const channel = supabase.channel(channelName);
      
      // Listen for sent invitations changes
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_invitations',
          filter: `inviter_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📨 [INVITATIONS] Real-time update for sent invitations:', payload);
          fetchSentInvitations();
        }
      );

      // Listen for received invitations changes
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_invitations',
          filter: `invitee_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📨 [INVITATIONS] Real-time update for received invitations:', payload);
          fetchReceivedInvitations();
        }
      );

      channel.subscribe((status) => {
        console.log('📡 [INVITATIONS] Channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          subscriptionInitialized.current = true;
          console.log('✅ [INVITATIONS] Real-time subscription active');
        }
      });

      channelRef.current = channel;

      return () => {
        cleanupChannel();
      };
    } else if (!user) {
      cleanupChannel();
      setReceivedInvitations([]);
      setSentInvitations([]);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    return () => {
      cleanupChannel();
    };
  }, []);

  return {
    // All invitations
    receivedInvitations,
    sentInvitations,
    loading,
    
    // Creation methods
    createMatchInvitation,
    createSocialPlayInvitation,
    
    // Action methods
    acceptInvitation,
    declineInvitation,
    cancelInvitation,
    refreshInvitations,
    
    // Utility methods
    getInvitationsByCategory,
    
    // Legacy compatibility for match invitations
    createInvitation: createMatchInvitation,
  };
}
