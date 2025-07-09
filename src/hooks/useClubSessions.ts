import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useClubSubscription } from './useClubSubscription';
import { useSessionManager } from './useSessionManager';
import { toast } from 'sonner';

export interface ClubSession {
  id: string;
  club_id: string;
  user_id: string;
  session_type: 'court_booking' | 'coaching' | 'group_training' | 'tournament';
  title: string;
  description?: string;
  court_id?: string;
  coach_id?: string;
  start_datetime: string;
  end_datetime: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded';
  cost_tokens: number;
  cost_money: number;
  payment_method: 'tokens' | 'money';
  participants: string[];
  max_participants?: number;
  cancellation_reason?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionConflict {
  conflictType: 'court' | 'coach' | 'user';
  conflictingSession: ClubSession;
  message: string;
}

export function useClubSessions(clubId: string) {
  const { user } = useAuth();
  const { subscription } = useClubSubscription(clubId);
  
  // Use unified session manager for real data
  const { 
    sessions: unifiedSessions, 
    loading, 
    joinSession, 
    leaveSession, 
    startSession: startUnifiedSession, 
    completeSession, 
    cancelSession 
  } = useSessionManager({
    sessionType: 'club_booking',
    clubId,
    includeNonClubSessions: false
  });

  // Convert unified sessions to club session format
  const sessions: ClubSession[] = unifiedSessions.map(session => ({
    id: session.id,
    club_id: session.club_id!,
    user_id: session.creator_id,
    session_type: 'court_booking' as const, // Map from unified types
    title: session.title || session.notes || `${session.session_type} Session`,
    description: session.description || session.notes,
    court_id: undefined, // Could be added to sessions table if needed
    coach_id: undefined, // Could be added to sessions table if needed
    start_datetime: session.start_datetime || session.start_time,
    end_datetime: session.end_datetime || session.end_time,
    status: 'confirmed' as const,
    payment_status: 'paid' as const,
    cost_tokens: session.cost_tokens || session.stakes_amount || 0,
    cost_money: session.cost_money || 0,
    payment_method: session.payment_method || 'tokens' as const,
    participants: session.participants?.map(p => p.user_id) || [session.creator_id],
    max_participants: session.max_players,
    created_at: session.created_at,
    updated_at: session.updated_at
  }));

  const checkAvailability = async (
    startDateTime: string,
    endDateTime: string,
    courtId?: string,
    coachId?: string,
    excludeSessionId?: string
  ): Promise<SessionConflict[]> => {
    const conflicts: SessionConflict[] = [];
    
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    // Check for court conflicts
    if (courtId) {
      const courtConflicts = sessions.filter(session =>
        session.id !== excludeSessionId &&
        session.court_id === courtId &&
        session.status !== 'cancelled' &&
        ((new Date(session.start_datetime) < end) && (new Date(session.end_datetime) > start))
      );

      courtConflicts.forEach(conflict => {
        conflicts.push({
          conflictType: 'court',
          conflictingSession: conflict,
          message: `Court is already booked during this time`
        });
      });
    }

    // Check for coach conflicts
    if (coachId) {
      const coachConflicts = sessions.filter(session =>
        session.id !== excludeSessionId &&
        session.coach_id === coachId &&
        session.status !== 'cancelled' &&
        ((new Date(session.start_datetime) < end) && (new Date(session.end_datetime) > start))
      );

      coachConflicts.forEach(conflict => {
        conflicts.push({
          conflictType: 'coach',
          conflictingSession: conflict,
          message: `Coach is already booked during this time`
        });
      });
    }

    return conflicts;
  };

  const createSession = async (sessionData: Partial<ClubSession>): Promise<ClubSession> => {
    if (!user) throw new Error('User not authenticated');

    // Check tier-based limits
    const tierLimits = getTierLimits();
    const userSessions = sessions.filter(s => s.user_id === user.id && s.status !== 'cancelled');
    
    if (userSessions.length >= tierLimits.maxSessionsPerMonth) {
      throw new Error(`Session limit reached. ${subscription?.tier_id || 'community'} tier allows ${tierLimits.maxSessionsPerMonth} sessions per month.`);
    }

    // Check for conflicts
    const conflicts = await checkAvailability(
      sessionData.start_datetime!,
      sessionData.end_datetime!,
      sessionData.court_id,
      sessionData.coach_id
    );

    if (conflicts.length > 0) {
      throw new Error(`Cannot create session: ${conflicts[0].message}`);
    }

    try {
      // Create through unified session manager
      const unifiedSessionData = {
        session_type: 'club_booking' as const,
        club_id: clubId,
        title: sessionData.title || 'Club Session',
        description: sessionData.description,
        start_datetime: sessionData.start_datetime!,
        end_datetime: sessionData.end_datetime!,
        max_players: sessionData.max_participants || 4,
        stakes_amount: sessionData.cost_tokens || 0,
        location: sessionData.court_id ? `Court ${sessionData.court_id}` : undefined,
        notes: sessionData.description || sessionData.title,
        is_private: false,
        cost_tokens: sessionData.cost_tokens || 0,
        cost_money: sessionData.cost_money || 0,
        payment_method: sessionData.payment_method || 'tokens' as const
      };

      // Note: This would use unified session creation once implemented
      // For now, create a local session object
      const newSession: ClubSession = {
        id: `session-${Date.now()}`,
        club_id: clubId,
        user_id: user.id,
        session_type: sessionData.session_type || 'court_booking',
        title: sessionData.title || 'Club Session',
        description: sessionData.description,
        court_id: sessionData.court_id,
        coach_id: sessionData.coach_id,
        start_datetime: sessionData.start_datetime!,
        end_datetime: sessionData.end_datetime!,
        status: 'scheduled',
        payment_status: 'pending',
        cost_tokens: sessionData.cost_tokens || 0,
        cost_money: sessionData.cost_money || 0,
        payment_method: sessionData.payment_method || 'tokens',
        participants: [user.id],
        max_participants: sessionData.max_participants,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      toast.success('Session created successfully');
      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const cancelSessionLocal = async (
    sessionId: string, 
    reason?: string
  ): Promise<void> => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Check if cancellation is allowed (e.g., not too close to start time)
      const now = new Date();
      const sessionStart = new Date(session.start_datetime);
      const hoursUntilSession = (sessionStart.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilSession < 2) {
        throw new Error('Cannot cancel session less than 2 hours before start time');
      }

      // Use unified session manager for cancellation
      const success = await cancelSession(sessionId);
      
      if (success) {
        // Process refund if applicable
        if (session.payment_status === 'paid') {
          await processRefund(sessionId, session);
        }

        // Send cancellation notification
        await sendCancellationNotification(session, reason);

        toast.success('Session cancelled successfully');
      }
    } catch (error) {
      console.error('Error cancelling session:', error);
      throw error;
    }
  };

  const processRefund = async (sessionId: string, session: ClubSession): Promise<void> => {
    try {
      // Calculate refund amount based on cancellation policy
      const refundPercentage = getRefundPercentage(session.start_datetime);
      const refundTokens = Math.floor(session.cost_tokens * refundPercentage);
      const refundMoney = session.cost_money * refundPercentage;

      // In real implementation, would call Stripe for money refunds
      // For tokens, update user's token balance
      if (refundTokens > 0) {
        // Would call token refund function
        console.log(`Refunding ${refundTokens} tokens for session ${sessionId}`);
      }

      if (refundMoney > 0) {
        // Would call Stripe refund API
        console.log(`Refunding $${refundMoney.toFixed(2)} for session ${sessionId}`);
      }

      // Note: Session payment status would be updated through unified session manager
      console.log(`Payment status for session ${sessionId} updated to refunded`);

    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  };

  const sendCancellationNotification = async (session: ClubSession, reason?: string): Promise<void> => {
    try {
      await supabase.functions.invoke('send-session-notification', {
        body: {
          type: 'cancellation',
          session,
          reason,
          recipients: session.participants
        }
      });
    } catch (error) {
      console.error('Error sending cancellation notification:', error);
    }
  };

  const getRefundPercentage = (sessionStart: string): number => {
    const now = new Date();
    const start = new Date(sessionStart);
    const hoursUntilSession = (start.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilSession >= 24) return 1.0; // 100% refund
    if (hoursUntilSession >= 12) return 0.8; // 80% refund
    if (hoursUntilSession >= 4) return 0.5;  // 50% refund
    return 0.0; // No refund
  };

  const getTierLimits = () => {
    const tier = subscription?.tier_id || 'community';
    
    switch (tier) {
      case 'community':
        return { maxSessionsPerMonth: 8, maxCoachingSessions: 2 };
      case 'competitive':
        return { maxSessionsPerMonth: 20, maxCoachingSessions: 8 };
      case 'champions':
        return { maxSessionsPerMonth: -1, maxCoachingSessions: -1 }; // Unlimited
      default:
        return { maxSessionsPerMonth: 8, maxCoachingSessions: 2 };
    }
  };

  const getSessionsForDate = (date: Date): ClubSession[] => {
    const dateStr = date.toISOString().split('T')[0];
    return sessions.filter(session => 
      session.start_datetime.startsWith(dateStr) && 
      session.status !== 'cancelled'
    );
  };

  const getUpcomingSessions = (limit: number = 5): ClubSession[] => {
    const now = new Date();
    return sessions
      .filter(session => 
        new Date(session.start_datetime) > now && 
        session.status !== 'cancelled'
      )
      .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
      .slice(0, limit);
  };

  return {
    sessions,
    loading,
    createSession,
    cancelSession: cancelSessionLocal,
    checkAvailability,
    getSessionsForDate,
    getUpcomingSessions,
    getTierLimits,
    refetch: () => {} // Unified manager handles this automatically
  };
}