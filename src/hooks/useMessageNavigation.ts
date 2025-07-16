import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

export function useMessageNavigation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const openConversation = async (participantId: string | { targetUserId: string; targetUserName: string }, initialMessage?: string) => {
    try {
      const userId = typeof participantId === 'string' ? participantId : participantId.targetUserId;
      const conversationId = await startNewConversation([userId], initialMessage);
      return conversationId;
    } catch (error) {
      console.error('Failed to open conversation:', error);
      throw error;
    }
  };

  const navigateToConversation = (conversationId: string) => {
    navigate(`/messages?conversation=${conversationId}`);
  };

  const startNewConversation = async (participantIds: string[], initialMessage?: string) => {
    try {
      // This would typically call a backend function to create a new conversation
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantIds, initialMessage })
      });
      
      if (response.ok) {
        const { conversationId } = await response.json();
        
        // Refresh conversations list
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        
        // Navigate to the new conversation
        navigateToConversation(conversationId);
        
        return conversationId;
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  };

  const navigateToMessages = () => {
    navigate('/messages');
  };

  const navigateWithMatchContext = (matchId: string, participantId: string) => {
    // Create a conversation with match context
    startNewConversation([participantId], `Let's coordinate our match!`);
  };

  const navigateWithChallengeContext = (challengeId: string, participantId: string) => {
    // Create a conversation with challenge context
    startNewConversation([participantId], `Challenge accepted! Let's discuss the details.`);
  };

  return {
    openConversation,
    isLoading: false, // Add loading state if needed
    navigateToConversation,
    startNewConversation,
    navigateToMessages,
    navigateWithMatchContext,
    navigateWithChallengeContext
  };
}