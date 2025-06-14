
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CoachAvailability {
  id: string;
  coach_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useCoachAvailability(coachId?: string) {
  const queryClient = useQueryClient();

  const { data: availability, isLoading } = useQuery({
    queryKey: ['coach-availability', coachId],
    queryFn: async () => {
      let query = supabase.from('coach_availability').select('*');
      
      if (coachId) {
        query = query.eq('coach_id', coachId);
      }
      
      const { data, error } = await query.order('day_of_week');
      if (error) throw error;
      return data as CoachAvailability[];
    },
    enabled: !!coachId,
  });

  const setAvailabilityMutation = useMutation({
    mutationFn: async (availabilityData: Omit<CoachAvailability, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('coach_availability')
        .upsert(availabilityData, {
          onConflict: 'coach_id,day_of_week',
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-availability'] });
      toast.success('Availability updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    },
  });

  const deleteAvailabilityMutation = useMutation({
    mutationFn: async (availabilityId: string) => {
      const { error } = await supabase
        .from('coach_availability')
        .delete()
        .eq('id', availabilityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-availability'] });
      toast.success('Availability slot deleted');
    },
    onError: (error: any) => {
      console.error('Error deleting availability:', error);
      toast.error('Failed to delete availability');
    },
  });

  return {
    availability: availability || [],
    isLoading,
    setAvailability: setAvailabilityMutation.mutate,
    deleteAvailability: deleteAvailabilityMutation.mutate,
    isUpdating: setAvailabilityMutation.isPending,
    isDeleting: deleteAvailabilityMutation.isPending,
  };
}
