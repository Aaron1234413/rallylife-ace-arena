import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type ClubCourt = Database['public']['Tables']['club_courts']['Row'];
type ClubCourtInsert = Database['public']['Tables']['club_courts']['Insert'];

export function useClubCourts(clubId?: string) {
  const [courts, setCourts] = useState<ClubCourt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourts = async () => {
    if (!clubId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('club_courts')
        .select('*')
        .eq('club_id', clubId)
        .order('name');

      if (error) throw error;
      setCourts(data || []);
    } catch (err) {
      console.error('Error fetching club courts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch courts');
    } finally {
      setLoading(false);
    }
  };

  const createCourt = async (court: Omit<ClubCourtInsert, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('club_courts')
        .insert([court])
        .select()
        .single();

      if (error) throw error;

      setCourts(prev => [...prev, data]);
      toast.success('Court created successfully!');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create court';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateCourt = async (id: string, updates: Partial<ClubCourtInsert>) => {
    try {
      const { data, error } = await supabase
        .from('club_courts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCourts(prev => prev.map(court => 
        court.id === id ? data : court
      ));
      toast.success('Court updated successfully!');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update court';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteCourt = async (id: string) => {
    try {
      const { error } = await supabase
        .from('club_courts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCourts(prev => prev.filter(court => court.id !== id));
      toast.success('Court deleted successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete court';
      toast.error(errorMessage);
      throw err;
    }
  };

  const toggleCourtStatus = async (id: string, isActive: boolean) => {
    try {
      const { data, error } = await supabase
        .from('club_courts')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCourts(prev => prev.map(court => 
        court.id === id ? data : court
      ));
      toast.success(`Court ${isActive ? 'activated' : 'deactivated'} successfully!`);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update court status';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    if (clubId) {
      fetchCourts();
    }
  }, [clubId]);

  return {
    courts,
    loading,
    error,
    fetchCourts,
    createCourt,
    updateCourt,
    deleteCourt,
    toggleCourtStatus
  };
}