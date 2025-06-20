
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SocialPlayCheckin {
  id: string;
  session_id: string;
  user_id: string;
  mood_emoji: string;
  notes: string | null;
  checked_in_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export function useSocialPlayCheckins(sessionId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get check-ins for a session
  const { data: checkins, isLoading: checkinsLoading } = useQuery({
    queryKey: ['social-play-checkins', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from('social_play_checkins')
        .select(`
          *,
          user:profiles(id, full_name, avatar_url)
        `)
        .eq('session_id', sessionId)
        .order('checked_in_at', { ascending: false });
      
      if (error) throw error;
      return data as SocialPlayCheckin[];
    },
    enabled: !!sessionId
  });

  // Create check-in
  const createCheckin = useMutation({
    mutationFn: async (checkinData: {
      session_id: string;
      mood_emoji: string;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('social_play_checkins')
        .insert({
          session_id: checkinData.session_id,
          user_id: user.id,
          mood_emoji: checkinData.mood_emoji,
          notes: checkinData.notes
        })
        .select(`
          *,
          user:profiles(id, full_name, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      return data as SocialPlayCheckin;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-play-checkins', sessionId] });
      toast({
        title: 'Check-in Recorded',
        description: 'Your mood has been shared with the group!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record check-in',
        variant: 'destructive',
      });
    }
  });

  return {
    checkins: checkins || [],
    isLoading: checkinsLoading,
    createCheckin: createCheckin.mutate,
    isCreatingCheckin: createCheckin.isPending,
  };
}
