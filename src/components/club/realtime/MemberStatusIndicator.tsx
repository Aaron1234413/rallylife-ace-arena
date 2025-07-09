import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Circle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface MemberStatus {
  user_id: string;
  club_id: string;
  status: string; // Allow any status string from database
  last_seen: string;
  looking_to_play?: boolean;
  looking_for_skill_level?: number;
  availability_message?: string;
}

interface MemberStatusIndicatorProps {
  userId: string;
  clubId: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function MemberStatusIndicator({ 
  userId, 
  clubId, 
  showText = false, 
  size = 'md' 
}: MemberStatusIndicatorProps) {
  const [status, setStatus] = useState<MemberStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberStatus();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel(`member-status-${userId}-${clubId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'member_status',
          filter: `user_id=eq.${userId},club_id=eq.${clubId}`
        },
        (payload) => {
          if (payload.new) {
            // Transform the database record to match our interface
            const dbRecord = payload.new as any;
            const memberStatus: MemberStatus = {
              user_id: dbRecord.user_id,
              club_id: dbRecord.club_id,
              status: dbRecord.status,
              last_seen: dbRecord.last_seen,
              looking_to_play: !!dbRecord.looking_for_skill_level,
              looking_for_skill_level: dbRecord.looking_for_skill_level,
              availability_message: dbRecord.availability_message
            };
            setStatus(memberStatus);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, clubId]);

  const fetchMemberStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('member_status')
        .select('*')
        .eq('user_id', userId)
        .eq('club_id', clubId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching member status:', error);
      } else if (data) {
        // Transform the database record to match our interface
        const memberStatus: MemberStatus = {
          user_id: data.user_id,
          club_id: data.club_id,
          status: data.status,
          last_seen: data.last_seen,
          looking_to_play: !!data.looking_for_skill_level,
          looking_for_skill_level: data.looking_for_skill_level,
          availability_message: data.availability_message
        };
        setStatus(memberStatus);
      }
    } catch (error) {
      console.error('Error fetching member status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    if (!status) {
      return {
        color: 'bg-gray-400',
        text: 'Unknown',
        variant: 'secondary' as const
      };
    }

    const lastSeen = new Date(status.last_seen);
    const minutesAgo = (Date.now() - lastSeen.getTime()) / (1000 * 60);

    if (minutesAgo < 5) {
      return {
        color: 'bg-green-500',
        text: 'Online',
        variant: 'default' as const
      };
    } else if (minutesAgo < 30) {
      return {
        color: 'bg-yellow-500',
        text: 'Away',
        variant: 'secondary' as const
      };
    } else {
      return {
        color: 'bg-gray-400',
        text: `Last seen ${formatDistanceToNow(lastSeen, { addSuffix: true })}`,
        variant: 'outline' as const
      };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2';
      case 'lg':
        return 'w-4 h-4';
      default:
        return 'w-3 h-3';
    }
  };

  if (loading) {
    return (
      <div className={`${getSizeClasses()} bg-gray-300 rounded-full animate-pulse`} />
    );
  }

  const statusInfo = getStatusInfo();

  if (showText) {
    return (
      <div className="flex items-center gap-2">
        <div className={`${getSizeClasses()} ${statusInfo.color} rounded-full flex-shrink-0`} />
        <span className="text-xs text-tennis-green-medium">{statusInfo.text}</span>
        {status?.looking_to_play && (
          <Badge variant="outline" className="text-xs text-tennis-yellow bg-tennis-yellow/10 border-tennis-yellow">
            Looking to play
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={`${getSizeClasses()} ${statusInfo.color} rounded-full`} />
      {status?.looking_to_play && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-tennis-yellow rounded-full animate-pulse" />
      )}
    </div>
  );
}