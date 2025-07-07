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
        // Mock data for development
        setCourts([
          {
            id: 'court-1',
            club_id: clubId,
            name: 'Court 1',
            surface_type: 'hard',
            hourly_rate_tokens: 50,
            hourly_rate_money: 25,
            is_active: true
          },
          {
            id: 'court-2',
            club_id: clubId,
            name: 'Court 2', 
            surface_type: 'clay',
            hourly_rate_tokens: 60,
            hourly_rate_money: 30,
            is_active: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourts();
  }, [user, clubId]);

  return { courts, loading };
}