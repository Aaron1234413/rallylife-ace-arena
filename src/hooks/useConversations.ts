import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useConversations() {
  const { user } = useAuth();

  const conversationsQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants!inner(
            user_id,
            profiles!conversation_participants_user_id_fkey(
              id,
              full_name,
              avatar_url
            )
          ),
          messages(
            content,
            created_at,
            sender_id
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Process conversations to get the other participant and last message
      return data?.map(conversation => {
        const participants = conversation.conversation_participants || [];
        const otherParticipant = participants.find(
          p => p.user_id !== user.id
        )?.profiles;

        const messages = conversation.messages || [];
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

        return {
          ...conversation,
          otherParticipant,
          lastMessage: lastMessage?.content || 'No messages yet',
          lastMessageTime: lastMessage?.created_at || conversation.created_at,
          unreadCount: 0 // TODO: Implement unread count logic
        };
      }) || [];
    },
    enabled: !!user
  });

  return {
    conversations: conversationsQuery.data || [],
    loading: conversationsQuery.isLoading,
    error: conversationsQuery.error
  };
}