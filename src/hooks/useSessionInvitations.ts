
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SessionInvitation {
  id: string;
  session_id: string;
  user_id: string;
  status: 'invited' | 'accepted' | 'declined' | 'joined';
  invited_at: string;
  session: {
    id: string;
    session_type: 'singles' | 'doubles';
    competitive_level: 'low' | 'medium' | 'high';
    location?: string;
    notes?: string;
    created_by: string;
    created_at: string;
    status: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';
  };
  inviter: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export function useSessionInvitations() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<SessionInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('social_play_participants')
        .select(`
          id,
          session_id,
          user_id,
          status,
          invited_at,
          social_play_sessions!inner (
            id,
            session_type,
            competitive_level,
            location,
            notes,
            created_by,
            created_at,
            status,
            profiles!social_play_sessions_created_by_fkey (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['invited', 'accepted'])
        .order('invited_at', { ascending: false });

      if (fetchError) throw fetchError;

      const transformedInvitations: SessionInvitation[] = (data || []).map(item => ({
        id: item.id,
        session_id: item.session_id,
        user_id: item.user_id,
        status: item.status as 'invited' | 'accepted' | 'declined' | 'joined',
        invited_at: item.invited_at,
        session: {
          id: item.social_play_sessions.id,
          session_type: item.social_play_sessions.session_type as 'singles' | 'doubles',
          competitive_level: item.social_play_sessions.competitive_level as 'low' | 'medium' | 'high',
          location: item.social_play_sessions.location,
          notes: item.social_play_sessions.notes,
          created_by: item.social_play_sessions.created_by,
          created_at: item.social_play_sessions.created_at,
          status: item.social_play_sessions.status as 'pending' | 'active' | 'paused' | 'completed' | 'cancelled',
        },
        inviter: item.social_play_sessions.profiles
      }));

      setInvitations(transformedInvitations);
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  };

  const respondToInvitation = async (invitationId: string, accept: boolean): Promise<boolean> => {
    try {
      setError(null);
      const newStatus = accept ? 'accepted' : 'declined';

      const { error: updateError } = await supabase
        .from('social_play_participants')
        .update({
          status: newStatus,
          joined_at: accept ? new Date().toISOString() : null,
        })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      // Refresh invitations
      await fetchInvitations();
      return true;
    } catch (err) {
      console.error('Error responding to invitation:', err);
      setError(err instanceof Error ? err.message : 'Failed to respond to invitation');
      return false;
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel(`user_invitations_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_play_participants',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchInvitations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    invitations,
    loading,
    error,
    respondToInvitation,
    refetch: fetchInvitations,
  };
}
