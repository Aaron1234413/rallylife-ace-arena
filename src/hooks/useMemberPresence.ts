import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface MemberStatus {
  id: string;
  user_id: string;
  club_id: string;
  status: 'online' | 'looking_to_play' | 'in_session' | 'offline';
  location_lat?: number;
  location_lng?: number;
  looking_for_skill_level?: number;
  availability_message?: string;
  last_seen: string;
  user?: {
    full_name: string;
    avatar_url?: string;
  };
}

export function useMemberPresence(clubId: string) {
  const { user } = useAuth();
  const [memberStatuses, setMemberStatuses] = useState<MemberStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch current member statuses
  const fetchMemberStatuses = async () => {
    if (!user || !clubId) return;

    try {
      const { data, error } = await supabase
        .from('member_status')
        .select(`
          *,
          user:profiles!member_status_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('club_id', clubId)
        .order('last_seen', { ascending: false });

      if (error) throw error;
      setMemberStatuses((data as any) || []);
    } catch (error) {
      console.error('Error fetching member statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update user's last seen timestamp
  const updateLastSeen = async () => {
    if (!user || !clubId) return;

    try {
      await supabase.rpc('update_member_last_seen', {
        club_id_param: clubId
      });
    } catch (error) {
      console.error('Error updating last seen:', error);
    }
  };

  // Set play availability
  const setPlayAvailability = async (
    message?: string,
    sessionType: string = 'casual',
    availableUntil?: Date
  ) => {
    if (!user || !clubId) return false;

    setUpdating(true);
    try {
      const { data, error } = await supabase.rpc('set_play_availability', {
        club_id_param: clubId,
        message_param: message,
        session_type_param: sessionType,
        available_until_param: availableUntil?.toISOString()
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string };
      
      if (result.success) {
        toast.success(result.message);
        await fetchMemberStatuses();
        return true;
      } else {
        toast.error('Failed to update availability');
        return false;
      }
    } catch (error) {
      console.error('Error setting play availability:', error);
      toast.error('Failed to update availability');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Stop looking to play
  const stopLookingToPlay = async () => {
    if (!user || !clubId) return false;

    setUpdating(true);
    try {
      const { data, error } = await supabase.rpc('stop_looking_to_play', {
        club_id_param: clubId
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string };
      
      if (result.success) {
        toast.success(result.message);
        await fetchMemberStatuses();
        return true;
      } else {
        toast.error('Failed to update status');
        return false;
      }
    } catch (error) {
      console.error('Error stopping play availability:', error);
      toast.error('Failed to update status');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Get members by status
  const getMembersByStatus = (status: MemberStatus['status']) => {
    return memberStatuses.filter(member => member.status === status);
  };

  // Get current user's status
  const getCurrentUserStatus = () => {
    return memberStatuses.find(member => member.user_id === user?.id);
  };

  // Check if user is looking to play
  const isLookingToPlay = () => {
    const userStatus = getCurrentUserStatus();
    return userStatus?.status === 'looking_to_play';
  };

  // Load initial data and set up real-time subscriptions
  useEffect(() => {
    if (!user || !clubId) return;

    fetchMemberStatuses();
    updateLastSeen();

    // Set up real-time subscription for member status changes
    const channel = supabase
      .channel(`member_presence_realtime_${clubId}_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'member_status',
          filter: `club_id=eq.${clubId}`
        },
        () => {
          fetchMemberStatuses();
        }
      )
      .subscribe();

    // Update last seen every 30 seconds
    const lastSeenInterval = setInterval(() => {
      updateLastSeen();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(lastSeenInterval);
    };
  }, [user, clubId]);

  return {
    memberStatuses,
    loading,
    updating,
    setPlayAvailability,
    stopLookingToPlay,
    getMembersByStatus,
    getCurrentUserStatus,
    isLookingToPlay,
    refreshStatuses: fetchMemberStatuses
  };
}