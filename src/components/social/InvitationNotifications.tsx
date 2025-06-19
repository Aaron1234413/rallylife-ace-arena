
import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SessionInvitationCard } from './SessionInvitationCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PendingInvitation {
  id: string;
  session_id: string;
  user_id: string;
  status: 'invited' | 'accepted' | 'declined' | 'joined';
  invited_at: string;
  session: {
    id: string;
    session_type: 'singles' | 'doubles';
    competitive_level: 'low' | 'medium' | 'high';
    location?: string;
    notes?: string;
    created_by: string;
    created_at: string;
    status: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';
  };
  inviter_profile: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export function InvitationNotifications() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchInvitations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('social_play_participants')
        .select(`
          id,
          session_id,
          user_id,
          status,
          invited_at,
          social_play_sessions!inner (
            id,
            session_type,
            competitive_level,
            location,
            notes,
            created_by,
            created_at,
            status,
            profiles!social_play_sessions_created_by_fkey (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['invited', 'accepted'])
        .eq('social_play_sessions.status', 'pending')
        .order('invited_at', { ascending: false });

      if (error) throw error;

      const transformedInvitations: PendingInvitation[] = (data || []).map(item => ({
        id: item.id,
        session_id: item.session_id,
        user_id: item.user_id,
        status: item.status as 'invited' | 'accepted' | 'declined' | 'joined',
        invited_at: item.invited_at,
        session: {
          id: item.social_play_sessions.id,
          session_type: item.social_play_sessions.session_type as 'singles' | 'doubles',
          competitive_level: item.social_play_sessions.competitive_level as 'low' | 'medium' | 'high',
          location: item.social_play_sessions.location,
          notes: item.social_play_sessions.notes,
          created_by: item.social_play_sessions.created_by,
          created_at: item.social_play_sessions.created_at,
          status: item.social_play_sessions.status as 'pending' | 'active' | 'paused' | 'completed' | 'cancelled',
        },
        inviter_profile: item.social_play_sessions.profiles
      }));

      setInvitations(transformedInvitations);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [user]);

  // Set up real-time subscription for new invitations
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel(`invitations_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_play_participants',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Invitation update:', payload);
          
          // Show notification for new invitations
          if (payload.eventType === 'INSERT' && payload.new.status === 'invited') {
            toast.success('New tennis session invitation received!');
          }
          
          // Refetch invitations
          fetchInvitations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleInvitationResponse = (accepted: boolean) => {
    // Refetch invitations after response
    fetchInvitations();
  };

  const pendingCount = invitations.filter(inv => inv.status === 'invited').length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {pendingCount > 0 && (
            <Badge 
              variant="default" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {pendingCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Session Invitations
            {pendingCount > 0 && (
              <Badge variant="secondary">{pendingCount} pending</Badge>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">No pending invitations</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="space-y-4">
                {invitations.map(invitation => (
                  <SessionInvitationCard
                    key={invitation.id}
                    invitation={{
                      id: invitation.id,
                      session_id: invitation.session_id,
                      status: invitation.status,
                      invited_at: invitation.invited_at,
                      session: invitation.session,
                      inviter: invitation.inviter_profile
                    }}
                    onResponse={handleInvitationResponse}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
