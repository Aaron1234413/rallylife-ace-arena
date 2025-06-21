import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SocialPlayEvent {
  id: string;
  created_by: string;
  title: string;
  session_type: 'singles' | 'doubles';
  location: string;
  scheduled_time: string;
  description: string | null;
  max_participants: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  creator?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  participants?: Array<{
    id: string;
    user_id: string;
    status: 'joined' | 'declined';
    user?: {
      id: string;
      full_name: string;
      avatar_url: string | null;
    };
  }>;
}

export function useSocialPlayEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's events (created and participating)
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['social-play-events', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get events user created
      const { data: createdEvents, error: createdError } = await supabase
        .from('social_play_sessions')
        .select(`
          *,
          creator:profiles!social_play_sessions_created_by_fkey(id, full_name, avatar_url),
          participants:social_play_participants(
            *,
            user:profiles!social_play_participants_user_id_fkey(id, full_name, avatar_url)
          )
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      if (createdError) throw createdError;

      // Transform the results to match expected interface with proper type casting
      const transformedEvents: SocialPlayEvent[] = (createdEvents || []).map(event => ({
        id: event.id,
        created_by: event.created_by,
        title: `${event.session_type} Event`, // Generate title from session type
        session_type: event.session_type as 'singles' | 'doubles', // Type cast to expected union type
        location: event.location || '',
        scheduled_time: event.created_at, // Use created_at as scheduled time for now
        description: event.notes,
        max_participants: event.session_type === 'singles' ? 2 : 4,
        status: 'open' as const, // Type cast to expected union type
        created_at: event.created_at,
        creator: event.creator,
        participants: event.participants?.map(participant => ({
          id: participant.id,
          user_id: participant.user_id,
          status: (participant.status === 'joined' || participant.status === 'declined') 
            ? participant.status as 'joined' | 'declined' 
            : 'joined' as const, // Default to 'joined' for other statuses
          user: participant.user
        })) || []
      }));
      
      return transformedEvents;
    },
    enabled: !!user?.id
  });

  // Create event
  const createEvent = useMutation({
    mutationFn: async (eventData: {
      title: string;
      session_type: 'singles' | 'doubles';
      location: string;
      scheduled_time: Date;
      description?: string;
      invited_users: string[];
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Create the event (reusing existing table structure)
      const { data: event, error: eventError } = await supabase
        .from('social_play_sessions')
        .insert({
          created_by: user.id,
          session_type: eventData.session_type,
          competitive_level: 'medium', // Default for now
          location: eventData.location,
          notes: eventData.description,
          status: 'pending' // Will be 'open' in future iterations
        })
        .select()
        .single();
      
      if (eventError) throw eventError;

      // Add creator as participant
      const { error: creatorError } = await supabase
        .from('social_play_participants')
        .insert({
          session_id: event.id,
          user_id: user.id,
          session_creator_id: user.id,
          status: 'joined',
          joined_at: new Date().toISOString()
        });
      
      if (creatorError) throw creatorError;

      // Add invited users as participants
      if (eventData.invited_users.length > 0) {
        const invitedParticipants = eventData.invited_users.map(userId => ({
          session_id: event.id,
          user_id: userId,
          session_creator_id: user.id,
          status: 'invited' as const
        }));

        const { error: participantsError } = await supabase
          .from('social_play_participants')
          .insert(invitedParticipants);
        
        if (participantsError) throw participantsError;
      }
      
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-play-events'] });
      toast({
        title: 'Event Created!',
        description: 'Your social tennis event has been created and invitations sent.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create event',
        variant: 'destructive',
      });
    }
  });

  return {
    events: events || [],
    isLoading: eventsLoading,
    createEvent: createEvent.mutateAsync,
    isCreatingEvent: createEvent.isPending,
  };
}
