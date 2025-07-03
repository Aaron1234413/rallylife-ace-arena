import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type CourtBooking = Database['public']['Tables']['court_bookings']['Row'];
type CourtBookingInsert = Database['public']['Tables']['court_bookings']['Insert'];
type ClubCourt = Database['public']['Tables']['club_courts']['Row'];

export interface BookingConflictCheck {
  hasConflict: boolean;
  conflictingBookings?: CourtBooking[];
}

export function useCourtBookings(clubId?: string) {
  const [bookings, setBookings] = useState<CourtBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!clubId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('court_bookings')
        .select(`
          *,
          club_courts!inner(
            id,
            name,
            surface_type,
            club_id
          )
        `)
        .eq('club_courts.club_id', clubId)
        .order('start_datetime', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
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
        .from('court_bookings')
        .select(`
          *,
          club_courts!inner(
            id,
            name,
            surface_type,
            club_id
          ),
          clubs!inner(
            id,
            name
          )
        `)
        .eq('player_id', userId)
        .order('start_datetime', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching user bookings:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkBookingConflict = async (
    courtId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string
  ): Promise<BookingConflictCheck> => {
    try {
      // Check for overlapping bookings manually
      const { data: overlappingBookings, error } = await supabase
        .from('court_bookings')
        .select('*')
        .eq('court_id', courtId)
        .eq('status', 'confirmed')
        .neq('id', excludeBookingId || '')
        .or(`and(start_datetime.lt.${endTime.toISOString()},end_datetime.gt.${startTime.toISOString()})`);

      if (error) throw error;
      
      return { 
        hasConflict: (overlappingBookings?.length || 0) > 0,
        conflictingBookings: overlappingBookings || []
      };
    } catch (err) {
      console.error('Error checking booking conflict:', err);
      return { hasConflict: false };
    }
  };

  const createBooking = async (booking: Omit<CourtBookingInsert, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Check for conflicts first
      const conflict = await checkBookingConflict(
        booking.court_id,
        new Date(booking.start_datetime),
        new Date(booking.end_datetime)
      );

      if (conflict.hasConflict) {
        throw new Error('This time slot is already booked or unavailable');
      }

      const { data, error } = await supabase
        .from('court_bookings')
        .insert([booking])
        .select(`
          *,
          club_courts!inner(
            id,
            name,
            surface_type
          )
        `)
        .single();

      if (error) throw error;

      setBookings(prev => [...prev, data]);
      toast.success('Court booking created successfully!');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateBooking = async (id: string, updates: Partial<CourtBookingInsert>) => {
    try {
      // If updating time, check for conflicts
      if (updates.start_datetime || updates.end_datetime) {
        const existingBooking = bookings.find(b => b.id === id);
        if (existingBooking) {
          const startTime = new Date(updates.start_datetime || existingBooking.start_datetime);
          const endTime = new Date(updates.end_datetime || existingBooking.end_datetime);
          
          const conflict = await checkBookingConflict(
            existingBooking.court_id,
            startTime,
            endTime,
            id
          );

          if (conflict.hasConflict) {
            throw new Error('This time slot is already booked or unavailable');
          }
        }
      }

      const { data, error } = await supabase
        .from('court_bookings')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          club_courts!inner(
            id,
            name,
            surface_type
          )
        `)
        .single();

      if (error) throw error;

      setBookings(prev => prev.map(booking => 
        booking.id === id ? data : booking
      ));
      toast.success('Booking updated successfully!');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update booking';
      toast.error(errorMessage);
      throw err;
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from('court_bookings')
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

  const getAvailableTimeSlots = async (courtId: string, date: Date) => {
    try {
      // Get court bookings for the date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: existingBookings, error } = await supabase
        .from('court_bookings')
        .select('start_datetime, end_datetime')
        .eq('court_id', courtId)
        .eq('status', 'confirmed')
        .gte('start_datetime', startOfDay.toISOString())
        .lte('end_datetime', endOfDay.toISOString());

      if (error) throw error;

      // Generate available slots (8 AM to 10 PM, 1-hour slots)
      const availableSlots = [];
      for (let hour = 8; hour < 22; hour++) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, 0, 0, 0);
        
        const slotEnd = new Date(date);
        slotEnd.setHours(hour + 1, 0, 0, 0);

        // Check if slot conflicts with existing bookings
        const hasConflict = existingBookings.some(booking => {
          const bookingStart = new Date(booking.start_datetime);
          const bookingEnd = new Date(booking.end_datetime);
          
          return (
            (slotStart >= bookingStart && slotStart < bookingEnd) ||
            (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
            (slotStart <= bookingStart && slotEnd >= bookingEnd)
          );
        });

        if (!hasConflict) {
          availableSlots.push({
            start: slotStart,
            end: slotEnd,
            time: `${hour.toString().padStart(2, '0')}:00`
          });
        }
      }

      return availableSlots;
    } catch (err) {
      console.error('Error getting available time slots:', err);
      return [];
    }
  };

  useEffect(() => {
    if (clubId) {
      fetchBookings();
    }
  }, [clubId]);

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    fetchUserBookings,
    createBooking,
    updateBooking,
    cancelBooking,
    checkBookingConflict,
    getAvailableTimeSlots
  };
}