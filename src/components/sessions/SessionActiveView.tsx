import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  Play, 
  Pause, 
  Square, 
  Users, 
  Clock, 
  Trophy,
  MapPin,
  Coins,
  Timer,
  CheckCircle,
  Circle,
  AlertCircle,
  Activity,
  Zap
} from 'lucide-react';
import { UnifiedSession, SessionParticipant } from '@/hooks/useUnifiedSessions';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { WinnerSelectionDialog } from './WinnerSelectionDialog';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface SessionActiveViewProps {
  session: UnifiedSession;
  participants: SessionParticipant[];
  onStartSession: (sessionId: string) => Promise<boolean>;
  onEndSession: (sessionId: string, completionData: any) => Promise<boolean>;
  onRefresh: () => void;
}

type ParticipantStatus = 'ready' | 'waiting' | 'active' | 'disconnected';

interface EnhancedParticipant extends SessionParticipant {
  status: ParticipantStatus;
  lastActivity?: Date;
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
  const [isRunning, setIsRunning] = useState(session.status === 'active');
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [enhancedParticipants, setEnhancedParticipants] = useState<EnhancedParticipant[]>([]);
  const [sessionProgress, setSessionProgress] = useState(0);

  const isCreator = user?.id === session.creator_id;
  const canStart = isCreator && !isRunning && participants.length >= 2;
  const canEnd = isCreator && isRunning;

  // Enhanced participant status tracking
  useEffect(() => {
    const enhanced = participants.map(p => ({
      ...p,
      status: (isRunning ? 'active' : 'ready') as ParticipantStatus,
      lastActivity: new Date()
    }));
    setEnhancedParticipants(enhanced);
  }, [participants, isRunning]);

  // Real-time session updates
  useEffect(() => {
    if (!session.id) return;

    const channel = supabase
      .channel(`session-${session.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'unified_sessions',
        filter: `id=eq.${session.id}`
      }, (payload) => {
        console.log('Session update:', payload);
        const newSession = payload.new as UnifiedSession;
        setIsRunning(newSession.status === 'active');
        onRefresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session.id, onRefresh]);

  // Calculate session progress based on activity type
  useEffect(() => {
    if (!isRunning || duration === 0) {
      setSessionProgress(0);
      return;
    }

    // Different progress calculations based on session type
    let expectedDuration = 60 * 60; // Default 1 hour
    switch (session.session_type?.toLowerCase()) {
      case 'quick match':
        expectedDuration = 30 * 60; // 30 minutes
        break;
      case 'tournament':
        expectedDuration = 120 * 60; // 2 hours
        break;
      case 'practice':
        expectedDuration = 45 * 60; // 45 minutes
        break;
    }

    const progress = Math.min((duration / expectedDuration) * 100, 100);
    setSessionProgress(progress);
  }, [duration, isRunning, session.session_type]);

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

  const getStatusIcon = (status: ParticipantStatus) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-3 w-3 text-success" />;
      case 'active': return <Activity className="h-3 w-3 text-primary animate-pulse" />;
      case 'waiting': return <Circle className="h-3 w-3 text-warning" />;
      case 'disconnected': return <AlertCircle className="h-3 w-3 text-error" />;
      default: return <Circle className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getActivitySpecificElements = () => {
    const type = session.session_type?.toLowerCase();
    
    if (type?.includes('tournament')) {
      return {
        icon: <Trophy className="h-5 w-5 text-yellow-500" />,
        gradient: 'from-yellow-500 to-orange-600',
        description: 'Competitive tournament session'
      };
    } else if (type?.includes('practice')) {
      return {
        icon: <Zap className="h-5 w-5 text-blue-500" />,
        gradient: 'from-blue-500 to-cyan-600',
        description: 'Practice and skill development'
      };
    } else {
      return {
        icon: <Activity className="h-5 w-5 text-green-500" />,
        gradient: 'from-green-500 to-emerald-600',
        description: 'General play session'
      };
    }
  };

  const activityElements = getActivitySpecificElements();

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg bg-gradient-to-br", activityElements.gradient)}>
                {activityElements.icon}
              </div>
              <div>
                <CardTitle className="text-lg">{session.session_type} Session</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {session.location}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activityElements.description}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge 
                status={isRunning ? "Active" : "Waiting"} 
                variant={isRunning ? "success" : "warning"}
                icon={isRunning ? Activity : Circle}
                animated={true}
                pulse={isRunning}
                size="lg"
              />
              {session.stakes_amount > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Coins className="h-3 w-3" />
                  {session.stakes_amount}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Session Progress Bar */}
          {isRunning && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Session Progress</span>
                <span className="font-medium">{Math.round(sessionProgress)}%</span>
              </div>
              <Progress 
                value={sessionProgress} 
                className="h-2"
                indicatorClassName={cn(
                  "transition-all duration-1000 ease-out",
                  sessionProgress > 75 ? "bg-green-500" : sessionProgress > 50 ? "bg-yellow-500" : "bg-blue-500"
                )}
              />
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Enhanced Timer Section */}
          <div className="text-center space-y-3">
            <div className={cn(
              "inline-flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300",
              isRunning 
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-sm animate-pulse" 
                : "bg-muted"
            )}>
              <div className="relative">
                <Timer className={cn("h-6 w-6 transition-colors", isRunning ? "text-green-600" : "text-muted-foreground")} />
                {isRunning && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-ping" />
                )}
              </div>
              <span className={cn(
                "text-3xl font-mono font-bold transition-colors",
                isRunning ? "text-green-700" : "text-foreground"
              )}>
                {formatDuration(duration)}
              </span>
              {isRunning && (
                <div className="flex items-center gap-1 text-green-600">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">Live</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{enhancedParticipants.filter(p => p.status === 'active' || p.status === 'ready').length} active</span>
              </div>
              {isRunning && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Started {Math.floor(duration / 60)}m ago</span>
                </div>
              )}
            </div>
          </div>

          {/* Participants Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4" />
              <span className="font-medium">
                Participants ({participants.length}/{session.max_players})
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-3">
              {enhancedParticipants.map((participant) => (
                <div key={participant.id} className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all duration-300",
                  participant.status === 'active' && "border-green-200 bg-green-50/50",
                  participant.status === 'ready' && "border-blue-200 bg-blue-50/50",
                  participant.status === 'waiting' && "border-yellow-200 bg-yellow-50/50",
                  participant.status === 'disconnected' && "border-red-200 bg-red-50/50"
                )}>
                  <div className="relative">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={participant.user?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {getParticipantInitials(participant.user?.full_name || 'Unknown')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                      {getStatusIcon(participant.status)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {participant.user?.full_name || 'Unknown Player'}
                      </p>
                      {participant.user_id === user?.id && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge 
                        status={participant.status}
                        variant={
                          participant.status === 'active' ? 'success' :
                          participant.status === 'ready' ? 'info' :
                          participant.status === 'waiting' ? 'warning' : 'error'
                        }
                        size="sm"
                        animated={true}
                        pulse={participant.status === 'active'}
                      />
                      
                      <Badge 
                        variant={participant.user_id === session.creator_id ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {participant.user_id === session.creator_id ? "Creator" : "Player"}
                      </Badge>
                      
                      {participant.tokens_paid > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Coins className="h-3 w-3" />
                          {participant.tokens_paid}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Enhanced Empty slots */}
              {Array.from({ length: session.max_players - participants.length }).map((_, index) => (
                <div key={`empty-${index}`} className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-muted-foreground">Waiting for player...</span>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="h-2 w-16 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
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