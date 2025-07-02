import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Club {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  owner_id: string;
  is_public: boolean;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface ClubMembership {
  id: string;
  club_id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  updated_at: string;
}

export function useClubs() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPublicClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClubs(data || []);
    } catch (error) {
      console.error('Error fetching public clubs:', error);
      toast.error('Failed to load clubs');
    }
  };

  const fetchMyClubs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('clubs')
        .select(`
          *,
          club_memberships!inner(role, status)
        `)
        .eq('club_memberships.user_id', user.id)
        .eq('club_memberships.status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyClubs(data || []);
    } catch (error) {
      console.error('Error fetching my clubs:', error);
      toast.error('Failed to load your clubs');
    }
  };

  const createClub = async (clubData: {
    name: string;
    description?: string;
    is_public: boolean;
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('clubs')
        .insert({
          name: clubData.name,
          description: clubData.description,
          is_public: clubData.is_public,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Club created successfully!');
      await fetchMyClubs();
      if (clubData.is_public) {
        await fetchPublicClubs();
      }
      
      return data;
    } catch (error) {
      console.error('Error creating club:', error);
      toast.error('Failed to create club');
      throw error;
    }
  };

  const joinClub = async (clubId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('club_memberships')
        .insert({
          club_id: clubId,
          user_id: user.id,
          role: 'member',
          status: 'active',
        });

      if (error) throw error;

      toast.success('Successfully joined club!');
      await fetchMyClubs();
      await fetchPublicClubs();
    } catch (error) {
      console.error('Error joining club:', error);
      toast.error('Failed to join club');
      throw error;
    }
  };

  const leaveClub = async (clubId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('club_memberships')
        .update({ status: 'inactive' })
        .eq('club_id', clubId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Successfully left club');
      await fetchMyClubs();
      await fetchPublicClubs();
    } catch (error) {
      console.error('Error leaving club:', error);
      toast.error('Failed to leave club');
      throw error;
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchPublicClubs(), fetchMyClubs()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  return {
    clubs,
    myClubs,
    loading,
    createClub,
    joinClub,
    leaveClub,
    refreshData,
  };
}