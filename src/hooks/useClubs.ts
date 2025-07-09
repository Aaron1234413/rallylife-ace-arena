import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Club {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  location: string | null;
  owner_id: string;
  is_public: boolean;
  is_private?: boolean;
  member_count: number;
  created_at: string;
  updated_at: string;
  court_count?: number;
  coach_slots?: number;
  operating_hours?: any;
  subscription_tier?: string;
  subscription_status?: string;
  stripe_subscription_id?: string;
  current_member_count?: number;
  current_coach_count?: number;
}

export interface ClubMembership {
  id: string;
  club_id: string;
  user_id: string;
  role: string;
  status: string;
  permissions: {
    can_invite: boolean;
    can_manage_members: boolean;
    can_edit_club: boolean;
    can_manage_courts: boolean;
  };
  joined_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
    email: string;
  };
}

export interface ClubInvitation {
  id: string;
  club_id: string;
  inviter_id: string;
  invitee_email: string;
  invitation_code: string;
  message: string | null;
  status: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClubActivity {
  id: string;
  club_id: string;
  user_id: string;
  activity_type: string;
  activity_data: any;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
}

// Real data will be loaded from database

export function useClubs() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [clubMembers, setClubMembers] = useState<ClubMembership[]>([]);
  const [clubInvitations, setClubInvitations] = useState<ClubInvitation[]>([]);
  const [clubActivities, setClubActivities] = useState<ClubActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPublicClubs = async () => {
    try {
      console.log('🏆 [CLUBS] Fetching public clubs...');
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('🏆 [CLUBS] Public clubs fetched:', data?.length || 0, 'clubs');
      setClubs((data || []) as Club[]);
    } catch (error) {
      console.error('🏆 [CLUBS] Error fetching public clubs:', error);
      toast.error('Failed to load clubs');
    }
  };

  const fetchMyClubs = async () => {
    if (!user) return;

    try {
      console.log('🏆 [CLUBS] Fetching my clubs for user:', user.id);
      // First get user's memberships
      const { data: memberships, error: membershipError } = await supabase
        .from('club_memberships')
        .select('club_id')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (membershipError) throw membershipError;

      console.log('🏆 [CLUBS] Found memberships:', memberships?.length || 0);

      if (!memberships || memberships.length === 0) {
        setMyClubs([]);
        return;
      }

      // Then get the clubs for those memberships
      const clubIds = memberships.map(m => m.club_id);
      const { data: clubs, error: clubsError } = await supabase
        .from('clubs')
        .select('*')
        .in('id', clubIds)
        .order('created_at', { ascending: false });

      if (clubsError) throw clubsError;
      console.log('🏆 [CLUBS] My clubs fetched:', clubs?.length || 0, 'clubs');
      setMyClubs((clubs || []) as Club[]);
    } catch (error) {
      console.error('🏆 [CLUBS] Error fetching my clubs:', error);
      toast.error('Failed to load your clubs');
    }
  };

  const createClub = async (clubData: {
    name: string;
    description?: string;
    location?: string;
    is_public?: boolean;
    court_count?: number;
    coach_slots?: number;
    operating_hours?: any;
    subscription_tier?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    console.log('Creating club with data:', clubData);
    console.log('Current user:', user.id);

    try {
      // Create the club first - Default to private
      console.log('Inserting club...');
      const { data: club, error: clubError } = await supabase
        .from('clubs')
        .insert({
          name: clubData.name,
          description: clubData.description,
          location: clubData.location,
          is_public: clubData.is_public || false, // Default to private
          is_private: true, // Always private by default
          owner_id: user.id,
          court_count: clubData.court_count || 1,
          coach_slots: clubData.coach_slots || 1,
          operating_hours: clubData.operating_hours || {
            monday: { open: '06:00', close: '22:00' },
            tuesday: { open: '06:00', close: '22:00' },
            wednesday: { open: '06:00', close: '22:00' },
            thursday: { open: '06:00', close: '22:00' },
            friday: { open: '06:00', close: '22:00' },
            saturday: { open: '08:00', close: '20:00' },
            sunday: { open: '08:00', close: '20:00' }
          },
          subscription_tier: 'community', // Always default to community
        })
        .select()
        .single();

      if (clubError) {
        console.error('Club creation error:', clubError);
        throw clubError;
      }

      console.log('Club created successfully:', club);

      // Create the owner membership (with duplicate check)
      console.log('Creating owner membership...');
      
      // First check if membership already exists
      const { data: existingMembership } = await supabase
        .from('club_memberships')
        .select('id')
        .eq('club_id', club.id)
        .eq('user_id', user.id)
        .single();

      if (!existingMembership) {
        const { error: membershipError } = await supabase
          .from('club_memberships')
          .insert({
            club_id: club.id,
            user_id: user.id,
            role: 'owner',
            status: 'active',
            permissions: {
              can_invite: true,
              can_manage_members: true,
              can_edit_club: true,
              can_manage_courts: true
            }
          });

        if (membershipError) {
          console.error('Membership creation error:', membershipError);
          // If it's a duplicate key error, the membership might have been created by another process
          if (membershipError.code === '23505') {
            console.log('Membership already exists, continuing...');
          } else {
            throw membershipError;
          }
        }
      } else {
        console.log('Membership already exists, skipping creation');
      }

      console.log('Membership created successfully');

      toast.success('Club created successfully!');
      await fetchMyClubs();
      if (clubData.is_public) {
        await fetchPublicClubs();
      }
      
      return club;
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

  const fetchClubMembers = async (clubId: string) => {
    try {
      // First get memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from('club_memberships')
        .select('*')
        .eq('club_id', clubId)
        .eq('status', 'active')
        .order('role', { ascending: false });

      if (membershipsError) throw membershipsError;

      // Then get profiles for these users
      const userIds = memberships?.map(m => m.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const typedData: ClubMembership[] = (memberships || []).map(membership => ({
        ...membership,
        permissions: typeof membership.permissions === 'string' 
          ? JSON.parse(membership.permissions) 
          : membership.permissions,
        profiles: profiles?.find(p => p.id === membership.user_id) || undefined
      }));
      
      setClubMembers(typedData);
      return typedData;
    } catch (error) {
      console.error('Error fetching club members:', error);
      toast.error('Failed to load club members');
      return [];
    }
  };

  const fetchClubInvitations = async (clubId: string) => {
    try {
      const { data, error } = await supabase
        .from('club_invitations')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClubInvitations(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching club invitations:', error);
      toast.error('Failed to load invitations');
      return [];
    }
  };

  const fetchClubActivities = async (clubId: string) => {
    try {
      // First get activities
      const { data: activities, error: activitiesError } = await supabase
        .from('club_activity_feed')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (activitiesError) throw activitiesError;

      // Then get profiles for these users
      const userIds = activities?.map(a => a.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const typedData: ClubActivity[] = (activities || []).map(activity => ({
        ...activity,
        profiles: profiles?.find(p => p.id === activity.user_id) || undefined
      }));
      
      setClubActivities(typedData);
      return typedData;
    } catch (error) {
      console.error('Error fetching club activities:', error);
      toast.error('Failed to load club activities');
      return [];
    }
  };

  const inviteMember = async (clubId: string, email: string, message?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('club_invitations')
        .insert({
          club_id: clubId,
          inviter_id: user.id,
          invitee_email: email.toLowerCase().trim(),
          message: message,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Invitation sent successfully!');
      await fetchClubInvitations(clubId);
      return data;
    } catch (error: any) {
      console.error('Error inviting member:', error);
      if (error.code === '23505') {
        toast.error('User already invited to this club');
      } else {
        toast.error('Failed to send invitation');
      }
      throw error;
    }
  };

  const removeMember = async (clubId: string, userId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('club_memberships')
        .update({ status: 'removed' })
        .eq('club_id', clubId)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Member removed from club');
      await fetchClubMembers(clubId);
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
      throw error;
    }
  };

  const updateMemberRoleOld = async (clubId: string, userId: string, newRole: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Define role permissions
      const rolePermissions = {
        owner: { can_invite: true, can_manage_members: true, can_edit_club: true, can_manage_courts: true },
        admin: { can_invite: true, can_manage_members: true, can_edit_club: false, can_manage_courts: true },
        moderator: { can_invite: true, can_manage_members: false, can_edit_club: false, can_manage_courts: false },
        member: { can_invite: false, can_manage_members: false, can_edit_club: false, can_manage_courts: false }
      };

      const { error } = await supabase
        .from('club_memberships')
        .update({ 
          role: newRole,
          permissions: rolePermissions[newRole as keyof typeof rolePermissions]
        })
        .eq('club_id', clubId)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Member role updated successfully');
      await fetchClubMembers(clubId);
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role');
      throw error;
    }
  };

  const acceptInvitation = async (invitationCode: string) => {
    try {
      const { data, error } = await supabase.rpc('accept_club_invitation', {
        invitation_code_param: invitationCode
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        toast.success(result.message);
        await refreshData();
        return result;
      } else {
        toast.error(result?.error || 'Failed to accept invitation');
        throw new Error(result?.error || 'Failed to accept invitation');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation');
      throw error;
    }
  };

  // Shareable link functionality
  const createShareableLink = async (clubId: string, maxUses?: number, expiresDays: number = 30) => {
    try {
      const { data, error } = await supabase.rpc('create_shareable_club_link', {
        club_id_param: clubId,
        max_uses_param: maxUses,
        expires_days: expiresDays
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        toast.success('Shareable link created!');
        return result;
      } else {
        toast.error(result?.error || 'Failed to create shareable link');
        throw new Error(result?.error || 'Failed to create shareable link');
      }
    } catch (error) {
      console.error('Error creating shareable link:', error);
      toast.error('Failed to create shareable link');
      throw error;
    }
  };

  const joinViaLink = async (linkSlug: string) => {
    try {
      const { data, error } = await supabase.rpc('join_club_via_link', {
        link_slug_param: linkSlug
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        toast.success(result.message);
        await refreshData();
        return result;
      } else {
        toast.error(result?.error || 'Failed to join club');
        throw new Error(result?.error || 'Failed to join club');
      }
    } catch (error) {
      console.error('Error joining via link:', error);
      toast.error('Failed to join club');
      throw error;
    }
  };

  const getShareableLinks = async (clubId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_club_shareable_links', {
        club_id_param: clubId
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching shareable links:', error);
      return [];
    }
  };

  const updateClub = async (clubId: string, updates: Partial<Club>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('clubs')
        .update(updates)
        .eq('id', clubId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Club updated successfully!');
      await refreshData();
      return data;
    } catch (error) {
      console.error('Error updating club:', error);
      toast.error('Failed to update club');
      throw error;
    }
  };

  // New Phase 1 Functions - Member Management
  const updateMemberRole = async (clubId: string, userId: string, newRole: string, newPermissions?: any) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await (supabase as any).rpc('update_member_role', {
        club_id_param: clubId,
        user_id_param: userId,
        new_role: newRole,
        new_permissions: newPermissions
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        toast.success(result.message);
        await fetchClubMembers(clubId);
        return result;
      } else {
        toast.error(result?.error || 'Failed to update member role');
        throw new Error(result?.error || 'Failed to update member role');
      }
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role');
      throw error;
    }
  };

  const removeClubMember = async (clubId: string, userId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await (supabase as any).rpc('remove_club_member', {
        club_id_param: clubId,
        user_id_param: userId
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        toast.success(result.message);
        await fetchClubMembers(clubId);
        return result;
      } else {
        toast.error(result?.error || 'Failed to remove member');
        throw new Error(result?.error || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
      throw error;
    }
  };

  const transferClubOwnership = async (clubId: string, newOwnerId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await (supabase as any).rpc('transfer_club_ownership', {
        club_id_param: clubId,
        new_owner_id: newOwnerId
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        toast.success(result.message);
        await refreshData();
        await fetchClubMembers(clubId);
        return result;
      } else {
        toast.error(result?.error || 'Failed to transfer ownership');
        throw new Error(result?.error || 'Failed to transfer ownership');
      }
    } catch (error) {
      console.error('Error transferring ownership:', error);
      toast.error('Failed to transfer ownership');
      throw error;
    }
  };

  // Analytics Functions
  const updateClubAnalytics = async (clubId: string, date?: string) => {
    try {
      const { data, error } = await (supabase as any).rpc('update_club_analytics', {
        club_id_param: clubId,
        analytics_date: date
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        return result;
      } else {
        console.error('Analytics update failed:', result?.error);
        return null;
      }
    } catch (error) {
      console.error('Error updating club analytics:', error);
      return null;
    }
  };

  const getClubAnalytics = async (clubId: string, startDate?: string, endDate?: string) => {
    try {
      // Use direct query for analytics since table might not be in types yet
      const { data, error } = await supabase
        .from('club_analytics' as any)
        .select('*')
        .eq('club_id', clubId)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching club analytics:', error);
      return [];
    }
  };

  // Member Status Functions
  const updateMemberStatus = async (clubId: string, status: string = 'online', activityData: any = {}) => {
    try {
      const { data, error } = await (supabase as any).rpc('update_member_status', {
        club_id_param: clubId,
        status_param: status,
        activity_data_param: activityData
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        return result;
      }
      return null;
    } catch (error) {
      console.error('Error updating member status:', error);
      return null;
    }
  };

  const getClubMemberStatus = async (clubId: string) => {
    try {
      const { data, error } = await supabase
        .from('member_status' as any)
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('club_id', clubId)
        .order('last_seen', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching member status:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      console.log('🏆 [CLUBS] Loading clubs data for user:', user.id);
      refreshData();
    } else {
      console.log('🏆 [CLUBS] No user, clearing club data');
      setClubs([]);
      setMyClubs([]);
      setLoading(false);
    }
  }, [user]);

  return {
    clubs,
    myClubs,
    clubMembers,
    clubInvitations,
    clubActivities,
    loading,
    createClub,
    joinClub,
    leaveClub,
    refreshData,
    fetchClubMembers,
    fetchClubInvitations,
    fetchClubActivities,
    inviteMember,
    removeMember,
    updateMemberRole,
    acceptInvitation,
    updateClub,
    createShareableLink,
    joinViaLink,
    getShareableLinks,
    // New Phase 1 Functions
    removeClubMember,
    transferClubOwnership,
    updateClubAnalytics,
    getClubAnalytics,
    updateMemberStatus,
    getClubMemberStatus,
  };
}