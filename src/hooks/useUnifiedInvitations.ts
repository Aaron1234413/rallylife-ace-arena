import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Unified invitation interface that works for both match and social play
interface UnifiedInvitation {
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
  stakes_tokens?: number;
  stakes_premium_tokens?: number;
  challenge_id?: string;
  is_challenge?: boolean;
}

// Create match invitation parameters
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

// Create social play invitation parameters
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
const toUnifiedInvitation = (data: any): UnifiedInvitation => ({
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
  stakes_tokens: data.stakes_tokens || 0,
  stakes_premium_tokens: data.stakes_premium_tokens || 0,
  challenge_id: data.challenge_id,
  is_challenge: data.is_challenge || false,
});

export function useUnifiedInvitations() {
  const { user } = useAuth();
  const [receivedInvitations, setReceivedInvitations] = useState<UnifiedInvitation[]>([]);
  const [sentInvitations, setSentInvitations] = useState<UnifiedInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);
  const subscriptionInitialized = useRef(false);
  const isSubscribing = useRef(false);

  const fetchReceivedInvitations = async () => {
    if (!user) return;

    try {
      console.log('🔍 [UNIFIED] Fetching received invitations for user:', user.id);
      const { data, error } = await supabase
        .from('match_invitations')
        .select('*')
        .eq('invitee_id', user.id)
        .in('status', ['pending'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [UNIFIED] Error fetching received invitations:', error);
        setError(`Failed to fetch invitations: ${error.message}`);
        return;
      }

      const invitations = (data || []).map(toUnifiedInvitation);
      console.log('✅ [UNIFIED] Fetched received invitations:', {
        count: invitations.length,
        breakdown: {
          match: invitations.filter(i => i.invitation_category === 'match').length,
          social_play: invitations.filter(i => i.invitation_category === 'social_play').length
        }
      });
      
      setReceivedInvitations(invitations);
      setError(null);
    } catch (error) {
      console.error('💥 [UNIFIED] Error in fetchReceivedInvitations:', error);
      setError('Failed to load invitations');
    }
  };

  const fetchSentInvitations = async () => {
    if (!user) return;

    try {
      console.log('🔍 [UNIFIED] Fetching sent invitations for user:', user.id);
      const { data, error } = await supabase
        .from('match_invitations')
        .select('*')
        .eq('inviter_id', user.id)
        .in('status', ['pending'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [UNIFIED] Error fetching sent invitations:', error);
        setError(`Failed to fetch sent invitations: ${error.message}`);
        return;
      }

      const invitations = (data || []).map(toUnifiedInvitation);
      console.log('✅ [UNIFIED] Fetched sent invitations:', {
        count: invitations.length,
        breakdown: {
          match: invitations.filter(i => i.invitation_category === 'match').length,
          social_play: invitations.filter(i => i.invitation_category === 'social_play').length
        }
      });
      
      setSentInvitations(invitations);
      setError(null);
    } catch (error) {
      console.error('💥 [UNIFIED] Error in fetchSentInvitations:', error);
      setError('Failed to load sent invitations');
    }
  };

  const createMatchInvitation = async (params: CreateMatchInvitationParams) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('🚀 [UNIFIED] Creating match invitation with params:', {
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
        match_session_id: null, // Will be set when invitation is accepted
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

      console.log('📤 [UNIFIED] Sending match invitation data to database');

      const { data, error } = await supabase
        .from('match_invitations')
        .insert(invitationData)
        .select()
        .single();

      if (error) {
        console.error('❌ [UNIFIED] Database error creating match invitation:', error);
        throw new Error(`Failed to create invitation: ${error.message}`);
      }

      console.log('✅ [UNIFIED] Match invitation created successfully:', data);
      
      await fetchSentInvitations();
      
      return toUnifiedInvitation(data);
    } catch (error) {
      console.error('💥 [UNIFIED] Error in createMatchInvitation:', error);
      throw error;
    }
  };

  const createSocialPlayInvitation = async (params: CreateSocialPlayInvitationParams) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('🚀 [UNIFIED] Creating social play invitation with params:', {
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

      console.log('📤 [UNIFIED] Sending social play invitation data to database');

      const { data, error } = await supabase
        .from('match_invitations')
        .insert(invitationData)
        .select()
        .single();

      if (error) {
        console.error('❌ [UNIFIED] Database error creating social play invitation:', error);
        throw new Error(`Failed to create invitation: ${error.message}`);
      }

      console.log('✅ [UNIFIED] Social play invitation created successfully:', data);
      
      await fetchSentInvitations();
      
      return toUnifiedInvitation(data);
    } catch (error) {
      console.error('💥 [UNIFIED] Error in createSocialPlayInvitation:', error);
      throw error;
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    if (!user) return;

    try {
      console.log('✅ [UNIFIED] Accepting invitation:', invitationId);

      const { data: invitation, error: fetchError } = await supabase
        .from('match_invitations')
        .select('*')
        .eq('id', invitationId)
        .eq('invitee_id', user.id)
        .single();

      if (fetchError || !invitation) {
        console.error('❌ [UNIFIED] Error fetching invitation:', fetchError);
        throw new Error('Invitation not found');
      }

      // Validate token balance for stakes-based challenges
      if (invitation.is_challenge && invitation.stakes_tokens > 0) {
        console.log('💰 [UNIFIED] Validating token balance for stakes challenge...');
        
        const { data: tokenBalance, error: balanceError } = await supabase
          .from('token_balances')
          .select('regular_tokens, premium_tokens')
          .eq('player_id', user.id)
          .single();

        if (balanceError || !tokenBalance) {
          throw new Error('Unable to verify token balance');
        }

        if (tokenBalance.regular_tokens < invitation.stakes_tokens) {
          throw new Error(`Insufficient tokens. You need ${invitation.stakes_tokens} tokens but only have ${tokenBalance.regular_tokens}`);
        }

        // Escrow the invitee's tokens (match the stakes)
        console.log('🔒 [UNIFIED] Escrowing invitee tokens for challenge...');
        const escrowResult = await supabase.rpc('spend_tokens', {
          user_id: user.id,
          amount: invitation.stakes_tokens,
          token_type: 'regular',
          source: 'challenge_stakes',
          description: 'Stakes escrowed for challenge acceptance'
        });

        if (escrowResult.error) {
          throw new Error('Failed to escrow tokens for challenge');
        }
      }

      if (invitation.invitation_category === 'match') {
        // Handle match invitation acceptance
        console.log('🎾 [UNIFIED] Creating match session for accepted invitation...');

        const sessionData = {
          player_id: invitation.inviter_id,
          opponent_name: user.email?.split('@')[0] || 'Unknown',
          opponent_id: user.id,
          is_doubles: invitation.invitation_type === 'doubles',
          match_type: invitation.invitation_type,
          start_time: new Date().toISOString(),
          status: 'active' as const,
          sets: [{ playerScore: '', opponentScore: '', completed: false }],
          current_set: 0,
          // Add stakes information to session metadata
          match_notes: invitation.is_challenge ? `Challenge stakes: ${invitation.stakes_tokens} tokens` : null
        };

        const { data: session, error: sessionError } = await supabase
          .from('active_match_sessions')
          .insert(sessionData)
          .select()
          .single();

        if (sessionError) {
          console.error('❌ [UNIFIED] Error creating match session:', sessionError);
          // If session creation fails and we escrowed tokens, we should refund them
          if (invitation.is_challenge && invitation.stakes_tokens > 0) {
            await supabase.rpc('add_tokens', {
              user_id: user.id,
              amount: invitation.stakes_tokens,
              token_type: 'regular',
              source: 'challenge_refund',
              description: 'Refund for failed challenge acceptance'
            });
          }
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

        console.log('✅ [UNIFIED] Match invitation accepted and session created');
        
        if (invitation.is_challenge) {
          toast.success(`Challenge accepted! Match started with ${invitation.stakes_tokens} token stakes!`);
        } else {
          toast.success('Match invitation accepted! Match started!');
        }
        
        return { type: 'match', session, stakes: invitation.stakes_tokens || 0 };

      } else {
        // Handle social play invitation acceptance
        console.log('👥 [UNIFIED] Accepting social play invitation...');
        
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

        console.log('✅ [UNIFIED] Social play invitation accepted');
        toast.success('Social play invitation accepted!');
        
        return { type: 'social_play', session_id: invitation.match_session_id };
      }
    } catch (error) {
      console.error('💥 [UNIFIED] Error in acceptInvitation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to accept invitation');
      throw error;
    } finally {
      await fetchReceivedInvitations();
      await fetchSentInvitations();
    }
  };

  const declineInvitation = async (invitationId: string) => {
    if (!user) return;

    try {
      console.log('❌ [UNIFIED] Declining invitation:', invitationId);

      // First fetch the invitation to check for stakes and refund to inviter
      const { data: invitation, error: fetchError } = await supabase
        .from('match_invitations')
        .select('*')
        .eq('id', invitationId)
        .eq('invitee_id', user.id)
        .single();

      if (fetchError || !invitation) {
        console.error('❌ [UNIFIED] Error fetching invitation for decline:', fetchError);
        throw new Error('Invitation not found');
      }

      // Refund escrowed tokens to the inviter if it's a challenge
      if (invitation.is_challenge && invitation.stakes_tokens > 0) {
        console.log('💰 [UNIFIED] Refunding escrowed tokens to inviter for declined challenge...');
        await supabase.rpc('add_tokens', {
          user_id: invitation.inviter_id,
          amount: invitation.stakes_tokens,
          token_type: 'regular',
          source: 'challenge_refund',
          description: 'Refund for declined challenge invitation'
        });
      }

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

      console.log('✅ [UNIFIED] Invitation declined successfully');
      
      if (invitation.is_challenge && invitation.stakes_tokens > 0) {
        toast.success(`Challenge declined and ${invitation.stakes_tokens} tokens refunded to challenger`);
      } else {
        toast.success('Invitation declined');
      }
      
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
      console.log('❌ [UNIFIED] Canceling invitation:', invitationId);

      // First fetch the invitation to check for stakes
      const { data: invitation, error: fetchError } = await supabase
        .from('match_invitations')
        .select('*')
        .eq('id', invitationId)
        .eq('inviter_id', user.id)
        .single();

      if (fetchError || !invitation) {
        console.error('❌ [UNIFIED] Error fetching invitation for cancellation:', fetchError);
        throw new Error('Invitation not found');
      }

      // Refund escrowed tokens if it's a challenge
      if (invitation.is_challenge && invitation.stakes_tokens > 0) {
        console.log('💰 [UNIFIED] Refunding escrowed tokens for canceled challenge...');
        await supabase.rpc('add_tokens', {
          user_id: user.id,
          amount: invitation.stakes_tokens,
          token_type: 'regular',
          source: 'challenge_refund',
          description: 'Refund for canceled challenge invitation'
        });
      }

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

      console.log('✅ [UNIFIED] Invitation canceled successfully');
      
      if (invitation.is_challenge && invitation.stakes_tokens > 0) {
        toast.success(`Challenge canceled and ${invitation.stakes_tokens} tokens refunded`);
      } else {
        toast.success('Invitation canceled successfully');
      }
      
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
      console.log('🧹 [UNIFIED] Cleaning up invitations channel subscription');
      try {
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.error('❌ [UNIFIED] Error removing channel:', error);
      }
      channelRef.current = null;
      subscriptionInitialized.current = false;
      isSubscribing.current = false;
    }
  };

  const refreshInvitations = async () => {
    if (!user) return;
    
    console.log('🔄 [UNIFIED] Manually refreshing all invitations...');
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchReceivedInvitations(),
        fetchSentInvitations()
      ]);
      console.log('✅ [UNIFIED] Manual refresh completed');
    } catch (error) {
      console.error('❌ [UNIFIED] Error during refresh:', error);
      setError('Failed to refresh invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !subscriptionInitialized.current && !isSubscribing.current) {
      isSubscribing.current = true;
      
      const loadData = async () => {
        console.log('🏗️ [UNIFIED] Initial data load started for user:', user.id);
        setLoading(true);
        await Promise.all([
          fetchReceivedInvitations(),
          fetchSentInvitations()
        ]);
        setLoading(false);
        console.log('✅ [UNIFIED] Initial data load completed');
      };

      loadData();

      // Clean up any existing channel
      cleanupChannel();

      // Set up real-time subscription with error handling
      const channelName = `unified-invitations-${user.id}-${Date.now()}`;
      console.log('📡 [UNIFIED] Setting up real-time channel:', channelName);
      
      try {
        const channel = supabase.channel(channelName);
        
        // Listen for changes to invitations where user is involved
        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'match_invitations',
            filter: `inviter_id=eq.${user.id}`
          },
          (payload) => {
            console.log('📨 [UNIFIED] Real-time update for sent invitations:', payload.eventType);
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
            console.log('📨 [UNIFIED] Real-time update for received invitations:', payload.eventType);
            fetchReceivedInvitations();
          }
        );

        // Subscribe to the channel with improved error handling
        channel.subscribe((status) => {
          console.log('📡 [UNIFIED] Channel subscription status:', status);
          if (status === 'SUBSCRIBED') {
            subscriptionInitialized.current = true;
            isSubscribing.current = false;
            console.log('✅ [UNIFIED] Real-time subscription active');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ [UNIFIED] Channel subscription error');
            subscriptionInitialized.current = false;
            isSubscribing.current = false;
            // Don't set error state, just log it
          } else if (status === 'TIMED_OUT') {
            console.warn('⏰ [UNIFIED] Channel subscription timed out');
            subscriptionInitialized.current = false;
            isSubscribing.current = false;
            // Don't set error state, invitations will still work without real-time
          }
        });

        channelRef.current = channel;
      } catch (error) {
        console.error('❌ [UNIFIED] Error setting up real-time subscription:', error);
        subscriptionInitialized.current = false;
        isSubscribing.current = false;
        // Don't throw error, invitations will work without real-time
      }

      return () => {
        cleanupChannel();
      };
    } else if (!user) {
      console.log('👋 [UNIFIED] User logged out, cleaning up data');
      cleanupChannel();
      setReceivedInvitations([]);
      setSentInvitations([]);
      setLoading(false);
    }
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🏁 [UNIFIED] Component unmounting, cleaning up');
      cleanupChannel();
    };
  }, []);

  return {
    // All invitations
    receivedInvitations,
    sentInvitations,
    loading,
    error,
    
    // Creation methods
    createMatchInvitation,
    createSocialPlayInvitation,
    
    // Response methods
    acceptInvitation,
    declineInvitation,
    cancelInvitation,
    
    // Utility methods
    getInvitationsByCategory,
    refreshInvitations,
  };
}