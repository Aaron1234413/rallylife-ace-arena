import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface PlayAvailability {
  id: string;
  player_id: string;
  club_id: string;
  is_available: boolean;
  preferred_times: any; // JSON field from Supabase
  notes?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
    utr_rating?: number;
    usta_rating?: number;
    location?: string;
  };
}

export interface SkillMatchedPlayer {
  player_id: string;
  full_name: string;
  avatar_url: string | null;
  utr_rating: number;
  usta_rating: number;
  location: string | null;
  notes: string | null;
  preferred_times: any; // JSON field from Supabase
  expires_at: string;
  skill_match_score: number;
}

export function usePlayAvailability(clubId: string) {
  const { user } = useAuth();
  const [availablePlayers, setAvailablePlayers] = useState<PlayAvailability[]>([]);
  const [skillMatchedPlayers, setSkillMatchedPlayers] = useState<SkillMatchedPlayer[]>([]);
  const [userAvailability, setUserAvailability] = useState<PlayAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch all available players in the club
  const fetchAvailablePlayers = async () => {
    if (!user || !clubId) return;

    try {
      const { data, error } = await supabase
        .from('play_availability')
        .select(`
          *,
          profiles:player_id (
            full_name,
            avatar_url,
            utr_rating,
            usta_rating,
            location
          )
        `)
        .eq('club_id', clubId)
        .eq('is_available', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailablePlayers((data as any) || []);
    } catch (error) {
      console.error('Error fetching available players:', error);
    }
  };

  // Fetch skill-matched players
  const fetchSkillMatchedPlayers = async () => {
    if (!user || !clubId) return;

    try {
      const { data, error } = await supabase
        .rpc('get_skill_matched_players', {
          club_id_param: clubId,
          utr_tolerance: 0.5,
          usta_tolerance: 0.5
        });

      if (error) throw error;
      setSkillMatchedPlayers((data as any) || []);
    } catch (error) {
      console.error('Error fetching skill-matched players:', error);
    }
  };

  // Fetch current user's availability
  const fetchUserAvailability = async () => {
    if (!user || !clubId) return;

    try {
      const { data, error } = await supabase
        .from('play_availability')
        .select('*')
        .eq('player_id', user.id)
        .eq('club_id', clubId)
        .maybeSingle();

      if (error) throw error;
      setUserAvailability(data as any);
    } catch (error) {
      console.error('Error fetching user availability:', error);
    }
  };

  // Toggle user's availability
  const toggleAvailability = async (
    isAvailable: boolean,
    preferredTimes: { morning?: boolean; afternoon?: boolean; evening?: boolean } = {
      morning: true,
      afternoon: true,
      evening: true
    },
    notes?: string
  ) => {
    if (!user || !clubId) return false;

    setUpdating(true);
    try {
      const { data, error } = await supabase
        .rpc('toggle_play_availability', {
          club_id_param: clubId,
          is_available_param: isAvailable,
          preferred_times_param: preferredTimes,
          notes_param: notes
        });

      if (error) throw error;

      const result = data as { success: boolean; action: string; is_available: boolean; expires_at: string; error?: string };
      
      if (result.success) {
        toast.success(
          isAvailable 
            ? `You're now looking to play! (expires in 7 days)`
            : 'Availability status updated'
        );
        
        // Refresh data
        await Promise.all([
          fetchUserAvailability(),
          fetchAvailablePlayers(),
          fetchSkillMatchedPlayers()
        ]);
        
        return true;
      } else {
        toast.error(result.error || 'Failed to update availability');
        return false;
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Failed to update availability');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (!user || !clubId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchUserAvailability(),
          fetchAvailablePlayers(),
          fetchSkillMatchedPlayers()
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, clubId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user || !clubId) return;

    const channel = supabase
      .channel(`play_availability_${clubId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'play_availability',
          filter: `club_id=eq.${clubId}`
        },
        () => {
          // Refresh data when availability changes
          fetchAvailablePlayers();
          fetchSkillMatchedPlayers();
          fetchUserAvailability();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, clubId]);

  return {
    availablePlayers,
    skillMatchedPlayers,
    userAvailability,
    loading,
    updating,
    toggleAvailability,
    refreshData: async () => {
      await Promise.all([
        fetchUserAvailability(),
        fetchAvailablePlayers(),
        fetchSkillMatchedPlayers()
      ]);
    }
  };
}