import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ClubEvent {
  id: string;
  club_id: string;
  organizer_id: string;
  title: string;
  description?: string;
  event_type: string;
  start_datetime: string;
  end_datetime: string;
  location?: string;
  max_participants?: number;
  registration_fee_tokens: number;
  registration_fee_money: number;
  is_public: boolean;
  status: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  organizer_profile?: {
    full_name: string;
    avatar_url: string | null;
  } | null;
  participant_count?: number;
  is_registered?: boolean;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  registration_datetime: string;
  payment_status: string;
  attendance_status: string;
  notes?: string;
  user_profile?: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

export function useClubEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch club events
  const fetchEvents = async (clubId: string) => {
    try {
      const { data, error } = await supabase
        .from('club_events')
        .select('*')
        .eq('club_id', clubId)
        .order('start_datetime', { ascending: true });

      if (error) throw error;

      // Get participant counts and user registration status
      const eventsWithMeta = await Promise.all((data || []).map(async (event) => {
        // Get participant count
        const { count } = await supabase
          .from('club_event_participants')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id);

        // Check if current user is registered
        const { data: userRegistration } = await supabase
          .from('club_event_participants')
          .select('id')
          .eq('event_id', event.id)
          .eq('user_id', user?.id || '')
          .single();

        // Get organizer profile
        const { data: organizerProfile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', event.organizer_id)
          .single();

        return {
          ...event,
          participant_count: count || 0,
          is_registered: !!userRegistration,
          organizer_profile: organizerProfile
        };
      }));

      setEvents(eventsWithMeta);
      return eventsWithMeta;
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
      return [];
    }
  };

  // Fetch event participants
  const fetchParticipants = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('club_event_participants')
        .select(`
          *,
          user_profile:profiles!club_event_participants_user_id_fkey(full_name, avatar_url)
        `)
        .eq('event_id', eventId)
        .order('registration_datetime');

      if (error) throw error;
      setParticipants((data as any[]) || []);
      return (data as any[]) || [];
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast.error('Failed to load participants');
      return [];
    }
  };

  // Create a new event
  const createEvent = async (eventData: {
    club_id: string;
    title: string;
    description?: string;
    event_type: string;
    start_datetime: string;
    end_datetime: string;
    location?: string;
    max_participants?: number;
    registration_fee_tokens?: number;
    registration_fee_money?: number;
    is_public?: boolean;
  }) => {
    try {
      const { data, error } = await supabase
        .from('club_events')
        .insert({
          organizer_id: user?.id,
          registration_fee_tokens: 0,
          registration_fee_money: 0,
          is_public: true,
          ...eventData
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Event created successfully!');
      await fetchEvents(eventData.club_id);
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
      throw error;
    }
  };

  // Update an event
  const updateEvent = async (eventId: string, updates: Partial<ClubEvent>) => {
    try {
      const { data, error } = await supabase
        .from('club_events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Event updated successfully!');
      
      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, ...updates } : event
      ));
      
      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
      throw error;
    }
  };

  // Delete an event
  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('club_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast.success('Event deleted successfully!');
      setEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
      throw error;
    }
  };

  // Register for an event
  const registerForEvent = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('club_event_participants')
        .insert({
          event_id: eventId,
          user_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Successfully registered for event!');
      
      // Update event registration status
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, is_registered: true, participant_count: (event.participant_count || 0) + 1 }
          : event
      ));
      
      return data;
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error('Failed to register for event');
      throw error;
    }
  };

  // Unregister from an event
  const unregisterFromEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('club_event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success('Successfully unregistered from event');
      
      // Update event registration status
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, is_registered: false, participant_count: Math.max((event.participant_count || 1) - 1, 0) }
          : event
      ));
    } catch (error) {
      console.error('Error unregistering from event:', error);
      toast.error('Failed to unregister from event');
      throw error;
    }
  };

  // Update participant attendance
  const updateParticipantAttendance = async (participantId: string, attendanceStatus: string) => {
    try {
      const { data, error } = await supabase
        .from('club_event_participants')
        .update({ attendance_status: attendanceStatus })
        .eq('id', participantId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Attendance updated successfully!');
      
      // Update local state
      setParticipants(prev => prev.map(participant => 
        participant.id === participantId 
          ? { ...participant, attendance_status: attendanceStatus }
          : participant
      ));
      
      return data;
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Failed to update attendance');
      throw error;
    }
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return {
    events,
    participants,
    loading,
    fetchEvents,
    fetchParticipants,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    updateParticipantAttendance
  };
}