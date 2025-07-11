import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  Square, 
  Users, 
  Clock, 
  Trophy,
  MapPin,
  Coins,
  Timer
} from 'lucide-react';
import { UnifiedSession, SessionParticipant } from '@/hooks/useUnifiedSessions';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { WinnerSelectionDialog } from './WinnerSelectionDialog';

interface SessionActiveViewProps {
  session: UnifiedSession;
  participants: SessionParticipant[];
  onStartSession: (sessionId: string) => Promise<boolean>;
  onEndSession: (sessionId: string, completionData: any) => Promise<boolean>;
  onRefresh: () => void;
}

export function SessionActiveView({
  session,
  participants,
  onStartSession,
  onEndSession,
  onRefresh
}: SessionActiveViewProps) {
  const { user } = useAuth();
  const [duration, setDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const isCreator = user?.id === session.creator_id;
  const canStart = isCreator && !isRunning && participants.length >= 2;
  const canEnd = isCreator && isRunning;

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleStartSession = async () => {
    if (!canStart) return;
    
    setIsStarting(true);
    try {
      const success = await onStartSession(session.id);
      if (success) {
        setIsRunning(true);
        setDuration(0);
        toast.success('Session started!');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndSession = () => {
    if (!canEnd) return;
    setShowWinnerDialog(true);
  };

  const handleWinnerSelected = async (winnerData: any) => {
    setIsEnding(true);
    try {
      const completionData = {
        duration_seconds: duration,
        winner_data: winnerData,
        ended_at: new Date().toISOString()
      };

      const success = await onEndSession(session.id, completionData);
      if (success) {
        setIsRunning(false);
        setShowWinnerDialog(false);
        toast.success('Session completed successfully!');
        onRefresh();
      }
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to complete session');
    } finally {
      setIsEnding(false);
    }
  };

  const getParticipantInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{session.session_type} Session</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {session.location}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isRunning ? "default" : "secondary"}>
                {isRunning ? "Active" : "Waiting"}
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

        <CardContent className="space-y-6">
          {/* Timer Section */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
              <Timer className="h-5 w-5" />
              <span className="text-2xl font-mono font-bold">
                {formatDuration(duration)}
              </span>
            </div>
            {isRunning && (
              <p className="text-sm text-muted-foreground mt-2">
                Session in progress
              </p>
            )}
          </div>

          {/* Participants Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4" />
              <span className="font-medium">
                Participants ({participants.length}/{session.max_players})
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={participant.user?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {getParticipantInitials(participant.user?.full_name || 'Unknown')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {participant.user?.full_name || 'Unknown Player'}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={participant.user_id === session.creator_id ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {participant.user_id === session.creator_id ? "Creator" : "Player"}
                      </Badge>
                      {participant.tokens_paid > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {participant.tokens_paid} tokens
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: session.max_players - participants.length }).map((_, index) => (
                <div key={`empty-${index}`} className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-muted-foreground/30">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">Waiting for player...</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isRunning && isCreator && (
              <Button 
                onClick={handleStartSession}
                disabled={!canStart || isStarting}
                className="flex-1 gap-2"
              >
                <Play className="h-4 w-4" />
                {isStarting ? 'Starting...' : 'Start Session'}
              </Button>
            )}
            
            {isRunning && isCreator && (
              <Button 
                onClick={handleEndSession}
                disabled={isEnding}
                variant="destructive"
                className="flex-1 gap-2"
              >
                <Square className="h-4 w-4" />
                {isEnding ? 'Ending...' : 'End Session'}
              </Button>
            )}

            {!isCreator && (
              <div className="flex-1 text-center py-2">
                <p className="text-sm text-muted-foreground">
                  {isRunning ? 'Session in progress...' : 'Waiting for creator to start session'}
                </p>
              </div>
            )}
          </div>

          {/* Session Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• {participants.length < 2 ? 'Need at least 2 players to start' : 'Ready to start'}</p>
            {session.stakes_amount > 0 && (
              <p>• Winner takes {Math.floor(session.stakes_amount * participants.length * 0.9)} tokens (10% platform fee)</p>
            )}
            <p>• Created by {session.creator?.full_name}</p>
          </div>
        </CardContent>
      </Card>

      {/* Winner Selection Dialog */}
      <WinnerSelectionDialog
        open={showWinnerDialog}
        onOpenChange={setShowWinnerDialog}
        session={session}
        participants={participants}
        duration={duration}
        onWinnerSelected={handleWinnerSelected}
        loading={isEnding}
      />
    </>
  );
}