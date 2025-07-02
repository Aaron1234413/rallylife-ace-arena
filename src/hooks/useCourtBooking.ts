import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Court {
  id: string;
  club_id: string;
  name: string;
  surface_type: string;
  hourly_rate_tokens: number;
  hourly_rate_money: number;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CourtAvailability {
  id: string;
  court_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_bookable: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourtBooking {
  id: string;
  court_id: string;
  player_id: string;
  start_datetime: string;
  end_datetime: string;
  total_cost_tokens: number;
  total_cost_money: number;
  payment_method: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  court?: Court;
  player_profile?: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

export function useCourtBooking() {
  const { user } = useAuth();
  const [courts, setCourts] = useState<Court[]>([]);
  const [availability, setAvailability] = useState<CourtAvailability[]>([]);
  const [bookings, setBookings] = useState<CourtBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch courts for a club
  const fetchCourts = async (clubId: string) => {
    try {
      const { data, error } = await supabase
        .from('club_courts')
        .select('*')
        .eq('club_id', clubId)
        .order('name');

      if (error) throw error;
      setCourts(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching courts:', error);
      toast.error('Failed to load courts');
      return [];
    }
  };

  // Fetch court availability
  const fetchCourtAvailability = async (courtId: string) => {
    try {
      const { data, error } = await supabase
        .from('court_availability')
        .select('*')
        .eq('court_id', courtId)
        .order('day_of_week, start_time');

      if (error) throw error;
      setAvailability(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching court availability:', error);
      toast.error('Failed to load court availability');
      return [];
    }
  };

  // Fetch bookings for a court or user
  const fetchBookings = async (filters: { courtId?: string; clubId?: string; playerId?: string } = {}) => {
    try {
      let query = supabase
        .from('court_bookings')
        .select(`
          *,
          court:club_courts(*),
          player_profile:profiles!court_bookings_player_id_fkey(full_name, avatar_url)
        `)
        .order('start_datetime');

      if (filters.courtId) {
        query = query.eq('court_id', filters.courtId);
      }
      
      if (filters.playerId) {
        query = query.eq('player_id', filters.playerId);
      }

      if (filters.clubId) {
        // Get court IDs for the club first
        const { data: clubCourts } = await supabase
          .from('club_courts')
          .select('id')
          .eq('club_id', filters.clubId);
        
        if (clubCourts && clubCourts.length > 0) {
          const courtIds = clubCourts.map(court => court.id);
          query = query.in('court_id', courtIds);
        } else {
          // No courts in this club
          setBookings([]);
          return [];
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookings((data as any[]) || []);
      return (data as any[]) || [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
      return [];
    }
  };

  // Create a new court
  const createCourt = async (clubId: string, courtData: {
    name: string;
    surface_type: string;
    hourly_rate_tokens: number;
    hourly_rate_money: number;
    description?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('club_courts')
        .insert({
          club_id: clubId,
          ...courtData
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Court created successfully!');
      await fetchCourts(clubId);
      return data;
    } catch (error) {
      console.error('Error creating court:', error);
      toast.error('Failed to create court');
      throw error;
    }
  };

  // Update a court
  const updateCourt = async (courtId: string, updates: Partial<Court>) => {
    try {
      const { data, error } = await supabase
        .from('club_courts')
        .update(updates)
        .eq('id', courtId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Court updated successfully!');
      
      // Update local state
      setCourts(prev => prev.map(court => 
        court.id === courtId ? { ...court, ...updates } : court
      ));
      
      return data;
    } catch (error) {
      console.error('Error updating court:', error);
      toast.error('Failed to update court');
      throw error;
    }
  };

  // Delete a court
  const deleteCourt = async (courtId: string) => {
    try {
      const { error } = await supabase
        .from('club_courts')
        .delete()
        .eq('id', courtId);

      if (error) throw error;

      toast.success('Court deleted successfully!');
      setCourts(prev => prev.filter(court => court.id !== courtId));
    } catch (error) {
      console.error('Error deleting court:', error);
      toast.error('Failed to delete court');
      throw error;
    }
  };

  // Set court availability
  const setCourtAvailability = async (courtId: string, availabilityData: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_bookable: boolean;
  }>) => {
    try {
      // Delete existing availability
      await supabase
        .from('court_availability')
        .delete()
        .eq('court_id', courtId);

      // Insert new availability
      const { data, error } = await supabase
        .from('court_availability')
        .insert(
          availabilityData.map(slot => ({
            court_id: courtId,
            ...slot
          }))
        )
        .select();

      if (error) throw error;

      toast.success('Court availability updated successfully!');
      await fetchCourtAvailability(courtId);
      return data;
    } catch (error) {
      console.error('Error setting court availability:', error);
      toast.error('Failed to update court availability');
      throw error;
    }
  };

  // Calculate booking cost
  const calculateBookingCost = async (courtId: string, startTime: string, endTime: string) => {
    try {
      const { data, error } = await supabase.rpc('calculate_booking_cost', {
        p_court_id: courtId,
        p_start_datetime: startTime,
        p_end_datetime: endTime
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error calculating booking cost:', error);
      throw error;
    }
  };

  // Create a booking
  const createBooking = async (
    courtId: string, 
    startTime: string, 
    endTime: string,
    paymentMethod: string = 'tokens',
    notes?: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('create_court_booking', {
        p_court_id: courtId,
        p_start_datetime: startTime,
        p_end_datetime: endTime,
        p_payment_method: paymentMethod,
        p_notes: notes
      });

      if (error) throw error;

      const result = data as any;
      if (!result?.success) {
        toast.error(result?.error || 'Failed to create booking');
        throw new Error(result?.error);
      }

      toast.success('Booking created successfully!');
      return result;
    } catch (error: any) {
      console.error('Error creating booking:', error);
      if (!error.message?.includes('Time slot already booked')) {
        toast.error('Failed to create booking');
      }
      throw error;
    }
  };

  // Cancel a booking
  const cancelBooking = async (bookingId: string) => {
    try {
      const { data, error } = await supabase
        .from('court_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Booking cancelled successfully!');
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
      ));
      
      return data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
      throw error;
    }
  };

  // Get user's upcoming bookings
  const getUserBookings = async () => {
    if (!user) return [];
    return await fetchBookings({ playerId: user.id });
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return {
    courts,
    availability,
    bookings,
    loading,
    fetchCourts,
    fetchCourtAvailability,
    fetchBookings,
    createCourt,
    updateCourt,
    deleteCourt,
    setCourtAvailability,
    calculateBookingCost,
    createBooking,
    cancelBooking,
    getUserBookings
  };
}