import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CoachBooking {
  id: string;
  coach_id: string;
  player_id: string;
  appointment_type: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  location?: string;
  notes?: string;
  created_at: string;
  coach?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  player?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface CoachAvailability {
  id: string;
  coach_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export function useRealTimeCoachBookings(clubId: string) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<CoachBooking[]>([]);
  const [availability, setAvailability] = useState<CoachAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!user || !clubId) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      if (!data?.length) {
        setBookings([]);
        return;
      }

      // Get user profiles for coaches and players
      const allUserIds = [...new Set([
        ...data.map(appointment => appointment.coach_id),
        ...data.map(appointment => appointment.player_id)
      ])];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', allUserIds);

      const formattedBookings: CoachBooking[] = data.map(appointment => ({
        id: appointment.id,
        coach_id: appointment.coach_id,
        player_id: appointment.player_id,
        appointment_type: appointment.appointment_type,
        scheduled_date: appointment.scheduled_date,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        status: appointment.status,
        payment_status: appointment.payment_status || 'pending',
        location: appointment.location,
        notes: appointment.notes,
        created_at: appointment.created_at,
        coach: profiles?.find(p => p.id === appointment.coach_id) ? {
          id: appointment.coach_id,
          full_name: profiles.find(p => p.id === appointment.coach_id)?.full_name || 'Unknown Coach',
          avatar_url: profiles.find(p => p.id === appointment.coach_id)?.avatar_url
        } : undefined,
        player: profiles?.find(p => p.id === appointment.player_id) ? {
          id: appointment.player_id,
          full_name: profiles.find(p => p.id === appointment.player_id)?.full_name || 'Unknown Player',
          avatar_url: profiles.find(p => p.id === appointment.player_id)?.avatar_url
        } : undefined
      }));

      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error fetching coach bookings:', error);
    }
  };

  const fetchAvailability = async () => {
    if (!user || !clubId) return;

    try {
      const { data, error } = await supabase
        .from('coach_availability')
        .select('*')
        .eq('is_active', true)
        .order('day_of_week', { ascending: true });

      if (error) throw error;

      setAvailability(data || []);
    } catch (error) {
      console.error('Error fetching coach availability:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !clubId) return;

    fetchBookings();
    fetchAvailability();

    // Set up realtime subscription for appointment changes
    const appointmentsChannel = supabase
      .channel('coach-appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('Appointment change:', payload);
          fetchBookings();
        }
      )
      .subscribe();

    // Set up realtime subscription for availability changes
    const availabilityChannel = supabase
      .channel('coach-availability-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coach_availability'
        },
        (payload) => {
          console.log('Availability change:', payload);
          fetchAvailability();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(availabilityChannel);
    };
  }, [user, clubId]);

  const getCoachAvailability = (coachId: string, date: string) => {
    const dayOfWeek = new Date(date).getDay();
    const coachAvailability = availability.filter(
      avail => avail.coach_id === coachId && avail.day_of_week === dayOfWeek
    );

    const bookedSlots = bookings
      .filter(booking => 
        booking.coach_id === coachId && 
        booking.scheduled_date === date &&
        booking.status !== 'cancelled'
      )
      .map(booking => ({
        start: booking.start_time,
        end: booking.end_time
      }));

    return {
      available: coachAvailability,
      booked: bookedSlots
    };
  };

  const createBooking = async (bookingData: Partial<CoachBooking>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          coach_id: bookingData.coach_id,
          player_id: user.id,
          title: `${bookingData.appointment_type || 'lesson'} session`,
          appointment_type: bookingData.appointment_type || 'lesson',
          scheduled_date: bookingData.scheduled_date,
          start_time: bookingData.start_time,
          end_time: bookingData.end_time,
          status: 'scheduled',
          payment_status: 'pending',
          location: bookingData.location,
          notes: bookingData.notes
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating coach booking:', error);
      throw error;
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) throw error;

      // Optimistically update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status }
          : booking
      ));

      return true;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  };

  const getUpcomingBookings = (limit: number = 5) => {
    const now = new Date();
    return bookings
      .filter(booking => {
        const bookingDateTime = new Date(`${booking.scheduled_date} ${booking.start_time}`);
        return bookingDateTime > now && booking.status !== 'cancelled';
      })
      .slice(0, limit);
  };

  return {
    bookings,
    availability,
    loading,
    getCoachAvailability,
    createBooking,
    updateBookingStatus,
    getUpcomingBookings,
    refetch: () => {
      fetchBookings();
      fetchAvailability();
    }
  };
}