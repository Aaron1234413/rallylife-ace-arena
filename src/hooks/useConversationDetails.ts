import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useConversationDetails(conversationId: string | null) {
  const { user } = useAuth();

  const conversationQuery = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants(
            user_id,
            profiles!conversation_participants_user_id_fkey(
              id,
              full_name,
              avatar_url,
              role
            )
          )
        `)
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      // Find the other participant (not the current user)
      const participants = data.conversation_participants || [];
      const otherParticipant = participants.find(
        p => p.user_id !== user?.id
      )?.profiles;

      const currentParticipant = participants.find(
        p => p.user_id === user?.id
      )?.profiles;

      return {
        ...data,
        otherParticipant,
        currentParticipant,
        participants: participants.map(p => p.profiles)
      };
    },
    enabled: !!conversationId && !!user
  });

  return {
    conversation: conversationQuery.data,
    loading: conversationQuery.isLoading,
    error: conversationQuery.error
  };
}