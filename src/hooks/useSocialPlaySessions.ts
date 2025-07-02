import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SocialPlaySession {
  id: string;
  created_by: string;
  session_type: 'singles' | 'doubles';
  competitive_level: 'low' | 'medium' | 'high';
  status: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';
  start_time: string | null;
  end_time: string | null;
  paused_duration: number;
  location: string | null;
  notes: string | null;
  mood: string | null;
  final_score: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateSessionParticipant {
  user_id: string;
  role: string;
}

export function useSocialPlaySessions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's social play sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['social-play-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('social_play_sessions')
        .select(`
          *,
          participants:social_play_participants(
            *,
            user:profiles!social_play_participants_user_id_fkey(id, full_name, avatar_url)
          )
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Get active session with invitation status check
  const { data: activeSession } = useQuery({
    queryKey: ['active-social-play-session', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('social_play_sessions')
        .select(`
          *,
          participants:social_play_participants(
            *,
            user:profiles!social_play_participants_user_id_fkey(id, full_name, avatar_url)
          )
        `)
        .eq('created_by', user.id)
        .in('status', ['pending', 'active', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      // Check if session is ready to activate based on accepted invitations
      if (data && data.status === 'pending') {
        const acceptedCount = await checkAcceptedInvitations(data.id);
        const minParticipants = data.session_type === 'singles' ? 2 : 4;
        
        if (acceptedCount >= minParticipants) {
          // Auto-activate session
          await activateSession(data.id);
        }
      }
      
      return data;
    },
    enabled: !!user?.id
  });

  // Check how many invitations have been accepted for a session
  const checkAcceptedInvitations = async (sessionId: string) => {
    const { data: invitations, error } = await supabase
      .from('match_invitations')
      .select('id')
      .eq('invitation_category', 'social_play')
      .eq('match_session_id', sessionId)
      .eq('status', 'accepted');
    
    if (error) {
      console.error('Error checking accepted invitations:', error);
      return 0;
    }
    
    // Include the session creator (always counts as 1)
    return (invitations?.length || 0) + 1;
  };

  // Auto-activate session when minimum participants are ready
  const activateSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('social_play_sessions')
        .update({
          status: 'active',
          start_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      if (error) throw error;
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['active-social-play-session'] });
      queryClient.invalidateQueries({ queryKey: ['social-play-sessions'] });
      
      toast({
        title: 'Session Ready!',
        description: 'Minimum participants have joined. Session is now active.',
      });
    } catch (error) {
      console.error('Error activating session:', error);
    }
  };

  // Clean up expired invitations and sessions
  const cleanupExpiredSessions = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      
      // Find sessions with expired invitations (older than 24 hours)
      const expiredTime = new Date();
      expiredTime.setHours(expiredTime.getHours() - 24);
      
      const { data: expiredSessions, error: fetchError } = await supabase
        .from('social_play_sessions')
        .select('id')
        .eq('created_by', user.id)
        .eq('status', 'pending')
        .lt('created_at', expiredTime.toISOString());
      
      if (fetchError) throw fetchError;
      
      if (expiredSessions && expiredSessions.length > 0) {
        // Cancel expired sessions
        const { error: updateError } = await supabase
          .from('social_play_sessions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .in('id', expiredSessions.map(s => s.id));
        
        if (updateError) throw updateError;
        
        // Expire related invitations
        const { error: inviteError } = await supabase
          .from('match_invitations')
          .update({
            status: 'expired',
            updated_at: new Date().toISOString()
          })
          .eq('invitation_category', 'social_play')
          .in('match_session_id', expiredSessions.map(s => s.id))
          .eq('status', 'pending');
        
        if (inviteError) throw inviteError;
      }
      
      return expiredSessions?.length || 0;
    },
    onSuccess: (cleanedCount) => {
      if (cleanedCount && cleanedCount > 0) {
        toast({
          title: 'Sessions Cleaned Up',
          description: `${cleanedCount} expired session(s) have been cancelled.`,
        });
        queryClient.invalidateQueries({ queryKey: ['social-play-sessions'] });
        queryClient.invalidateQueries({ queryKey: ['active-social-play-session'] });
      }
    }
  });

  // Create social play session (now invitation-based)
  const createSession = useMutation({
    mutationFn: async (sessionData: {
      session_type: 'singles' | 'doubles';
      competitive_level: 'low' | 'medium' | 'high';
      location?: string;
      title?: string;
      stakesTokens?: number;
      stakesPremiumTokens?: number;
      isChallenge?: boolean;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data: session, error: sessionError } = await supabase
        .from('social_play_sessions')
        .insert({
          created_by: user.id,
          session_type: sessionData.session_type,
          competitive_level: sessionData.competitive_level,
          location: sessionData.location,
          notes: sessionData.isChallenge 
            ? `${sessionData.title} - Challenge: ${sessionData.stakesTokens || 0} tokens, ${sessionData.stakesPremiumTokens || 0} premium tokens`
            : sessionData.title,
          status: 'pending' // Will be activated when invitations are accepted
        })
        .select()
        .single();
      
      if (sessionError) throw sessionError;

      // Add creator as a participant automatically
      const { error: participantError } = await supabase
        .from('social_play_participants')
        .insert({
          session_id: session.id,
          user_id: user.id,
          session_creator_id: user.id,
          status: 'joined',
          role: 'creator',
          joined_at: new Date().toISOString()
        });
      
      if (participantError) throw participantError;
      
      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-play-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-social-play-session'] });
      toast({
        title: 'Session Created',
        description: 'Send invitations to start playing when participants join!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create social play session',
        variant: 'destructive',
      });
    }
  });

  // Complete social play session with reward distribution
  const completeSession = useMutation({
    mutationFn: async ({ sessionId, finalScore, mood, winnerId }: {
      sessionId: string;
      finalScore?: string;
      mood?: string;
      winnerId?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get session info and participants
      const { data: sessionInfo, error: sessionError } = await supabase
        .from('social_play_sessions')
        .select(`
          *,
          participants:social_play_participants(
            *,
            user:profiles!social_play_participants_user_id_fkey(id, full_name)
          )
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Check if this is a challenge with stakes
      const isChallenge = sessionInfo.notes?.includes('Challenge:');
      let stakesTokens = 0;
      let stakesPremiumTokens = 0;

      if (isChallenge && sessionInfo.notes) {
        const tokensMatch = sessionInfo.notes.match(/(\d+) tokens/);
        const premiumMatch = sessionInfo.notes.match(/(\d+) premium tokens/);
        stakesTokens = tokensMatch ? parseInt(tokensMatch[1]) : 0;
        stakesPremiumTokens = premiumMatch ? parseInt(premiumMatch[1]) : 0;
      }

      // Update session as completed
      const updateData = {
        status: 'completed' as const,
        end_time: new Date().toISOString(),
        final_score: finalScore,
        mood: mood,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('social_play_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error) throw error;

      // Distribute rewards based on session type
      if (isChallenge && winnerId && (stakesTokens > 0 || stakesPremiumTokens > 0)) {
        // Challenge mode: winner takes all stakes
        console.log('🏆 [SOCIAL] Distributing challenge rewards to winner:', winnerId);
        
        try {
          const participantCount = sessionInfo.participants?.length || 1;
          
          if (stakesTokens > 0) {
            await supabase.rpc('add_tokens', {
              user_id: winnerId,
              amount: stakesTokens * participantCount, // Winner gets all participants' stakes
              token_type: 'regular',
              source: 'social_challenge_victory',
              description: `Social challenge victory: ${stakesTokens * participantCount} tokens`
            });
          }

          if (stakesPremiumTokens > 0) {
            await supabase.rpc('add_tokens', {
              user_id: winnerId,
              amount: stakesPremiumTokens * participantCount,
              token_type: 'premium',
              source: 'social_challenge_victory',
              description: `Social challenge victory: ${stakesPremiumTokens * participantCount} premium tokens`
            });
          }

          toast({
            title: '🏆 Challenge Complete!',
            description: `Winner received ${stakesTokens * participantCount} tokens and ${stakesPremiumTokens * participantCount} premium tokens!`,
          });
          
          // Create challenge completion feed post
          try {
            const { data: winnerProfile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', winnerId)
              .single();

            await supabase
              .from('activity_logs')
              .insert({
                player_id: winnerId,
                activity_category: 'challenge',
                activity_type: 'challenge_completed',
                title: 'Social Challenge Completed!',
                description: `${winnerProfile?.full_name || 'Someone'} won the social play challenge!`,
                metadata: {
                  challenge_type: 'social_play',
                  winner_name: winnerProfile?.full_name || 'Someone',
                  stakes_tokens: stakesTokens * participantCount,
                  stakes_premium_tokens: stakesPremiumTokens * participantCount
                }
              });
          } catch (feedError) {
            console.error('Error creating challenge completion feed post:', feedError);
          }
        } catch (rewardError) {
          console.error('Error distributing challenge rewards:', rewardError);
          toast({
            title: 'Session Complete',
            description: 'There was an error distributing rewards',
            variant: 'destructive',
          });
        }
      } else {
        // Regular social play: distribute participation rewards based on competitive level
        const baseReward = sessionInfo.competitive_level === 'high' ? 15 : 
                          sessionInfo.competitive_level === 'medium' ? 10 : 5;
        
        for (const participant of sessionInfo.participants || []) {
          try {
            await supabase.rpc('add_tokens', {
              user_id: participant.user_id,
              amount: baseReward,
              token_type: 'regular',
              source: 'social_play_participation',
              description: `Social play participation reward: ${baseReward} tokens`
            });
          } catch (error) {
            console.error('Error rewarding participant:', participant.user_id, error);
          }
        }

        toast({
          title: 'Session Complete!',
          description: `All participants received ${baseReward} tokens for playing!`,
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-play-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-social-play-session'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete session',
        variant: 'destructive',
      });
    }
  });

  // Update session status
  const updateSessionStatus = useMutation({
    mutationFn: async ({ sessionId, status, updates }: {
      sessionId: string;
      status: SocialPlaySession['status'];
      updates?: Partial<SocialPlaySession>;
    }) => {
      const updateData = {
        status,
        updated_at: new Date().toISOString(),
        ...updates
      };

      const { data, error } = await supabase
        .from('social_play_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-play-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-social-play-session'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update session',
        variant: 'destructive',
      });
    }
  });

  return {
    sessions: sessions || [],
    activeSession,
    isLoading: sessionsLoading,
    createSession: createSession.mutate,
    completeSession: completeSession.mutate,
    updateSessionStatus: updateSessionStatus.mutate,
    cleanupExpiredSessions: cleanupExpiredSessions.mutate,
    isCreatingSession: createSession.isPending,
    isCompletingSession: completeSession.isPending,
    isUpdatingSession: updateSessionStatus.isPending,
    isCleaningUp: cleanupExpiredSessions.isPending,
  };
}
