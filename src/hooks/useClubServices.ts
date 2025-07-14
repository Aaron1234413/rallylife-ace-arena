import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { calculateServicePricing } from '@/utils/pricing';

export interface ClubService {
  id: string;
  club_id: string;
  organizer_id: string;
  name: string;
  description?: string;
  service_type: string;
  price_tokens: number;
  price_usd: number;
  hybrid_payment_enabled: boolean;
  duration_minutes?: number;
  max_participants?: number;
  available_slots?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  organizer_name?: string;
}

export interface ServiceBooking {
  id: string;
  service_id: string;
  player_id: string; // Updated to match actual database schema
  club_id: string;
  booking_status: string;
  payment_type: string; // Updated to match actual database schema
  tokens_paid: number; // Updated to match actual database schema
  usd_paid: number; // Updated to match actual database schema
  stripe_payment_intent_id?: string;
  scheduled_date?: string;
  created_at: string;
  updated_at: string;
  // Legacy compatibility fields (for existing code)
  user_id?: string;
  payment_method?: string;
  tokens_used?: number;
  cash_amount_cents?: number;
}

export function useClubServices(clubId: string) {
  const [services, setServices] = useState<ClubService[]>([]);
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    if (!clubId) return;

    try {
      const { data, error } = await supabase
        .from('club_services')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get organizer names separately
      const servicesWithOrganizerNames = await Promise.all(
        (data || []).map(async (service) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', service.organizer_id)
            .single();
          
          return {
            ...service,
            organizer_name: profileData?.full_name || 'Unknown'
          };
        })
      );

      setServices(servicesWithOrganizerNames);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    }
  };

  const fetchUserBookings = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data, error } = await supabase
        .from('service_bookings')
        .select('*')
        .eq('player_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to match our interface
      const mappedBookings = (data || []).map((booking: any) => ({
        id: booking.id,
        service_id: booking.service_id,
        player_id: booking.player_id,
        club_id: booking.club_id,
        booking_status: booking.booking_status,
        payment_type: booking.payment_type || 'unknown',
        tokens_paid: booking.tokens_paid || 0,
        usd_paid: booking.usd_paid || 0,
        stripe_payment_intent_id: booking.stripe_payment_intent_id,
        scheduled_date: booking.scheduled_date,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        // Legacy compatibility fields
        user_id: booking.player_id,
        payment_method: booking.payment_type || 'unknown',
        tokens_used: booking.tokens_paid || 0,
        cash_amount_cents: booking.usd_paid || 0
      }));
      
      setBookings(mappedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const createService = async (serviceData: {
    name: string;
    description?: string;
    service_type: string;
    price_tokens: number;
    price_usd: number;
    hybrid_payment_enabled: boolean;
    duration_minutes?: number;
    max_participants?: number;
    available_slots?: number;
  }): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('create_club_service', {
        club_id_param: clubId,
        service_name: serviceData.name,
        service_description: serviceData.description || '',
        service_type_param: serviceData.service_type,
        price_tokens_param: serviceData.price_tokens,
        price_usd_param: serviceData.price_usd,
        hybrid_payment_enabled_param: serviceData.hybrid_payment_enabled,
        duration_minutes_param: serviceData.duration_minutes || 60,
        max_participants_param: serviceData.max_participants || 1,
        available_slots_param: serviceData.available_slots || 10
      });

      if (error) throw error;

      toast.success('Service created successfully');
      await fetchServices();
      return data;
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service');
      return null;
    }
  };

  const bookService = async (
    serviceId: string, 
    tokensToUse: number, 
    cashAmountCents: number
  ): Promise<string | null> => {
    try {
      const service = services.find(s => s.id === serviceId);
      if (!service) throw new Error('Service not found');
      
      const cashAmount = cashAmountCents / 100; // Convert cents to dollars
      
      // Use Stripe checkout for all bookings (handles both token-only and hybrid payments)
      const { data, error } = await supabase.functions.invoke('create-service-booking-checkout', {
        body: {
          service_id: serviceId,
          service_name: service.name,
          service_price_tokens: service.price_tokens,
          service_price_usd: service.price_usd,
          tokens_used: tokensToUse,
          cash_amount: cashAmount,
          total_amount: cashAmount,
          club_id: service.club_id,
          scheduled_date: new Date().toISOString().split('T')[0]
        }
      });
      
      if (error) {
        console.error('Service booking error:', error);
        toast.error('Failed to book service');
        throw error;
      }
      
      if (data.payment_url) {
        // Redirect to Stripe checkout for cash payment
        window.open(data.payment_url, '_blank');
        return data.booking_id;
      } else if (data.success) {
        // Token-only booking completed
        toast.success('Service booked successfully with tokens!');
        await fetchServices();
        await fetchUserBookings();
        return data.booking_id;
      }
      
      return null;
    } catch (error) {
      console.error('Error booking service:', error);
      toast.error('Failed to book service');
      return null;
    }
  };

  const updateService = async (
    serviceId: string, 
    updates: Partial<ClubService>
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('update_club_service', {
        service_id_param: serviceId,
        service_name: updates.name,
        service_description: updates.description,
        price_tokens_param: updates.price_tokens,
        price_usd_param: updates.price_usd,
        hybrid_payment_enabled_param: updates.hybrid_payment_enabled,
        duration_minutes_param: updates.duration_minutes,
        max_participants_param: updates.max_participants,
        is_active_param: updates.is_active
      });

      if (error) throw error;
      
      if (data && typeof data === 'object' && 'success' in data && !data.success) {
        throw new Error((data as any).error || 'Failed to update service');
      }

      toast.success('Service updated successfully');
      await fetchServices();
      return true;
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
      return false;
    }
  };

  const deleteService = async (serviceId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('club_services')
        .update({ is_active: false })
        .eq('id', serviceId);

      if (error) throw error;

      toast.success('Service deactivated successfully');
      await fetchServices();
      return true;
    } catch (error) {
      console.error('Error deactivating service:', error);
      toast.error('Failed to deactivate service');
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchServices(), fetchUserBookings()]);
      setLoading(false);
    };

    loadData();
  }, [clubId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!clubId) return;

    const channel = supabase
      .channel('club-services-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'club_services',
          filter: `club_id=eq.${clubId}`
        },
        () => fetchServices()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_bookings'
        },
        () => fetchUserBookings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clubId]);

  return {
    services,
    bookings,
    loading,
    createService,
    bookService,
    updateService,
    deleteService,
    refetch: async () => {
      await Promise.all([fetchServices(), fetchUserBookings()]);
    }
  };
}