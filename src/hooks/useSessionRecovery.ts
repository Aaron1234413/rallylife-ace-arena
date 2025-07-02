
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
  error?: string;
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
        setRecovery({
          hasActiveMatchSession: false,
          hasActiveSocialPlaySession: false,
          loading: false
        });
        return;
      }

      try {
        console.log('🔄 [SESSION_RECOVERY] Checking for active sessions...');
        
        // Use a simpler approach to avoid RLS recursion issues
        // Check for active match sessions with basic query
        const { data: matchSessions, error: matchError } = await supabase
          .from('active_match_sessions')
          .select('id, status')
          .eq('player_id', user.id)
          .eq('status', 'active')
          .limit(1);

        if (matchError) {
          console.warn('⚠️ [SESSION_RECOVERY] Match session query failed:', matchError);
        }

        // Check for active social play sessions
        const { data: socialSessions, error: socialError } = await supabase
          .from('social_play_sessions')
          .select('id, status')
          .eq('created_by', user.id)
          .eq('status', 'active')
          .limit(1);

        if (socialError) {
          console.warn('⚠️ [SESSION_RECOVERY] Social session query failed:', socialError);
        }

        const hasActiveMatch = !matchError && matchSessions && matchSessions.length > 0;
        const hasActiveSocialPlay = !socialError && socialSessions && socialSessions.length > 0;

        if (hasActiveMatch || hasActiveSocialPlay) {
          console.log('🔄 [SESSION_RECOVERY] Active sessions detected:', {
            match: hasActiveMatch,
            socialPlay: hasActiveSocialPlay
          });

          // Show recovery notification only once
          if (hasActiveMatch && hasActiveSocialPlay) {
            toast.info('Active sessions detected! Check your dashboard for ongoing activities.');
          } else if (hasActiveMatch) {
            toast.info('Active match session detected! Resume playing from your dashboard.');
          } else if (hasActiveSocialPlay) {
            toast.info('Active social play session detected! Check your dashboard to rejoin.');
          }
        }

        setRecovery({
          hasActiveMatchSession: hasActiveMatch,
          hasActiveSocialPlaySession: hasActiveSocialPlay,
          matchSessionId: matchSessions?.[0]?.id,
          socialPlaySessionId: socialSessions?.[0]?.id,
          loading: false
        });

      } catch (error) {
        console.error('❌ [SESSION_RECOVERY] Error detecting active sessions:', error);
        setRecovery({
          hasActiveMatchSession: false,
          hasActiveSocialPlaySession: false,
          loading: false,
          error: 'Failed to check for active sessions'
        });
      }
    };

    // Only run once when user is available
    if (user) {
      detectActiveSessions();
    }
  }, [user]);

  return recovery;
}
