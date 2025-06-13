
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export function useMessages(conversationId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
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
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

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
