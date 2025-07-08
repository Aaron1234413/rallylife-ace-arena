import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { SearchFilters } from '@/components/club/MemberSearchFilter';

export interface EnhancedMember {
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
    utr_rating?: number;
    usta_rating?: number;
    location?: string;
    looking_to_play_until?: string;
  };
}

export function useEnhancedClubMembers(clubId: string) {
  const { user } = useAuth();
  const [members, setMembers] = useState<EnhancedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: '',
    utrRange: [1, 16.5],
    ustaRange: [1, 7],
    showOnlyLookingToPlay: false,
    location: ''
  });

  const fetchMembers = async () => {
    if (!user || !clubId) return;

    try {
      // First get memberships
      const { data: memberships, error: membershipError } = await supabase
        .from('club_memberships')
        .select('*')
        .eq('club_id', clubId)
        .eq('status', 'active')
        .order('joined_at', { ascending: false });

      if (membershipError) throw membershipError;

      if (!memberships?.length) {
        setMembers([]);
        return;
      }

      // Get user profiles for the members
      const userIds = memberships.map(membership => membership.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email, utr_rating, usta_rating, location, looking_to_play_until')
        .in('id', userIds);

      if (profileError) throw profileError;

      const formattedMembers: EnhancedMember[] = memberships.map(membership => ({
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
          email: profiles.find(p => p.id === membership.user_id)?.email,
          utr_rating: profiles.find(p => p.id === membership.user_id)?.utr_rating,
          usta_rating: profiles.find(p => p.id === membership.user_id)?.usta_rating,
          location: profiles.find(p => p.id === membership.user_id)?.location,
          looking_to_play_until: profiles.find(p => p.id === membership.user_id)?.looking_to_play_until
        } : undefined
      }));

      setMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching enhanced club members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter members based on search criteria
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      if (!member.user) return false;

      // Search term filter
      if (searchFilters.searchTerm) {
        const searchLower = searchFilters.searchTerm.toLowerCase();
        if (!member.user.full_name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // UTR Range filter
      if (member.user.utr_rating) {
        if (member.user.utr_rating < searchFilters.utrRange[0] || 
            member.user.utr_rating > searchFilters.utrRange[1]) {
          return false;
        }
      }

      // USTA Range filter
      if (member.user.usta_rating) {
        if (member.user.usta_rating < searchFilters.ustaRange[0] || 
            member.user.usta_rating > searchFilters.ustaRange[1]) {
          return false;
        }
      }

      // Looking to play filter
      if (searchFilters.showOnlyLookingToPlay) {
        if (!member.user.looking_to_play_until || 
            new Date(member.user.looking_to_play_until) <= new Date()) {
          return false;
        }
      }

      // Location filter
      if (searchFilters.location) {
        const locationLower = searchFilters.location.toLowerCase();
        if (!member.user.location?.toLowerCase().includes(locationLower)) {
          return false;
        }
      }

      return true;
    });
  }, [members, searchFilters]);

  // Get skill-matched members (within ±0.5 UTR of current user)
  const skillMatchedMembers = useMemo(() => {
    if (!user) return [];
    
    return members.filter(member => {
      if (!member.user?.utr_rating || member.user_id === user.id) return false;
      
      // Get current user's UTR from their profile
      const currentUserUtr = 4.0; // TODO: Get from current user's profile
      const utrDiff = Math.abs(member.user.utr_rating - currentUserUtr);
      
      return utrDiff <= 0.5;
    });
  }, [members, user]);

  // Get members currently looking to play
  const playersLookingToPlay = useMemo(() => {
    return members.filter(member => {
      if (!member.user?.looking_to_play_until) return false;
      return new Date(member.user.looking_to_play_until) > new Date();
    });
  }, [members]);

  useEffect(() => {
    fetchMembers();
  }, [user, clubId]);

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('club_memberships')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', memberId);

      if (error) throw error;

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

      setMembers(prev => prev.filter(member => member.id !== memberId));

      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  };

  return {
    members,
    filteredMembers,
    skillMatchedMembers,
    playersLookingToPlay,
    loading,
    searchFilters,
    setSearchFilters,
    updateMemberRole,
    removeMember,
    refetch: fetchMembers,
    totalMembers: members.length,
    filteredCount: filteredMembers.length
  };
}