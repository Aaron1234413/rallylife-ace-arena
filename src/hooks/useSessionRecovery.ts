import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SessionRecovery {
  hasActiveMatchSession: boolean;
  hasActiveSocialPlaySession: boolean;
  matchSessionId?: string;
  socialPlaySessionId?: string;
  loading: boolean;
}

export function useSessionRecovery(): SessionRecovery {
  const { user } = useAuth();
  const [recovery, setRecovery] = useState<SessionRecovery>({
    hasActiveMatchSession: false,
    hasActiveSocialPlaySession: false,
    loading: true
  });

  useEffect(() => {
    const detectActiveSessions = async () => {
      if (!user) {
        console.log('🔄 [SESSION_RECOVERY] No user, setting loading false');
        setRecovery({
          hasActiveMatchSession: false,
          hasActiveSocialPlaySession: false,
          loading: false
        });
        return;
      }

      try {
        console.log('🔄 [SESSION_RECOVERY] Detecting active sessions for user:', user.id);
        // Check for active match sessions
        const { data: matchSession } = await supabase
          .from('active_match_sessions')
          .select('id')
          .or(`player_id.eq.${user.id},opponent_id.eq.${user.id},partner_id.eq.${user.id},opponent_1_id.eq.${user.id},opponent_2_id.eq.${user.id}`)
          .eq('status', 'active')
          .maybeSingle();

        // Check for active social play sessions
        const { data: socialSession } = await supabase
          .from('social_play_sessions')
          .select('id')
          .or(`created_by.eq.${user.id}`)
          .eq('status', 'active')
          .maybeSingle();

        // Check if user is participant in any active social play session
        const { data: participantSession } = await supabase
          .from('social_play_participants')
          .select('session_id, social_play_sessions!inner(id, status)')
          .eq('user_id', user.id)
          .eq('status', 'joined')
          .eq('social_play_sessions.status', 'active')
          .maybeSingle();

        const hasActiveMatch = !!matchSession;
        const hasActiveSocialPlay = !!socialSession || !!participantSession;

        if (hasActiveMatch || hasActiveSocialPlay) {
          console.log('🔄 [SESSION_RECOVERY] Active sessions detected:', {
            match: hasActiveMatch,
            socialPlay: hasActiveSocialPlay,
            matchId: matchSession?.id,
            socialId: socialSession?.id || participantSession?.session_id
          });

          // Show recovery notification with navigation options
          if (hasActiveMatch && hasActiveSocialPlay) {
            toast.info('Active sessions detected! Check your dashboard for ongoing activities.', {
              action: {
                label: 'View Sessions',
                onClick: () => window.location.href = '/dashboard'
              }
            });
          } else if (hasActiveMatch) {
            toast.info('Active match session detected! Resume playing.', {
              action: {
                label: 'Join Match',
                onClick: () => window.location.href = `/active-match?session=${matchSession?.id}`
              }
            });
          } else if (hasActiveSocialPlay) {
            toast.info('Active social play session detected! Rejoin your session.', {
              action: {
                label: 'Join Session',
                onClick: () => window.location.href = `/active-social-play?session=${socialSession?.id || participantSession?.session_id}`
              }
            });
          }
        }

        setRecovery({
          hasActiveMatchSession: hasActiveMatch,
          hasActiveSocialPlaySession: hasActiveSocialPlay,
          matchSessionId: matchSession?.id,
          socialPlaySessionId: socialSession?.id || participantSession?.session_id,
          loading: false
        });

      } catch (error) {
        console.error('❌ [SESSION_RECOVERY] Error detecting active sessions:', error);
        setRecovery({
          hasActiveMatchSession: false,
          hasActiveSocialPlaySession: false,
          loading: false
        });
      }
    };

    detectActiveSessions();
  }, [user]);

  return recovery;
}