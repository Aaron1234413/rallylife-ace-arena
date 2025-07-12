import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { UnifiedSession } from './useUnifiedSessions';

export interface SessionPermissions {
  canStart: boolean;
  canPause: boolean;
  canEnd: boolean;
  canEdit: boolean;
  canJoin: boolean;
  canLeave: boolean;
  canCancel: boolean;
  isCreator: boolean;
  isParticipant: boolean;
  loading: boolean;
}

export function useSessionPermissions(session: UnifiedSession | null) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<SessionPermissions>({
    canStart: false,
    canPause: false,
    canEnd: false,
    canEdit: false,
    canJoin: false,
    canLeave: false,
    canCancel: false,
    isCreator: false,
    isParticipant: false,
    loading: true
  });

  useEffect(() => {
    const checkPermissions = async () => {
      if (!session || !user) {
        setPermissions({
          canStart: false,
          canPause: false,
          canEnd: false,
          canEdit: false,
          canJoin: false,
          canLeave: false,
          canCancel: false,
          isCreator: false,
          isParticipant: false,
          loading: false
        });
        return;
      }

      try {
        setPermissions(prev => ({ ...prev, loading: true }));

        // Basic role checks
        const isCreator = session.creator_id === user.id;
        const isParticipant = session.user_has_joined || isCreator;

        // Call backend permission functions for server-side validation
        const [
          { data: canStartData },
          { data: canPauseData },
          { data: canEndData }
        ] = await Promise.all([
          supabase.rpc('can_start_session', { 
            session_id_param: session.id,
            user_id_param: user.id 
          }),
          supabase.rpc('can_pause_session', { 
            session_id_param: session.id,
            user_id_param: user.id 
          }),
          supabase.rpc('can_end_session', { 
            session_id_param: session.id,
            user_id_param: user.id 
          })
        ]);

        // Frontend validation for other permissions
        const participantCount = session.participant_count || 0;
        const isFull = participantCount >= session.max_players;

        const newPermissions: SessionPermissions = {
          canStart: Boolean(canStartData),
          canPause: Boolean(canPauseData),
          canEnd: Boolean(canEndData),
          canEdit: isCreator && session.status === 'open',
          canJoin: !isParticipant && 
                   session.status === 'open' && 
                   !isFull,
          canLeave: isParticipant && 
                    session.status === 'open' && 
                    !isCreator,
          canCancel: isCreator && 
                     ['open', 'waiting'].includes(session.status),
          isCreator,
          isParticipant,
          loading: false
        };

        setPermissions(newPermissions);
      } catch (error) {
        console.error('Error checking session permissions:', error);
        setPermissions(prev => ({ ...prev, loading: false }));
      }
    };

    checkPermissions();
  }, [session, user]);

  return permissions;
}

// Hook for checking specific permission quickly
export function useCanPerformAction(
  session: UnifiedSession | null, 
  action: 'start' | 'pause' | 'end' | 'join' | 'leave' | 'edit' | 'cancel'
) {
  const permissions = useSessionPermissions(session);
  
  switch (action) {
    case 'start': return permissions.canStart;
    case 'pause': return permissions.canPause;
    case 'end': return permissions.canEnd;
    case 'join': return permissions.canJoin;
    case 'leave': return permissions.canLeave;
    case 'edit': return permissions.canEdit;
    case 'cancel': return permissions.canCancel;
    default: return false;
  }
}

// Helper to get permission reasons (for tooltips/error messages)
export function getPermissionReason(
  session: UnifiedSession | null,
  action: 'start' | 'pause' | 'end' | 'join' | 'leave' | 'edit' | 'cancel',
  permissions: SessionPermissions
): string {
  if (!session) return 'No session data';
  
  switch (action) {
    case 'start':
      if (!permissions.isCreator && !permissions.isParticipant) {
        return 'Only participants can start the session';
      }
      if (!['open', 'waiting'].includes(session.status)) {
        return `Cannot start session with status: ${session.status}`;
      }
      if ((session.participant_count || 0) < 2) {
        return 'Need at least 2 participants to start';
      }
      return 'You can start this session';
      
    case 'pause':
      if (!permissions.isCreator) {
        return 'Only the creator can pause/resume sessions';
      }
      if (!['active', 'paused'].includes(session.status)) {
        return `Cannot pause session with status: ${session.status}`;
      }
      return session.status === 'active' ? 'You can pause this session' : 'You can resume this session';
      
    case 'end':
      if (!permissions.isParticipant) {
        return 'Only participants can end the session';
      }
      if (!['active', 'paused'].includes(session.status)) {
        return `Cannot end session with status: ${session.status}`;
      }
      return 'You can end this session';
      
    case 'join':
      if (permissions.isParticipant) {
        return 'You are already a participant';
      }
      if (session.status !== 'open') {
        return `Session is not open for joining (status: ${session.status})`;
      }
      if ((session.participant_count || 0) >= session.max_players) {
        return 'Session is full';
      }
      return 'You can join this session';
      
    case 'leave':
      if (!permissions.isParticipant) {
        return 'You are not a participant';
      }
      if (permissions.isCreator) {
        return 'Creators cannot leave their own sessions';
      }
      if (session.status !== 'open') {
        return `Cannot leave session with status: ${session.status}`;
      }
      return 'You can leave this session';
      
    case 'edit':
      if (!permissions.isCreator) {
        return 'Only the creator can edit sessions';
      }
      if (session.status !== 'open') {
        return `Cannot edit session with status: ${session.status}`;
      }
      return 'You can edit this session';
      
    case 'cancel':
      if (!permissions.isCreator) {
        return 'Only the creator can cancel sessions';
      }
      if (!['open', 'waiting'].includes(session.status)) {
        return `Cannot cancel session with status: ${session.status}`;
      }
      return 'You can cancel this session';
      
    default:
      return 'Unknown action';
  }
}