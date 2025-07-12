import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  MapPin, 
  Clock, 
  Trophy,
  Coins,
  Play,
  Eye
} from 'lucide-react';
import { UnifiedSession } from '@/hooks/useUnifiedSessions';
import { useAuth } from '@/hooks/useAuth';
import { SessionActiveView } from './SessionActiveView';
import { useSessionCompletion } from '@/hooks/useSessionCompletion';

interface SessionCardProps {
  session: UnifiedSession;
  participants: any[];
  onJoin?: (sessionId: string) => Promise<boolean>;
  onRefresh?: () => void;
  isJoining?: boolean;
  showJoinButton?: boolean;
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
  const [showActiveView, setShowActiveView] = useState(false);
  const [currentParticipants, setCurrentParticipants] = useState(participants);

  // Update participants when props change
  useEffect(() => {
    setCurrentParticipants(participants);
  }, [participants]);

  const isCreator = user?.id === session.creator_id;
  const hasJoined = currentParticipants.some(p => p.user_id === user?.id);
  const participantCount = currentParticipants.length;
  const isFull = participantCount >= session.max_players;
  const canJoin = !hasJoined && !isFull;
  const isWaitingOrActive = session.status === 'waiting' || session.status === 'active';

  // Auto-show active view for creators and participants when session is active
  useEffect(() => {
    if (session.status === 'active' && (isCreator || hasJoined)) {
      setShowActiveView(true);
    }
  }, [session.status, isCreator, hasJoined]);

  const handleStartSession = async (sessionId: string) => {
    const success = await startSession(sessionId);
    if (success && onRefresh) {
      onRefresh();
    }
    return success;
  };

  const handleCompleteSession = async (sessionId: string, completionData: any) => {
    const success = await completeSession(sessionId, currentParticipants, {
      duration_seconds: completionData.duration_seconds,
      winner_data: completionData.winner_data,
      ended_at: completionData.ended_at
    });
    if (success && onRefresh) {
      onRefresh();
      setShowActiveView(false);
    }
    return success;
  };

  const handleJoinSession = async () => {
    if (onJoin) {
      const success = await onJoin(session.id);
      if (success && onRefresh) {
        onRefresh();
      }
    }
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

  // Show active view for ongoing sessions if user is involved
  if (showActiveView && (isCreator || hasJoined)) {
    return (
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
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {session.session_type.charAt(0).toUpperCase() + session.session_type.slice(1)} Session
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {session.location}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={session.status === 'active' ? "default" : session.status === 'waiting' ? "secondary" : "outline"}>
              {session.status}
            </Badge>
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
              {isFull && <span className="text-destructive ml-1">(Full)</span>}
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

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {showJoinButton && canJoin && isWaitingOrActive && (
            <Button 
              onClick={handleJoinSession}
              disabled={isJoining}
              className="flex-1 gap-2"
            >
              <Play className="h-4 w-4" />
              {isJoining ? 'Joining...' : `Join (${session.stakes_amount} tokens)`}
            </Button>
          )}
          
          {(isCreator || hasJoined) && isWaitingOrActive && (
            <Button 
              onClick={() => setShowActiveView(true)}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Eye className="h-4 w-4" />
              {session.status === 'active' ? 'View Session' : 'Manage Session'}
            </Button>
          )}
          
          {isFull && !isCreator && !hasJoined && (
            <div className="flex-1 text-center py-2 text-sm text-muted-foreground">
              Session Full
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          {session.stakes_amount > 0 && (
            <p>• Winner takes {Math.floor(session.stakes_amount * currentParticipants.length * 0.9)} tokens (10% platform fee)</p>
          )}
          {session.session_type === 'challenge' && (
            <p>• HP reduction applies to all participants</p>
          )}
          <p>• {participantCount < 2 ? 'Need at least 2 players to start' : isFull ? 'Session Full - Ready to start' : 'Ready to start'}</p>
        </div>
      </CardContent>
    </Card>
  );
}