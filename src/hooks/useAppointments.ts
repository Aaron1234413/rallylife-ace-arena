
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Appointment {
  id: string;
  coach_id: string;
  player_id: string;
  coach_name: string;
  player_name: string;
  title: string;
  appointment_type: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  location?: string;
  price_amount?: number;
  created_at: string;
}

export function useAppointments() {
  const queryClient = useQueryClient();

  const { data: appointments, isLoading, error } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_upcoming_appointments');
      if (error) throw error;
      return data as Appointment[];
    },
  });

  const createAppointmentRequestMutation = useMutation({
    mutationFn: async (request: {
      coach_id: string;
      requested_date: string;
      requested_start_time: string;
      requested_end_time: string;
      appointment_type: string;
      message?: string;
    }) => {
      const { data, error } = await supabase.rpc('create_appointment_request', {
        coach_user_id: request.coach_id,
        requested_date_param: request.requested_date,
        requested_start_time_param: request.requested_start_time,
        requested_end_time_param: request.requested_end_time,
        appointment_type_param: request.appointment_type,
        message_param: request.message,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment-requests'] });
      toast.success('Appointment request sent successfully!');
    },
    onError: (error: any) => {
      console.error('Error creating appointment request:', error);
      toast.error(error.message || 'Failed to send appointment request');
    },
  });

  const approveAppointmentRequestMutation = useMutation({
    mutationFn: async (approval: {
      request_id: string;
      response_message?: string;
      price_amount?: number;
      location?: string;
    }) => {
      const { data, error } = await supabase.rpc('approve_appointment_request', {
        request_id: approval.request_id,
        response_message_param: approval.response_message,
        price_amount_param: approval.price_amount,
        location_param: approval.location,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment-requests'] });
      toast.success('Appointment request approved!');
    },
    onError: (error: any) => {
      console.error('Error approving appointment request:', error);
      toast.error(error.message || 'Failed to approve appointment request');
    },
  });

  return {
    appointments: appointments || [],
    isLoading,
    error,
    createAppointmentRequest: createAppointmentRequestMutation.mutate,
    approveAppointmentRequest: approveAppointmentRequestMutation.mutate,
    isCreatingRequest: createAppointmentRequestMutation.isPending,
    isApprovingRequest: approveAppointmentRequestMutation.isPending,
  };
}
