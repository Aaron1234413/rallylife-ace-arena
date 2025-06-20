
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FriendConnection {
  id: string;
  requester_id: string; 
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
  updated_at: string;
}

interface Friend {
  friend_id: string;
  friend_name: string;
  friend_avatar_url: string | null;
  connection_status: string;
  connected_since: string;
}

export function useFriendConnections() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's friends
  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .rpc('get_user_friends', { user_id: user.id });
      
      if (error) throw error;
      return data as Friend[];
    },
    enabled: !!user?.id
  });

  // Get pending friend requests (incoming)
  const { data: incomingRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['friend-requests-incoming', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('friend_connections')
        .select(`
          *,
          requester:profiles!friend_connections_requester_id_fkey(id, full_name, avatar_url)
        `)
        .eq('addressee_id', user.id)
        .eq('status', 'pending');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Get outgoing friend requests
  const { data: outgoingRequests, isLoading: outgoingLoading } = useQuery({
    queryKey: ['friend-requests-outgoing', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('friend_connections')
        .select(`
          *,
          addressee:profiles!friend_connections_addressee_id_fkey(id, full_name, avatar_url)
        `)
        .eq('requester_id', user.id)
        .eq('status', 'pending');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Send friend request
  const sendFriendRequest = useMutation({
    mutationFn: async (addresseeId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('friend_connections')
        .insert({
          requester_id: user.id,
          addressee_id: addresseeId,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests-outgoing'] });
      toast({
        title: 'Friend Request Sent',
        description: 'Your friend request has been sent successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send friend request',
        variant: 'destructive',
      });
    }
  });

  // Accept friend request
  const acceptFriendRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase
        .from('friend_connections')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests-incoming'] });
      toast({
        title: 'Friend Request Accepted',
        description: 'You are now friends!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept friend request',
        variant: 'destructive',
      });
    }
  });

  // Decline friend request
  const declineFriendRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase
        .from('friend_connections')
        .update({ status: 'declined', updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests-incoming'] });
      toast({
        title: 'Friend Request Declined',
        description: 'The friend request has been declined.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to decline friend request',
        variant: 'destructive',
      });
    }
  });

  return {
    friends: friends || [],
    incomingRequests: incomingRequests || [],
    outgoingRequests: outgoingRequests || [],
    isLoading: friendsLoading || requestsLoading || outgoingLoading,
    sendFriendRequest: sendFriendRequest.mutate,
    acceptFriendRequest: acceptFriendRequest.mutate,
    declineFriendRequest: declineFriendRequest.mutate,
    isSendingRequest: sendFriendRequest.isPending,
    isAcceptingRequest: acceptFriendRequest.isPending,
    isDecliningRequest: declineFriendRequest.isPending,
  };
}
