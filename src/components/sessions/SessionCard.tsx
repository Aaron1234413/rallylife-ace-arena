import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  Users, 
  MapPin, 
  Clock, 
  Trophy,
  Coins,
  Play,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Activity
} from 'lucide-react';
import { UnifiedSession } from '@/hooks/useUnifiedSessions';
import { useAuth } from '@/hooks/useAuth';
import { SessionActiveView } from './SessionActiveView';
import { SessionCompletionView } from './SessionCompletionView';
import { useSessionCompletion } from '@/hooks/useSessionCompletion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SessionCardProps {
  session: UnifiedSession;
  participants: any[];
  onJoin?: (sessionId: string) => Promise<boolean>;
  onRefresh?: () => void;
  isJoining?: boolean;
  showJoinButton?: boolean;
}

type SessionView = 'card' | 'active' | 'completion';

interface SessionError {
  message: string;
  action?: string;
}

export function SessionCard({
  session,
  participants,
  onJoin,
  onRefresh,
  isJoining = false,
  showJoinButton = true
}: SessionCardProps) {
  const { user } = useAuth();
  const { startSession, completeSession } = useSessionCompletion();
  const [currentView, setCurrentView] = useState<SessionView>('card');
  const [currentParticipants, setCurrentParticipants] = useState(participants);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<SessionError | null>(null);
  const [completionData, setCompletionData] = useState<any>(null);

  // Update participants when props change
  useEffect(() => {
    setCurrentParticipants(participants);
  }, [participants]);

  const isCreator = user?.id === session.creator_id;
  const hasJoined = currentParticipants.some(p => p.user_id === user?.id);
  const participantCount = currentParticipants.length;
  const isFull = participantCount >= session.max_players;
  const isAlmostFull = participantCount >= session.max_players - 1 && !isFull;
  const canJoin = !hasJoined && !isFull;
  
  // Determine session state and view
  const sessionState = {
    waiting: session.status === 'waiting',
    active: session.status === 'active', 
    completed: session.status === 'completed',
    cancelled: session.status === 'cancelled'
  };

  // Auto-show appropriate view based on session status and user involvement
  useEffect(() => {
    if (sessionState.completed && (isCreator || hasJoined)) {
      setCurrentView('completion');
      // Load completion data if available
      if (session.session_result) {
        setCompletionData(session.session_result);
      }
    } else if (sessionState.active && (isCreator || hasJoined)) {
      setCurrentView('active');
    } else {
      setCurrentView('card');
    }
  }, [session.status, isCreator, hasJoined, sessionState]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleStartSession = async (sessionId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await startSession(sessionId);
      if (success) {
        setCurrentView('active');
        if (onRefresh) {
          onRefresh();
        }
        toast.success('Session started successfully!');
      } else {
        setError({ message: 'Failed to start session', action: 'retry' });
      }
      return success;
    } catch (error) {
      console.error('Error starting session:', error);
      setError({ message: 'Error starting session', action: 'retry' });
      toast.error('Failed to start session');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSession = async (sessionId: string, completionData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await completeSession(sessionId, currentParticipants, {
        duration_seconds: completionData.duration_seconds,
        winner_data: completionData.winner_data,
        ended_at: completionData.ended_at
      });
      
      if (success) {
        setCompletionData(completionData);
        setCurrentView('completion');
        if (onRefresh) {
          onRefresh();
        }
        toast.success('Session completed successfully!');
      } else {
        setError({ message: 'Failed to complete session', action: 'retry' });
      }
      return success;
    } catch (error) {
      console.error('Error completing session:', error);
      setError({ message: 'Error completing session', action: 'retry' });
      toast.error('Failed to complete session');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!onJoin) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await onJoin(session.id);
      if (success && onRefresh) {
        onRefresh();
        toast.success('Successfully joined session!');
      } else if (!success) {
        setError({ message: 'Failed to join session', action: 'retry' });
      }
    } catch (error) {
      console.error('Error joining session:', error);
      setError({ message: 'Error joining session', action: 'retry' });
      toast.error('Failed to join session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToCard = () => {
    setCurrentView('card');
    setError(null);
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleViewTransition = (view: SessionView) => {
    setCurrentView(view);
    setError(null);
  };

  const getParticipantInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusInfo = () => {
    if (sessionState.completed) {
      return { color: 'success', icon: CheckCircle, text: 'Completed' };
    } else if (sessionState.active) {
      return { color: 'info', icon: Activity, text: 'Active' };
    } else if (sessionState.waiting) {
      return { color: 'warning', icon: Clock, text: 'Waiting' };
    } else if (sessionState.cancelled) {
      return { color: 'error', icon: AlertCircle, text: 'Cancelled' };
    }
    return { color: 'default', icon: Clock, text: 'Unknown' };
  };

  const statusInfo = getStatusInfo();

  // Show completion view for completed sessions
  if (currentView === 'completion' && completionData) {
    return (
      <div className="w-full animate-fade-in">
        <SessionCompletionView
          session={session}
          participants={currentParticipants}
          completionData={completionData}
          onReturnToSessions={handleReturnToCard}
        />
      </div>
    );
  }

  // Show active view for ongoing sessions if user is involved
  if (currentView === 'active' && (isCreator || hasJoined)) {
    return (
      <div className="w-full animate-fade-in">
        <div className="mb-4">
          <Button 
            onClick={handleReturnToCard} 
            variant="ghost" 
            size="sm" 
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Button>
        </div>
        <SessionActiveView
          session={session}
          participants={currentParticipants}
          onStartSession={handleStartSession}
          onEndSession={handleCompleteSession}
          onRefresh={() => {
            onRefresh?.();
            setCurrentParticipants(participants);
          }}
        />
      </div>
    );
  }

  // Default card view with enhanced state management
  return (
    <div className="w-full animate-fade-in">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{error.message}</span>
            </div>
            {error.action === 'retry' && (
              <Button size="sm" variant="outline" onClick={() => setError(null)}>
                Dismiss
              </Button>
            )}
          </div>
        </div>
      )}

      <Card className={cn(
        "w-full transition-all duration-300",
        isLoading && "opacity-60",
        sessionState.completed && "border-green-200 bg-green-50/30",
        sessionState.active && "border-blue-200 bg-blue-50/30",
        sessionState.cancelled && "border-red-200 bg-red-50/30"
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg transition-all duration-300",
                sessionState.completed ? "bg-gradient-to-br from-green-500 to-emerald-600" :
                sessionState.active ? "bg-gradient-to-br from-blue-500 to-cyan-600" :
                sessionState.cancelled ? "bg-gradient-to-br from-red-500 to-rose-600" :
                "bg-gradient-to-br from-gray-500 to-slate-600"
              )}>
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {session.session_type.charAt(0).toUpperCase() + session.session_type.slice(1)} Session
                  {isLoading && <Loader2 className="inline h-4 w-4 ml-2 animate-spin" />}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {session.location}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge 
                status={statusInfo.text}
                variant={statusInfo.color as any}
                icon={statusInfo.icon}
              />
              {session.stakes_amount > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Coins className="h-3 w-3" />
                  {session.stakes_amount}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

      <CardContent className="space-y-4">
        {/* Participants */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">
              Participants ({participantCount}/{session.max_players})
              {isFull && <span className="text-success ml-1 font-bold">(Full)</span>}
              {isAlmostFull && !isFull && <span className="text-warning ml-1 font-medium">(Almost Full)</span>}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {currentParticipants.slice(0, 4).map((participant) => (
              <Avatar key={participant.id} className="h-8 w-8">
                <AvatarImage src={participant.user?.avatar_url} />
                <AvatarFallback className="text-xs">
                  {getParticipantInitials(participant.user?.full_name || 'Unknown')}
                </AvatarFallback>
              </Avatar>
            ))}
            {currentParticipants.length > 4 && (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">+{currentParticipants.length - 4}</span>
              </div>
            )}
            {currentParticipants.length < session.max_players && (
              <div className="h-8 w-8 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Session Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">{formatTime(session.created_at)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Creator</p>
            <p className="font-medium">{session.creator?.full_name || 'Unknown'}</p>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex gap-2 pt-2">
          {showJoinButton && canJoin && !sessionState.completed && !sessionState.cancelled && (
            <Button 
              onClick={handleJoinSession}
              disabled={isJoining || isLoading}
              className="flex-1 gap-2"
            >
              {isJoining || isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isJoining ? 'Joining...' : isLoading ? 'Loading...' : `Join (${session.stakes_amount} tokens)`}
            </Button>
          )}
          
          {(isCreator || hasJoined) && !sessionState.completed && !sessionState.cancelled && (
            <Button 
              onClick={() => handleViewTransition('active')}
              variant="outline"
              disabled={isLoading}
              className="flex-1 gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {sessionState.active ? 'View Session' : 'Manage Session'}
            </Button>
          )}

          {sessionState.completed && (isCreator || hasJoined) && (
            <Button 
              onClick={() => handleViewTransition('completion')}
              variant="outline"
              className="flex-1 gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              View Results
            </Button>
          )}
          
          {isFull && !isCreator && !hasJoined && !sessionState.completed && (
            <div className="flex-1 text-center py-2 text-sm text-muted-foreground">
              Session Full
            </div>
          )}

          {sessionState.cancelled && (
            <div className="flex-1 text-center py-2 text-sm text-muted-foreground">
              Session Cancelled
            </div>
          )}
        </div>

        {/* Enhanced Additional Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          {session.stakes_amount > 0 && !sessionState.completed && (
            <p>• Winner takes {Math.floor(session.stakes_amount * currentParticipants.length * 0.9)} tokens (10% platform fee)</p>
          )}
          {session.session_type === 'challenge' && (
            <p>• HP reduction applies to all participants</p>
          )}
          {sessionState.waiting && (
            <p>• {participantCount < 2 ? 'Need at least 2 players to start' : isFull ? 'Session Full - Ready to start' : 'Ready to start'}</p>
          )}
          {sessionState.completed && (
            <p>• Session completed • View results for reward details</p>
          )}
          {sessionState.cancelled && (
            <p>• Session was cancelled • All stakes have been refunded</p>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  );
}