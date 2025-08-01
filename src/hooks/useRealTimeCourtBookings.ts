import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CourtBooking {
  id: string;
  court_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  created_at: string;
  court?: {
    name: string;
    surface_type: string;
  };
  user?: {
    full_name: string;
    avatar_url?: string;
  };
}

export function useRealTimeCourtBookings(clubId: string) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<CourtBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!user || !clubId) return;

    try {
      // Fetch real bookings from database
      const { data: bookings, error } = await supabase
        .from('club_court_bookings')
        .select(`
          *,
          court:club_courts!club_court_bookings_court_id_fkey(name, surface_type)
        `)
        .eq('club_id', clubId)
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedBookings: CourtBooking[] = (bookings || []).map(booking => ({
        id: booking.id,
        court_id: booking.court_id,
        user_id: booking.user_id,
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: booking.status,
        payment_status: 'paid', // Assuming paid since tokens were used
        created_at: booking.created_at,
        court: booking.court ? {
          name: booking.court.name,
          surface_type: booking.court.surface_type
        } : undefined,
        user: {
          full_name: 'Club Member',
          avatar_url: undefined
        }
      }));

      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching court bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !clubId) return;

    fetchBookings();

    // Set up realtime subscription for court bookings
    const channel = supabase
      .channel('court-bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'club_courts',
          filter: `club_id=eq.${clubId}`
        },
        (payload) => {
          console.log('Court booking change:', payload);
          fetchBookings(); // Refetch on any court changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, clubId]);

  const getAvailableSlots = (courtId: string, date: string) => {
    const allSlots = [
      '06:00-07:00', '07:00-08:00', '08:00-09:00', '09:00-10:00',
      '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00',
      '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
      '18:00-19:00', '19:00-20:00', '20:00-21:00', '21:00-22:00'
    ];

    const bookedSlots = bookings
      .filter(booking => 
        booking.court_id === courtId && 
        booking.booking_date === date &&
        booking.status === 'confirmed'
      )
      .map(booking => `${booking.start_time}-${booking.end_time}`);

    return allSlots.filter(slot => !bookedSlots.includes(slot));
  };

  const createBooking = async (
    courtId: string,
    bookingDate: string,
    startTime: string,
    endTime: string
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Create real booking in database
      const { data: booking, error } = await supabase
        .from('club_court_bookings')
        .insert({
          club_id: clubId,
          court_id: courtId,
          user_id: user.id,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          status: 'confirmed',
          payment_method: 'tokens',
          tokens_used: 50 // Default token cost
        })
        .select(`
          *,
          court:club_courts!club_court_bookings_court_id_fkey(name, surface_type)
        `)
        .single();

      if (error) throw error;

      // Transform and add to state
      const newBooking: CourtBooking = {
        id: booking.id,
        court_id: booking.court_id,
        user_id: booking.user_id,
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: booking.status,
        payment_status: 'paid',
        created_at: booking.created_at,
        court: booking.court ? {
          name: booking.court.name,
          surface_type: booking.court.surface_type
        } : undefined,
        user: {
          full_name: 'Current User',
          avatar_url: undefined
        }
      };

      setBookings(prev => [...prev, newBooking]);
      return newBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  };

  return {
    bookings,
    loading,
    getAvailableSlots,
    createBooking,
    refetch: fetchBookings
  };
}