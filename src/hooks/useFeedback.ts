import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface SessionOption {
  id: string;
  session_type: string;
  location: string;
  created_at: string;
}

export function useFeedback() {
  const { user } = useAuth();
  const [pastSessions, setPastSessions] = useState<SessionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchPastSessions = async () => {
    if (!user) return;

    try {
      // Simple approach: get sessions directly without complex joins
      const { data: sessionsData, error } = await supabase
        .from('sessions')
        .select('id, session_type, location, created_at')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPastSessions(sessionsData || []);
    } catch (error) {
      console.error('Error fetching past sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const leaveFeedback = async (sessionId: string, feedback: string, rating?: number): Promise<boolean> => {
    if (!user) return false;

    setSubmitting(true);
    try {
      // Simple insert without complex queries
      const { error } = await supabase
        .from('session_feedback')
        .insert({
          session_id: sessionId,
          coach_id: user.id,
          player_id: user.id, // Simplified for now
          feedback,
          rating: rating || 5
        });

      if (error) throw error;
      
      toast.success('Feedback submitted successfully!');
      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPastSessions();
    }
  }, [user]);

  return {
    pastSessions,
    loading,
    submitting,
    leaveFeedback,
    refreshSessions: fetchPastSessions
  };
}