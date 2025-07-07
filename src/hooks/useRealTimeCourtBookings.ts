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
      // Get court IDs for this club
      const { data: courts } = await supabase
        .from('club_courts')
        .select('id')
        .eq('club_id', clubId);

      if (!courts?.length) {
        setBookings([]);
        setLoading(false);
        return;
      }

      const courtIds = courts.map(court => court.id);

      // Fetch bookings for these courts (mock data for now)
      const mockBookings: CourtBooking[] = courtIds.flatMap(courtId => [
        {
          id: `booking-${courtId}-1`,
          court_id: courtId,
          user_id: user.id,
          booking_date: new Date().toISOString().split('T')[0],
          start_time: '09:00',
          end_time: '10:00',
          status: 'confirmed',
          payment_status: 'paid',
          created_at: new Date().toISOString(),
          court: {
            name: `Court ${courtId.slice(-1)}`,
            surface_type: 'hard'
          },
          user: {
            full_name: 'Current User',
            avatar_url: undefined
          }
        }
      ]);

      setBookings(mockBookings);
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

    // Mock booking creation for now
    const newBooking: CourtBooking = {
      id: `booking-${Date.now()}`,
      court_id: courtId,
      user_id: user.id,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      status: 'confirmed',
      payment_status: 'pending',
      created_at: new Date().toISOString(),
      court: {
        name: `Court ${courtId.slice(-1)}`,
        surface_type: 'hard'
      },
      user: {
        full_name: 'Current User',
        avatar_url: undefined
      }
    };

    setBookings(prev => [...prev, newBooking]);
    return newBooking;
  };

  return {
    bookings,
    loading,
    getAvailableSlots,
    createBooking,
    refetch: fetchBookings
  };
}