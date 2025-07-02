import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CoachService {
  id: string;
  coach_id: string;
  club_id: string;
  service_type: string;
  title: string;
  description?: string;
  rate_tokens: number;
  rate_money: number;
  duration_minutes: number;
  is_active: boolean;
  max_participants: number;
  created_at: string;
  updated_at: string;
}

export interface CoachBooking {
  id: string;
  coach_id: string;
  player_id: string;
  club_id: string;
  service_id: string;
  start_datetime: string;
  end_datetime: string;
  total_cost_tokens: number;
  total_cost_money: number;
  payment_method: string;
  status: string;
  notes?: string;
  feedback_rating?: number;
  feedback_comment?: string;
  created_at: string;
  updated_at: string;
  service?: CoachService;
  player_profile?: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

export function useCoachServices() {
  const { user } = useAuth();
  const [services, setServices] = useState<CoachService[]>([]);
  const [bookings, setBookings] = useState<CoachBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch coach services for a club
  const fetchServices = async (clubId: string, coachId?: string) => {
    try {
      let query = supabase
        .from('coach_services')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });

      if (coachId) {
        query = query.eq('coach_id', coachId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setServices(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching coach services:', error);
      toast.error('Failed to load coach services');
      return [];
    }
  };

  // Fetch coach bookings
  const fetchBookings = async (filters: { 
    coachId?: string; 
    playerId?: string; 
    clubId?: string;
    serviceId?: string;
  } = {}) => {
    try {
      let query = supabase
        .from('coach_bookings')
        .select(`
          *,
          service:coach_services(*),
          player_profile:profiles!coach_bookings_player_id_fkey(full_name, avatar_url)
        `)
        .order('start_datetime', { ascending: false });

      if (filters.coachId) {
        query = query.eq('coach_id', filters.coachId);
      }
      if (filters.playerId) {
        query = query.eq('player_id', filters.playerId);
      }
      if (filters.clubId) {
        query = query.eq('club_id', filters.clubId);
      }
      if (filters.serviceId) {
        query = query.eq('service_id', filters.serviceId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookings((data as any[]) || []);
      return (data as any[]) || [];
    } catch (error) {
      console.error('Error fetching coach bookings:', error);
      toast.error('Failed to load bookings');
      return [];
    }
  };

  // Create a new coach service
  const createService = async (serviceData: {
    club_id: string;
    service_type: string;
    title: string;
    description?: string;
    rate_tokens: number;
    rate_money: number;
    duration_minutes: number;
    max_participants?: number;
  }) => {
    try {
      const { data, error } = await supabase
        .from('coach_services')
        .insert({
          coach_id: user?.id,
          ...serviceData
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Service created successfully!');
      await fetchServices(serviceData.club_id, user?.id);
      return data;
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service');
      throw error;
    }
  };

  // Update a coach service
  const updateService = async (serviceId: string, updates: Partial<CoachService>) => {
    try {
      const { data, error } = await supabase
        .from('coach_services')
        .update(updates)
        .eq('id', serviceId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Service updated successfully!');
      
      // Update local state
      setServices(prev => prev.map(service => 
        service.id === serviceId ? { ...service, ...updates } : service
      ));
      
      return data;
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
      throw error;
    }
  };

  // Delete a coach service
  const deleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('coach_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast.success('Service deleted successfully!');
      setServices(prev => prev.filter(service => service.id !== serviceId));
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
      throw error;
    }
  };

  // Calculate booking cost
  const calculateBookingCost = (service: CoachService, duration?: number) => {
    const actualDuration = duration || service.duration_minutes;
    const hours = actualDuration / 60;
    
    return {
      total_tokens: Math.ceil(service.rate_tokens * hours),
      total_money: parseFloat((service.rate_money * hours).toFixed(2)),
      duration_minutes: actualDuration
    };
  };

  // Create a booking
  const createBooking = async (
    serviceId: string,
    startDateTime: string,
    endDateTime: string,
    paymentMethod: string = 'tokens',
    notes?: string
  ) => {
    try {
      const service = services.find(s => s.id === serviceId);
      if (!service) throw new Error('Service not found');

      const cost = calculateBookingCost(service);

      const { data, error } = await supabase
        .from('coach_bookings')
        .insert({
          coach_id: service.coach_id,
          player_id: user?.id,
          club_id: service.club_id,
          service_id: serviceId,
          start_datetime: startDateTime,
          end_datetime: endDateTime,
          total_cost_tokens: cost.total_tokens,
          total_cost_money: cost.total_money,
          payment_method: paymentMethod,
          notes: notes
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Booking created successfully!');
      return data;
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
      throw error;
    }
  };

  // Update booking status
  const updateBooking = async (bookingId: string, updates: Partial<CoachBooking>) => {
    try {
      const { data, error } = await supabase
        .from('coach_bookings')
        .update(updates)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Booking updated successfully!');
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, ...updates } : booking
      ));
      
      return data;
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
      throw error;
    }
  };

  // Get coach earnings for a club
  const getCoachEarnings = async (clubId: string, coachId?: string) => {
    try {
      let query = supabase
        .from('coach_bookings')
        .select('total_cost_tokens, total_cost_money, status')
        .eq('club_id', clubId)
        .eq('status', 'completed');

      if (coachId) {
        query = query.eq('coach_id', coachId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const earnings = (data || []).reduce((acc, booking) => ({
        total_tokens: acc.total_tokens + booking.total_cost_tokens,
        total_money: acc.total_money + booking.total_cost_money,
        completed_bookings: acc.completed_bookings + 1
      }), { total_tokens: 0, total_money: 0, completed_bookings: 0 });

      return earnings;
    } catch (error) {
      console.error('Error fetching coach earnings:', error);
      return { total_tokens: 0, total_money: 0, completed_bookings: 0 };
    }
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return {
    services,
    bookings,
    loading,
    fetchServices,
    fetchBookings,
    createService,
    updateService,
    deleteService,
    calculateBookingCost,
    createBooking,
    updateBooking,
    getCoachEarnings
  };
}