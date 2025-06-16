
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useRef } from 'react';

export function useMessages(conversationId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const subscriptionStatusRef = useRef<string>('unsubscribed');

  const messagesQuery = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_sender_id_fkey(full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!conversationId && !!user
  });

  // Set up real-time subscription for new messages
  useEffect(() => {
    const cleanupChannel = () => {
      if (channelRef.current && subscriptionStatusRef.current !== 'unsubscribed') {
        channelRef.current.unsubscribe();
        subscriptionStatusRef.current = 'unsubscribed';
        channelRef.current = null;
      }
    };

    if (!conversationId || !user) {
      cleanupChannel();
      return;
    }

    // Clean up any existing channel
    cleanupChannel();

    // Create new channel with unique name
    const channelName = `messages:${conversationId}:${user.id}:${Date.now()}:${Math.random()}`;
    const channel = supabase.channel(channelName);
    
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      );

    // Only subscribe if not already subscribed
    if (subscriptionStatusRef.current === 'unsubscribed') {
      subscriptionStatusRef.current = 'subscribing';
      channel.subscribe((status) => {
        subscriptionStatusRef.current = status;
        console.log('Channel subscription status:', status);
      });
      channelRef.current = channel;
    }

    return () => {
      cleanupChannel();
    };
  }, [conversationId, user, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, messageType = 'text', metadata }: {
      content: string;
      messageType?: string;
      metadata?: any;
    }) => {
      if (!conversationId) throw new Error('No conversation selected');

      const { data, error } = await supabase.rpc('send_message', {
        conversation_id: conversationId,
        content,
        message_type: messageType,
        metadata
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  return {
    messages: messagesQuery.data || [],
    loading: messagesQuery.isLoading,
    error: messagesQuery.error,
    sendMessage: sendMessageMutation.mutate,
    sending: sendMessageMutation.isPending
  };
}
