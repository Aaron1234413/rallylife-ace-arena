import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MessageNavigationOptions {
  targetUserId: string;
  targetUserName?: string;
  onSuccess?: (conversationId: string) => void;
  onError?: (error: string) => void;
}

export function useMessageNavigation() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const openConversation = async ({
    targetUserId,
    targetUserName,
    onSuccess,
    onError
  }: MessageNavigationOptions) => {
    if (isLoading) return;

    setIsLoading(true);
    
    try {
      // Create or get existing direct conversation
      const { data: conversationId, error } = await supabase.rpc('create_direct_conversation', {
        other_user_id_param: targetUserId
      });

      if (error) {
        throw error;
      }

      if (!conversationId) {
        throw new Error('Failed to create conversation');
      }

      // Navigate to messages page with conversation selected
      navigate(`/messages?conversation=${conversationId}`);

      // Show success message
      if (targetUserName) {
        toast({
          title: "Opening conversation",
          description: `Starting conversation with ${targetUserName}`,
        });
      }

      // Call success callback
      onSuccess?.(conversationId);

    } catch (error) {
      console.error('Error opening conversation:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to open conversation';
      
      toast({
        title: "Unable to open conversation",
        description: errorMessage,
        variant: "destructive",
      });

      // Call error callback
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    openConversation,
    isLoading
  };
}