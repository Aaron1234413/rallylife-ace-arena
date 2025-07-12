import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ClubMember {
  id: string;
  user_id: string;
  club_id: string;
  role: string;
  status: string;
  joined_at: string;
  permissions: any;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email?: string;
  };
}

export function useRealTimeClubMembers(clubId: string) {
  const { user } = useAuth();
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    if (!user || !clubId) return;

    try {
      const { data, error } = await supabase
        .from('club_memberships')
        .select('*')
        .eq('club_id', clubId)
        .eq('status', 'active')
        .order('joined_at', { ascending: false });

      if (error) throw error;

      if (!data?.length) {
        setMembers([]);
        return;
      }

      // Get user profiles for the members
      const userIds = data.map(membership => membership.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .in('id', userIds);

      const formattedMembers: ClubMember[] = data.map(membership => ({
        id: membership.id,
        user_id: membership.user_id,
        club_id: membership.club_id,
        role: membership.role,
        status: membership.status,
        joined_at: membership.joined_at,
        permissions: membership.permissions,
        user: profiles?.find(p => p.id === membership.user_id) ? {
          id: membership.user_id,
          full_name: profiles.find(p => p.id === membership.user_id)?.full_name || 'Unknown User',
          avatar_url: profiles.find(p => p.id === membership.user_id)?.avatar_url,
          email: profiles.find(p => p.id === membership.user_id)?.email
        } : undefined
      }));

      setMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching club members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !clubId) return;

    fetchMembers();

    // Set up realtime subscription for member changes
    const channel = supabase
      .channel('club-members-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'club_memberships',
          filter: `club_id=eq.${clubId}`
        },
        (payload) => {
          console.log('Club membership change:', payload);
          fetchMembers(); // Refetch when memberships change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, clubId]);

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('club_memberships')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', memberId);

      if (error) throw error;

      // Optimistically update local state
      setMembers(prev => prev.map(member => 
        member.id === memberId 
          ? { ...member, role: newRole }
          : member
      ));

      return true;
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('club_memberships')
        .update({ status: 'removed', updated_at: new Date().toISOString() })
        .eq('id', memberId);

      if (error) throw error;

      // Optimistically update local state
      setMembers(prev => prev.filter(member => member.id !== memberId));

      // Member count will be automatically updated by database trigger
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  };

  const getMembersByRole = (role: string) => {
    return members.filter(member => member.role === role);
  };

  const getTotalMemberCount = () => {
    return members.length;
  };

  const getOnlineMembers = () => {
    // This would integrate with presence tracking in a real implementation
    return members.filter(() => Math.random() > 0.7); // Mock online status
  };

  return {
    members,
    loading,
    updateMemberRole,
    removeMember,
    getMembersByRole,
    getTotalMemberCount,
    getOnlineMembers,
    refetch: fetchMembers
  };
}