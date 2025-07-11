import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ClubCourt {
  id: string;
  club_id: string;
  name: string;
  surface_type: string;
  description?: string;
  hourly_rate_tokens: number;
  hourly_rate_money: number;
  is_active: boolean;
}

export function useClubCourts(clubId: string) {
  const { user } = useAuth();
  const [courts, setCourts] = useState<ClubCourt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourts = async () => {
      if (!user || !clubId) return;

      try {
        const { data, error } = await supabase
          .from('club_courts')
          .select('*')
          .eq('club_id', clubId)
          .eq('is_active', true);

        if (error) throw error;
        setCourts(data || []);
      } catch (error) {
        console.error('Error fetching courts:', error);
        setCourts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourts();
  }, [user, clubId]);

  return { courts, loading };
}