import { useUnifiedSessions } from './useUnifiedSessions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useSessions() {
  const { user } = useAuth();
  const unifiedSessions = useUnifiedSessions({
    includeNonClubSessions: true
  });

  const tipCoach = async (sessionId: string, coachId: string, amount: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('tip_coach', {
          session_id_param: sessionId,
          coach_id_param: coachId,
          tip_amount: amount
        });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };
      
      if (result.success) {
        toast.success(result.message || 'Tip sent successfully!');
        return true;
      } else {
        toast.error(result.error || 'Failed to send tip');
        return false;
      }
    } catch (error) {
      console.error('Error sending tip:', error);
      toast.error('Failed to send tip');
      return false;
    }
  };

  return {
    sessions: unifiedSessions.sessions,
    loading: unifiedSessions.loading,
    joinSession: unifiedSessions.joinSession,
    tipCoach
  };
}