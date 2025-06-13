
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants!inner(
            user_id,
            last_read_at
          ),
          messages(
            id,
            content,
            created_at,
            sender_id
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get participant details for each conversation
      const conversationsWithParticipants = await Promise.all(
        data.map(async (conversation) => {
          const { data: participants, error: participantsError } = await supabase
            .from('conversation_participants')
            .select(`
              user_id,
              profiles(full_name, avatar_url)
            `)
            .eq('conversation_id', conversation.id)
            .neq('user_id', user.id);

          if (participantsError) throw participantsError;

          const otherParticipant = participants[0];
          const lastMessage = conversation.messages?.[0];

          return {
            ...conversation,
            otherParticipant: otherParticipant?.profiles,
            lastMessage: lastMessage?.content || 'No messages yet',
            lastMessageTime: lastMessage?.created_at || conversation.created_at
          };
        })
      );

      return conversationsWithParticipants;
    },
    enabled: !!user
  });
}
