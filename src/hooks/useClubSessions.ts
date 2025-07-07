import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useClubSubscription } from './useClubSubscription';
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
  const [sessions, setSessions] = useState<ClubSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    if (!user || !clubId) return;

    try {
      // In a real implementation, this would query actual session tables
      // For now, using mock data structure
      const mockSessions: ClubSession[] = [
        {
          id: '1',
          club_id: clubId,
          user_id: user.id,
          session_type: 'court_booking',
          title: 'Court 1 Booking',
          court_id: 'court-1',
          start_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          end_datetime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
          status: 'confirmed',
          payment_status: 'paid',
          cost_tokens: 50,
          cost_money: 0,
          payment_method: 'tokens',
          participants: [user.id],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setSessions(mockSessions);
    } catch (error) {
      console.error('Error fetching club sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user, clubId]);

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

      setSessions(prev => [...prev, newSession]);
      toast.success('Session created successfully');
      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const cancelSession = async (
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

      // Update session status
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { 
              ...s, 
              status: 'cancelled' as const,
              cancellation_reason: reason,
              cancelled_at: new Date().toISOString()
            }
          : s
      ));

      // Process refund if applicable
      if (session.payment_status === 'paid') {
        await processRefund(sessionId, session);
      }

      // Send cancellation notification
      await sendCancellationNotification(session, reason);

      toast.success('Session cancelled successfully');
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

      // Update session payment status
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, payment_status: 'refunded' as const }
          : s
      ));

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
    cancelSession,
    checkAvailability,
    getSessionsForDate,
    getUpcomingSessions,
    getTierLimits,
    refetch: fetchSessions
  };
}