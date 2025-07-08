import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserPresence {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  status: 'online' | 'away' | 'offline';
  last_seen: string;
}

export function useSessionPresence(sessionId: string) {
  const { user } = useAuth();
  const [presences, setPresences] = useState<UserPresence[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!user || !sessionId) return;

    const channel = supabase
      .channel(`session_presence_${sessionId}`)
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const users: UserPresence[] = [];
        
        Object.keys(newState).forEach((userId) => {
          const presenceData = newState[userId][0] as any;
          users.push({
            user_id: userId,
            full_name: presenceData.full_name,
            avatar_url: presenceData.avatar_url,
            status: 'online',
            last_seen: new Date().toISOString()
          });
        });
        
        setPresences(users);
        setOnlineCount(users.length);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;

        // Track user presence in the session
        await channel.track({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || 'Unknown User',
          avatar_url: user.user_metadata?.avatar_url,
          online_at: new Date().toISOString(),
        });
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, sessionId]);

  return {
    presences,
    onlineCount,
    isOnline: (userId: string) => presences.some(p => p.user_id === userId)
  };
}