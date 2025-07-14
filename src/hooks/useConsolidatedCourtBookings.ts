import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useHybridPayment } from './useHybridPayment';
import { useTokenRedemption } from './useTokenRedemption';
import type { Database } from '@/integrations/supabase/types';

type ClubCourtBooking = Database['public']['Tables']['club_court_bookings']['Row'];
type ClubCourtBookingInsert = Database['public']['Tables']['club_court_bookings']['Insert'];
type ClubCourt = Database['public']['Tables']['club_courts']['Row'];

export interface CourtBooking {
  id: string;
  court_id: string;
  user_id: string;
  player_id?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  start_datetime: string;
  end_datetime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_method: 'tokens' | 'cash' | 'stripe' | 'hybrid';
  payment_status: string;
  total_cost_tokens: number;
  total_cost_money: number;
  tokens_used: number;
  base_amount?: number;
  convenience_fee?: number;
  total_amount?: number;
  stripe_session_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  club_id: string;
  club_courts?: {
    id: string;
    name: string;
    surface_type: string;
    club_id: string;
    hourly_rate_tokens: number;
    hourly_rate_money?: number;
  };
}

export interface BookingConflictCheck {
  hasConflict: boolean;
  conflictingBookings?: CourtBooking[];
}

export interface TimeSlot {
  start: Date;
  end: Date;
  time: string;
  available: boolean;
}

export function useConsolidatedCourtBookings(clubId?: string) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<CourtBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!clubId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('club_court_bookings')
        .select(`
          *,
          club_courts!inner(
            id,
            name,
            surface_type,
            club_id,
            hourly_rate_tokens,
            hourly_rate_money
          )
        `)
        .eq('club_id', clubId)
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Transform data to unified format
      const transformedBookings: CourtBooking[] = (data || []).map(booking => ({
        ...booking,
        player_id: booking.player_id || booking.user_id,
        start_datetime: `${booking.booking_date}T${booking.start_time}:00`,
        end_datetime: `${booking.booking_date}T${booking.end_time}:00`,
        status: booking.status as 'pending' | 'confirmed' | 'cancelled',
        payment_method: booking.payment_method as 'tokens' | 'cash' | 'stripe' | 'hybrid',
        total_cost_tokens: booking.total_cost_tokens || booking.tokens_used || 0,
        total_cost_money: booking.total_cost_money || booking.base_amount || 0,
        club_courts: booking.club_courts
      }));

      setBookings(transformedBookings);
    } catch (err) {
      console.error('Error fetching court bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('club_court_bookings')
        .select(`
          *,
          club_courts!inner(
            id,
            name,
            surface_type,
            club_id,
            hourly_rate_tokens,
            hourly_rate_money
          ),
          clubs!inner(
            id,
            name
          )
        `)
        .or(`user_id.eq.${userId},player_id.eq.${userId}`)
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (error) throw error;

      return (data || []).map(booking => ({
        ...booking,
        player_id: booking.player_id || booking.user_id,
        start_datetime: `${booking.booking_date}T${booking.start_time}:00`,
        end_datetime: `${booking.booking_date}T${booking.end_time}:00`,
        status: booking.status as 'pending' | 'confirmed' | 'cancelled',
        payment_method: booking.payment_method as 'tokens' | 'cash' | 'stripe' | 'hybrid',
        total_cost_tokens: booking.total_cost_tokens || booking.tokens_used || 0,
        total_cost_money: booking.total_cost_money || booking.base_amount || 0,
      }));
    } catch (err) {
      console.error('Error fetching user bookings:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkBookingConflict = async (
    courtId: string,
    bookingDate: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<BookingConflictCheck> => {
    try {
      const { data: overlappingBookings, error } = await supabase
        .from('club_court_bookings')
        .select('*')
        .eq('court_id', courtId)
        .eq('booking_date', bookingDate)
        .eq('status', 'confirmed')
        .neq('id', excludeBookingId || '')
        .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`);

      if (error) throw error;
      
      return { 
        hasConflict: (overlappingBookings?.length || 0) > 0,
        conflictingBookings: overlappingBookings?.map(booking => ({
          ...booking,
          player_id: booking.player_id || booking.user_id,
          start_datetime: `${booking.booking_date}T${booking.start_time}:00`,
          end_datetime: `${booking.booking_date}T${booking.end_time}:00`,
          status: booking.status as 'pending' | 'confirmed' | 'cancelled',
          payment_method: booking.payment_method as 'tokens' | 'cash' | 'stripe' | 'hybrid',
          total_cost_tokens: booking.total_cost_tokens || booking.tokens_used || 0,
          total_cost_money: booking.total_cost_money || booking.base_amount || 0,
        })) || []
      };
    } catch (err) {
      console.error('Error checking booking conflict:', err);
      return { hasConflict: false };
    }
  };

  const getAvailableSlots = (courtId: string, date: string): string[] => {
    const allSlots = [
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00'
    ];

    const bookedSlots = bookings
      .filter(booking => 
        booking.court_id === courtId && 
        booking.booking_date === date &&
        booking.status === 'confirmed'
      )
      .map(booking => booking.start_time.substring(0, 5));

    return allSlots.filter(slot => !bookedSlots.includes(slot));
  };

  const getAvailableTimeSlots = async (courtId: string, date: Date): Promise<TimeSlot[]> => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      const { data: existingBookings, error } = await supabase
        .from('club_court_bookings')
        .select('start_time, end_time')
        .eq('court_id', courtId)
        .eq('booking_date', dateStr)
        .eq('status', 'confirmed');

      if (error) throw error;

      const availableSlots: TimeSlot[] = [];
      for (let hour = 8; hour < 22; hour++) {
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        const nextHourStr = `${(hour + 1).toString().padStart(2, '0')}:00`;
        
        const hasConflict = existingBookings?.some(booking => {
          return (
            (timeStr >= booking.start_time && timeStr < booking.end_time) ||
            (nextHourStr > booking.start_time && nextHourStr <= booking.end_time) ||
            (timeStr <= booking.start_time && nextHourStr >= booking.end_time)
          );
        });

        const slotStart = new Date(date);
        slotStart.setHours(hour, 0, 0, 0);
        
        const slotEnd = new Date(date);
        slotEnd.setHours(hour + 1, 0, 0, 0);

        availableSlots.push({
          start: slotStart,
          end: slotEnd,
          time: timeStr,
          available: !hasConflict
        });
      }

      return availableSlots;
    } catch (err) {
      console.error('Error getting available time slots:', err);
      return [];
    }
  };

  const createBooking = async (bookingData: {
    court_id: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    payment_method: 'tokens' | 'hybrid' | 'stripe';
    tokens_used?: number;
    cash_amount?: number;
    notes?: string;
  }) => {
    if (!user || !clubId) throw new Error('User not authenticated');

    try {
      // Check for conflicts first
      const conflict = await checkBookingConflict(
        bookingData.court_id,
        bookingData.booking_date,
        bookingData.start_time,
        bookingData.end_time
      );

      if (conflict.hasConflict) {
        throw new Error('This time slot is already booked or unavailable');
      }

      // Get court information for pricing
      const { data: court, error: courtError } = await supabase
        .from('club_courts')
        .select('hourly_rate_tokens, hourly_rate_money')
        .eq('id', bookingData.court_id)
        .single();

      if (courtError) throw courtError;

      const booking: ClubCourtBookingInsert = {
        club_id: clubId,
        court_id: bookingData.court_id,
        user_id: user.id,
        player_id: user.id,
        booking_date: bookingData.booking_date,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        status: 'confirmed',
        payment_method: bookingData.payment_method,
        payment_status: 'paid',
        tokens_used: bookingData.tokens_used || 0,
        total_cost_tokens: bookingData.tokens_used || 0,
        total_cost_money: bookingData.cash_amount || 0,
        base_amount: bookingData.cash_amount || court?.hourly_rate_money || 0,
        notes: bookingData.notes
      };

      const { data, error } = await supabase
        .from('club_court_bookings')
        .insert([booking])
        .select(`
          *,
          club_courts!inner(
            id,
            name,
            surface_type,
            club_id,
            hourly_rate_tokens,
            hourly_rate_money
          )
        `)
        .single();

      if (error) throw error;

      const newBooking: CourtBooking = {
        ...data,
        player_id: data.player_id || data.user_id,
        start_datetime: `${data.booking_date}T${data.start_time}:00`,
        end_datetime: `${data.booking_date}T${data.end_time}:00`,
        status: data.status as 'pending' | 'confirmed' | 'cancelled',
        payment_method: data.payment_method as 'tokens' | 'cash' | 'stripe' | 'hybrid',
        total_cost_tokens: data.total_cost_tokens || data.tokens_used || 0,
        total_cost_money: data.total_cost_money || data.base_amount || 0,
      };

      setBookings(prev => [...prev, newBooking]);
      toast.success('Court booking created successfully!');
      return newBooking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      toast.error(errorMessage);
      throw err;
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from('club_court_bookings')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      setBookings(prev => prev.map(booking =>
        booking.id === id ? { ...booking, status: 'cancelled' } : booking
      ));
      toast.success('Booking cancelled successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel booking';
      toast.error(errorMessage);
      throw err;
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!clubId) return;

    fetchBookings();

    const channel = supabase
      .channel('club-court-bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'club_court_bookings',
          filter: `club_id=eq.${clubId}`
        },
        (payload) => {
          console.log('Court booking change:', payload);
          fetchBookings(); // Refetch on any changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clubId]);

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    fetchUserBookings,
    createBooking,
    cancelBooking,
    checkBookingConflict,
    getAvailableSlots,
    getAvailableTimeSlots,
    refetch: fetchBookings
  };
}