
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AppointmentRequest {
  id: string;
  coach_id: string;
  player_id: string;
  requested_date: string;
  requested_start_time: string;
  requested_end_time: string;
  appointment_type: string;
  message?: string;
  status: string;
  response_message?: string;
  responded_at?: string;
  expires_at: string;
  created_at: string;
  player_name?: string;
  coach_name?: string;
}

export function useAppointmentRequests() {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['appointment-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointment_requests')
        .select(`
          *,
          coach:profiles!appointment_requests_coach_id_fkey(full_name),
          player:profiles!appointment_requests_player_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(request => ({
        ...request,
        coach_name: request.coach?.full_name,
        player_name: request.player?.full_name,
      })) as AppointmentRequest[];
    },
  });

  const declineRequestMutation = useMutation({
    mutationFn: async ({ requestId, responseMessage }: { requestId: string; responseMessage?: string }) => {
      const { error } = await supabase
        .from('appointment_requests')
        .update({
          status: 'declined',
          response_message: responseMessage,
          responded_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-requests'] });
      toast.success('Appointment request declined');
    },
    onError: (error: any) => {
      console.error('Error declining request:', error);
      toast.error('Failed to decline request');
    },
  });

  return {
    requests: requests || [],
    isLoading,
    declineRequest: declineRequestMutation.mutate,
    isDeclining: declineRequestMutation.isPending,
  };
}
