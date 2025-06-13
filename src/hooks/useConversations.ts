
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // First get conversation IDs where user participates
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (participantError) throw participantError;

      const conversationIds = participantData?.map(p => p.conversation_id) || [];
      
      if (conversationIds.length === 0) {
        return [];
      }

      // Get conversations
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          id,
          name,
          is_group,
          created_by,
          created_at,
          updated_at
        `)
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      // Get participant details and latest messages for each conversation
      const conversationsWithData = await Promise.all(
        (conversations || []).map(async (conversation) => {
          // Get other participants (not the current user) with their profiles
          const { data: otherParticipants, error: participantsError } = await supabase
            .from('conversation_participants')
            .select(`
              user_id,
              profiles!inner(
                id,
                full_name,
                avatar_url
              )
            `)
            .eq('conversation_id', conversation.id)
            .neq('user_id', user.id);

          if (participantsError) {
            console.error('Error fetching participants:', participantsError);
          }

          // Get latest message
          const { data: latestMessage, error: messageError } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (messageError && messageError.code !== 'PGRST116') {
            console.error('Error fetching latest message:', messageError);
          }

          // For direct conversations, get the other participant's profile
          const otherParticipant = otherParticipants?.[0]?.profiles || null;

          return {
            ...conversation,
            otherParticipant,
            lastMessage: latestMessage?.content || 'No messages yet',
            lastMessageTime: latestMessage?.created_at || conversation.created_at
          };
        })
      );

      return conversationsWithData;
    },
    enabled: !!user
  });
}
