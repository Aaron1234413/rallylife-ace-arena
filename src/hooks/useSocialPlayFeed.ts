
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SocialPlayFeedData {
  sessionId: string;
  sessionType: 'singles' | 'doubles';
  competitiveLevel: 'low' | 'medium' | 'high';
  duration: number;
  participantCount: number;
  participantNames: string[];
  location?: string;
  finalScore?: string;
  mood?: string;
  notes?: string;
}

export function useSocialPlayFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createSocialPlayPost = useMutation({
    mutationFn: async (feedData: SocialPlayFeedData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const competitiveLevelText = {
        'low': 'Chill',
        'medium': 'Fun', 
        'high': 'Competitive'
      }[feedData.competitiveLevel];

      const title = `Social ${feedData.sessionType === 'singles' ? 'Singles' : 'Doubles'} Session`;
      
      let description = `Completed a ${competitiveLevelText.toLowerCase()} ${feedData.sessionType} session`;
      if (feedData.participantCount > 1) {
        description += ` with ${feedData.participantNames.slice(0, 2).join(' & ')}`;
        if (feedData.participantNames.length > 2) {
          description += ` and ${feedData.participantNames.length - 2} other${feedData.participantNames.length > 3 ? 's' : ''}`;
        }
      }
      
      if (feedData.location) {
        description += ` at ${feedData.location}`;
      }

      // Create activity log entry for the feed
      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          player_id: user.id,
          activity_type: 'social_play',
          title,
          description,
          duration_minutes: feedData.duration,
          location: feedData.location,
          score: feedData.finalScore,
          xp_earned: 0, // XP already awarded in session completion
          hp_impact: 0, // HP already restored in session completion
          session_data: {
            session_id: feedData.sessionId,
            session_type: feedData.sessionType,
            competitive_level: feedData.competitiveLevel,
            participant_count: feedData.participantCount,
            participant_names: feedData.participantNames,
            mood: feedData.mood,
            notes: feedData.notes
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Refresh the feed data
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] });
      
      toast({
        title: 'Session Shared!',
        description: 'Your social play session has been posted to your feed.',
      });
    },
    onError: (error: any) => {
      console.error('Failed to create social play post:', error);
      toast({
        title: 'Sharing Failed',
        description: 'Could not share your session to the feed.',
        variant: 'destructive',
      });
    }
  });

  return {
    createSocialPlayPost: createSocialPlayPost.mutate,
    isCreatingPost: createSocialPlayPost.isPending,
  };
}
