import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Users, Trophy, Play, Square, Crown, Wifi } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UnifiedSession, SessionParticipant } from '@/hooks/useUnifiedSessions';
import { WinnerSelectionDialog } from './WinnerSelectionDialog';
import { SessionCompletionSummary } from './SessionCompletionSummary';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SessionActiveViewProps {
  session: UnifiedSession;
  participants: SessionParticipant[];
  onStartSession: (sessionId: string) => Promise<boolean>;
  onCompleteSession: (sessionId: string, durationMinutes: number, winnerId?: string, winningTeam?: string) => Promise<boolean>;
}

export function SessionActiveView({
  session,
  participants: initialParticipants,
  onStartSession,
  onCompleteSession
}: SessionActiveViewProps) {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<SessionParticipant[]>(initialParticipants);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showWinnerSelection, setShowWinnerSelection] = useState(false);
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);
  const [completionData, setCompletionData] = useState<any>(null);
  const [realTimeConnected, setRealTimeConnected] = useState(false);

  const isCreator = user?.id === session.creator_id;
  const isSessionStarted = !!session.session_started_at || !!sessionStartTime;
  const isSessionCompleted = !!session.session_ended_at;

  // Real-time participant tracking
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`session_active_${session.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_participants',
          filter: `session_id=eq.${session.id}`
        },
        (payload) => {
          console.log('Real-time participant update:', payload);
          // Refresh participant list
          refreshParticipants();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${session.id}`
        },
        (payload) => {
          console.log('Real-time session update:', payload);
          // Update session status if changed
          if (payload.new?.session_started_at && !isSessionStarted) {
            setSessionStartTime(new Date(payload.new.session_started_at));
            toast.success('Session has started!');
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealTimeConnected(true);
        } else {
          setRealTimeConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session.id, user, isSessionStarted]);

  const refreshParticipants = async () => {
    try {
      // This would normally call getSessionParticipants from the hook
      // For now, we'll use the initial participants
      console.log('Refreshing participants for session:', session.id);
    } catch (error) {
      console.error('Error refreshing participants:', error);
    }
  };

  // Update participants when initialParticipants changes
  useEffect(() => {
    setParticipants(initialParticipants);
  }, [initialParticipants]);

  // Timer effect
  useEffect(() => {
    if (!isSessionStarted || isSessionCompleted) return;

    const startTime = session.session_started_at 
      ? new Date(session.session_started_at)
      : sessionStartTime;

    if (!startTime) return;

    const timer = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [isSessionStarted, sessionStartTime, session.session_started_at, isSessionCompleted]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = async () => {
    setIsStarting(true);
    try {
      const success = await onStartSession(session.id);
      if (success) {
        setSessionStartTime(new Date());
        toast.success('Session started!');
      }
    } catch (error) {
      toast.error('Failed to start session');
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndSession = () => {
    if (session.session_type === 'challenge' || session.format === 'doubles') {
      setShowWinnerSelection(true);
    } else {
      // For practice sessions, complete directly
      handleCompleteSession();
    }
  };

  const handleCompleteSession = async (winnerId?: string, winningTeam?: string) => {
    setIsCompleting(true);
    try {
      const durationMinutes = Math.floor(elapsedTime / 60);
      const success = await onCompleteSession(session.id, durationMinutes, winnerId, winningTeam);
      
      if (success) {
        // Show completion summary
        setCompletionData({
          duration: durationMinutes,
          winnerId,
          winningTeam,
          participants: participants.length,
          tokensDistributed: session.stakes_amount || 0
        });
        setShowCompletionSummary(true);
        toast.success('Session completed successfully!');
      }
    } catch (error) {
      toast.error('Failed to complete session');
    } finally {
      setIsCompleting(false);
      setShowWinnerSelection(false);
    }
  };

  const getStatusBadgeVariant = () => {
    if (isSessionCompleted) return 'outline';
    if (isSessionStarted) return 'default';
    return 'secondary';
  };

  const getStatusText = () => {
    if (isSessionCompleted) return 'Completed';
    if (isSessionStarted) return 'Active';
    return 'Ready to Start';
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-xl">{session.notes || 'Tennis Session'}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {session.session_type} • {session.format || 'singles'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {realTimeConnected && (
                <div className="flex items-center gap-1 text-green-600 text-xs">
                  <Wifi className="w-3 h-3" />
                  <span>Live</span>
                </div>
              )}
              <Badge variant={getStatusBadgeVariant()}>
                {getStatusText()}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Session Timer */}
          {isSessionStarted && !isSessionCompleted && (
            <div className="flex items-center justify-center p-6 bg-muted/50 rounded-lg">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-mono font-bold text-primary">
                  {formatDuration(elapsedTime)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Session Duration</p>
              </div>
            </div>
          )}

          {/* Participants */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4" />
              <h3 className="font-medium">Participants ({participants.length})</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {participants.map((participant, index) => (
                <div key={participant.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={participant.user?.avatar_url} />
                    <AvatarFallback>
                      {participant.user?.full_name?.charAt(0) || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {participant.user?.full_name || 'Player'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {participant.user_id === session.creator_id && <Crown className="w-3 h-3 inline mr-1" />}
                      {participant.role}
                    </p>
                  </div>
                  {participant.stakes_contributed && (
                    <Badge variant="outline" className="text-xs">
                      {participant.stakes_contributed} tokens
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Session Info */}
          <div className="space-y-2">
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Stakes:</span>
                <span className="ml-2 font-medium">{session.stakes_amount || 0} tokens</span>
              </div>
              <div>
                <span className="text-muted-foreground">Location:</span>
                <span className="ml-2 font-medium">{session.location || 'TBD'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isCreator && !isSessionCompleted && (
            <div className="flex gap-3">
              {!isSessionStarted ? (
                <Button
                  onClick={handleStartSession}
                  disabled={isStarting || participants.length < 2}
                  className="flex-1"
                  size="lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isStarting ? 'Starting...' : 'Start Session'}
                </Button>
              ) : (
                <Button
                  onClick={handleEndSession}
                  disabled={isCompleting}
                  variant="destructive"
                  className="flex-1"
                  size="lg"
                >
                  <Square className="w-4 h-4 mr-2" />
                  {isCompleting ? 'Ending...' : 'End Session'}
                </Button>
              )}
            </div>
          )}

          {/* Non-creator view for active session */}
          {!isCreator && isSessionStarted && !isSessionCompleted && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Session is active. Waiting for {session.creator?.full_name} to end the session.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Winner Selection Dialog */}
      <WinnerSelectionDialog
        isOpen={showWinnerSelection}
        onClose={() => setShowWinnerSelection(false)}
        session={session}
        participants={participants}
        onConfirm={handleCompleteSession}
        isCompleting={isCompleting}
      />

      {/* Completion Summary Dialog */}
      <SessionCompletionSummary
        isOpen={showCompletionSummary}
        onClose={() => setShowCompletionSummary(false)}
        completionData={completionData}
        session={session}
      />
    </>
  );
}