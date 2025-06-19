
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserConnection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
  updated_at: string;
  profile?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface ConnectionRequest {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending';
  created_at: string;
  requester_profile: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export function useUserConnections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get accepted connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('user_connections')
        .select(`
          *,
          requester_profile:profiles!user_connections_requester_id_fkey(id, full_name, avatar_url),
          addressee_profile:profiles!user_connections_addressee_id_fkey(id, full_name, avatar_url)
        `)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (connectionsError) throw connectionsError;

      // Transform connections to include the other person's profile with proper typing
      const transformedConnections: UserConnection[] = (connectionsData || []).map(conn => ({
        id: conn.id,
        requester_id: conn.requester_id,
        addressee_id: conn.addressee_id,
        status: conn.status as 'pending' | 'accepted' | 'declined' | 'blocked',
        created_at: conn.created_at,
        updated_at: conn.updated_at,
        profile: conn.requester_id === user.id ? conn.addressee_profile : conn.requester_profile,
      }));

      setConnections(transformedConnections);

      // Get pending requests (where current user is addressee)
      const { data: requestsData, error: requestsError } = await supabase
        .from('user_connections')
        .select(`
          *,
          requester_profile:profiles!user_connections_requester_id_fkey(id, full_name, avatar_url)
        `)
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      if (requestsError) throw requestsError;

      // Transform requests with proper typing
      const transformedRequests: ConnectionRequest[] = (requestsData || []).map(req => ({
        id: req.id,
        requester_id: req.requester_id,
        addressee_id: req.addressee_id,
        status: 'pending' as const,
        created_at: req.created_at,
        requester_profile: req.requester_profile,
      }));

      setPendingRequests(transformedRequests);
    } catch (err) {
      console.error('Error fetching connections:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async (userId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);
      const { error } = await supabase
        .from('user_connections')
        .insert({
          requester_id: user.id,
          addressee_id: userId,
          status: 'pending',
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error sending connection request:', err);
      setError(err instanceof Error ? err.message : 'Failed to send connection request');
      return false;
    }
  };

  const respondToRequest = async (requestId: string, response: 'accepted' | 'declined'): Promise<boolean> => {
    try {
      setError(null);
      const { error } = await supabase
        .from('user_connections')
        .update({
          status: response,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      // Refresh data
      await fetchConnections();
      return true;
    } catch (err) {
      console.error('Error responding to request:', err);
      setError(err instanceof Error ? err.message : 'Failed to respond to request');
      return false;
    }
  };

  const removeConnection = async (connectionId: string): Promise<boolean> => {
    try {
      setError(null);
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      // Refresh data
      await fetchConnections();
      return true;
    } catch (err) {
      console.error('Error removing connection:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove connection');
      return false;
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [user]);

  // Set up real-time subscription for connection updates
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('user_connections_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_connections',
          filter: `or(requester_id.eq.${user.id},addressee_id.eq.${user.id})`,
        },
        () => {
          fetchConnections();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    connections,
    pendingRequests,
    loading,
    error,
    sendConnectionRequest,
    respondToRequest,
    removeConnection,
    refetch: fetchConnections,
  };
}
