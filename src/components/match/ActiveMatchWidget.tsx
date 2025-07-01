import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Users, MessageCircle, Square, Save, Plus, Wifi, WifiOff, RefreshCw, AlertCircle, Mail } from 'lucide-react';
import { useMatchSession } from '@/contexts/MatchSessionContext';
import { useUnifiedInvitations } from '@/hooks/useUnifiedInvitations';
import { MidMatchCheckInModal } from './MidMatchCheckInModal';
import { MatchInvitationCard } from './MatchInvitationCard';
import { PendingInvitationCard } from './PendingInvitationCard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const ActiveMatchWidget = () => {
  const { 
    sessionData, 
    logSetScore, 
    startNextSet, 
    isSessionActive,
    loading: matchLoading
  } = useMatchSession();
  
  const {
    receivedInvitations,
    sentInvitations,
    loading: invitationsLoading
  } = useUnifiedInvitations();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [matchDuration, setMatchDuration] = useState(0);
  const [playerSetScore, setPlayerSetScore] = useState('');
  const [opponentSetScore, setOpponentSetScore] = useState('');
  const [showNextSetPrompt, setShowNextSetPrompt] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const navigate = useNavigate();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastSyncTime(new Date());
      toast.success('Connection restored - syncing data...');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You\'re offline - changes will sync when reconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update match duration every minute
  useEffect(() => {
    if (!isSessionActive || !sessionData) return;

    const updateDuration = () => {
      const duration = Math.floor((new Date().getTime() - sessionData.start_time.getTime()) / (1000 * 60));
      setMatchDuration(duration);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 60000);
    return () => clearInterval(interval);
  }, [isSessionActive, sessionData]);

  // Check if current set is completed and show prompt
  useEffect(() => {
    if (sessionData && sessionData.sets) {
      const currentSet = sessionData.sets[sessionData.current_set];
      if (currentSet && currentSet.completed) {
        setShowNextSetPrompt(true);
        setPlayerSetScore('');
        setOpponentSetScore('');
      }
    }
  }, [sessionData]);

  // Enhanced debug logging for data flow verification
  useEffect(() => {
    console.log('🎾 [WIDGET] ActiveMatchWidget render state:', {
      isSessionActive,
      matchLoading,
      invitationsLoading,
      receivedInvitations: {
        count: receivedInvitations?.length || 0,
        data: receivedInvitations?.map(i => ({
          id: i.id,
          from: i.invitee_name,
          type: i.invitation_type,
          status: i.status
        }))
      },
      sentInvitations: {
        count: sentInvitations?.length || 0,
        data: sentInvitations?.map(i => ({
          id: i.id,
          to: i.invitee_name,
          type: i.invitation_type,
          status: i.status
        }))
      }
    });
  }, [isSessionActive, matchLoading, invitationsLoading, receivedInvitations, sentInvitations]);

  if (matchLoading || invitationsLoading) {
    console.log('🎾 [WIDGET] Loading state', { matchLoading, invitationsLoading });
    return (
      <Card className="border-tennis-green-light bg-gradient-to-r from-tennis-green-light/5 to-tennis-green-dark/5">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-600">Loading match data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ALWAYS show the widget - either active match or invitations section
  const hasReceivedInvitations = receivedInvitations && receivedInvitations.length > 0;
  const hasSentInvitations = sentInvitations && sentInvitations.length > 0;
  const hasAnyInvitations = hasReceivedInvitations || hasSentInvitations;

  console.log('🎾 [WIDGET] Render decision:', {
    isSessionActive,
    hasReceivedInvitations,
    hasSentInvitations,
    hasAnyInvitations,
    willShowActiveMatch: isSessionActive && sessionData,
    willShowInvitations: !isSessionActive
  });

  // Show active match if there is one
  if (isSessionActive && sessionData) {
    console.log('🎾 [WIDGET] Rendering active match session');
    const handleLogSetScore = async () => {
      if (!playerSetScore.trim() || !opponentSetScore.trim()) {
        toast.error('Please enter both set scores');
        return;
      }

      setIsSyncing(true);
      try {
        await logSetScore(playerSetScore.trim(), opponentSetScore.trim());
        setLastSyncTime(new Date());
        toast.success(`Set ${sessionData.current_set + 1} logged!`);
      } catch (error) {
        toast.error('Failed to save set score. Please try again.');
      } finally {
        setIsSyncing(false);
      }
    };

    const handleStartNextSet = async () => {
      setIsSyncing(true);
      try {
        await startNextSet();
        setShowNextSetPrompt(false);
        setLastSyncTime(new Date());
        toast.success('Starting next set');
      } catch (error) {
        toast.error('Failed to start next set. Please try again.');
      } finally {
        setIsSyncing(false);
      }
    };

    const handleEndMatch = () => {
      navigate('/end-match');
    };

    const playerName = 'You';
    const opponentName = sessionData.opponent_name;
    const currentSet = sessionData.sets[sessionData.current_set];
    const completedSets = sessionData.sets.filter(set => set.completed);

    const getSetLabel = (index: number) => {
      const setLabels = ['First set', 'Second set', 'Third set', 'Fourth set', 'Fifth set'];
      return setLabels[index] || `Set ${index + 1}`;
    };

    return (
      <>
        <Card className="border-tennis-green-light bg-gradient-to-r from-tennis-green-light/5 to-tennis-green-dark/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-tennis-green-dark" />
                <span className="text-lg font-orbitron font-bold">Active Match</span>
                {isSyncing && <LoadingSpinner size="sm" />}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1 font-orbitron font-medium">
                  <Clock className="h-3 w-3" />
                  {matchDuration}m
                </Badge>
                {!isOnline && (
                  <Badge variant="destructive" className="flex items-center gap-1 font-orbitron font-medium">
                    <WifiOff className="h-3 w-3" />
                    Offline
                  </Badge>
                )}
                {isOnline && lastSyncTime && (
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs font-orbitron font-medium">
                    <Wifi className="h-3 w-3" />
                    Synced
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Connection Status Alert */}
            {!isOnline && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  You're offline. Changes will sync automatically when connection is restored.
                </p>
              </div>
            )}

            {/* Table-Style Scoreboard */}
            <div className="bg-white rounded-lg border-2 border-tennis-green-light overflow-hidden">
              {completedSets.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-tennis-green-dark hover:bg-tennis-green-dark">
                      <TableHead className="text-white font-semibold font-orbitron">Score</TableHead>
                      <TableHead className="text-white font-semibold text-center font-orbitron">You</TableHead>
                      <TableHead className="text-white font-semibold text-center font-orbitron">Opponent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedSets.map((set, index) => (
                      <TableRow key={index} className="bg-tennis-green-light/5 hover:bg-tennis-green-light/10">
                        <TableCell className="font-medium text-tennis-green-dark">
                          {getSetLabel(index)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center min-w-[32px] h-8 bg-tennis-green-dark text-white font-bold rounded text-sm font-orbitron">
                            {set.playerScore}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center min-w-[32px] h-8 bg-gray-600 text-white font-bold rounded text-sm font-orbitron">
                            {set.opponentScore}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-6 text-center text-tennis-green-dark">
                  <p className="text-lg font-medium font-orbitron">No sets completed yet</p>
                  <p className="text-sm text-gray-600 mt-1">Start playing and log your first set score below</p>
                </div>
              )}
            </div>

            {/* Next Set Prompt */}
            {showNextSetPrompt && (
              <div className="bg-tennis-green-light/10 rounded-lg p-4 text-center space-y-3">
                <p className="font-medium text-tennis-green-dark font-orbitron">
                  Set {sessionData.current_set + 1} completed! Are you playing another set?
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleStartNextSet}
                    className="flex-1 bg-tennis-green-dark hover:bg-tennis-green text-white font-orbitron font-semibold"
                    disabled={isSyncing || !isOnline}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isSyncing ? 'Starting...' : 'Yes, Next Set'}
                  </Button>
                  <Button
                    onClick={handleEndMatch}
                    variant="outline"
                    className="flex-1 font-orbitron font-medium"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    End Match
                  </Button>
                </div>
              </div>
            )}

            {/* Current Set Score Input */}
            {!currentSet?.completed && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h4 className="font-medium text-gray-900 font-orbitron">
                  Set {sessionData.current_set + 1} Score
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="player-set-score" className="text-sm font-medium">
                      {playerName}
                    </Label>
                    <Input
                      id="player-set-score"
                      value={playerSetScore}
                      onChange={(e) => setPlayerSetScore(e.target.value)}
                      placeholder="e.g., 6"
                      className="text-center font-orbitron font-semibold"
                      disabled={isSyncing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opponent-set-score" className="text-sm font-medium">
                      {opponentName}
                    </Label>
                    <Input
                      id="opponent-set-score"
                      value={opponentSetScore}
                      onChange={(e) => setOpponentSetScore(e.target.value)}
                      placeholder="e.g., 4"
                      className="text-center font-orbitron font-semibold"
                      disabled={isSyncing}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleLogSetScore}
                  className="w-full bg-tennis-green-dark hover:bg-tennis-green text-white font-orbitron font-semibold"
                  size="sm"
                  disabled={!playerSetScore.trim() || !opponentSetScore.trim() || isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Log Set Score
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                className="flex-1"
                size="sm"
                disabled={isSyncing}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Check-In
              </Button>
              <Button
                onClick={handleEndMatch}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <Square className="h-4 w-4 mr-2" />
                End Match
              </Button>
            </div>

            {/* Sync Status */}
            {lastSyncTime && isOnline && (
              <div className="text-center text-xs text-gray-500 font-orbitron">
                Last synced: {lastSyncTime.toLocaleTimeString()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mid-Match Check-In Modal */}
        <MidMatchCheckInModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  // Show invitations section - ALWAYS VISIBLE even if empty
  console.log('🎾 [WIDGET] Rendering invitations section');
  return (
    <Card className="border-tennis-green-light bg-gradient-to-r from-tennis-green-light/5 to-tennis-green-dark/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-tennis-green-dark" />
          <span className="text-lg font-orbitron font-bold">Match Invitations</span>
          {(hasReceivedInvitations || hasSentInvitations) && (
            <Badge variant="secondary" className="ml-2">
              {(receivedInvitations?.length || 0) + (sentInvitations?.length || 0)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {hasAnyInvitations ? (
          <div className="space-y-4">
            {/* Received Invitations */}
            {hasReceivedInvitations && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Received ({receivedInvitations.length})
                </h3>
                {receivedInvitations.map((invitation) => {
                  console.log('🎾 [WIDGET] Rendering received invitation:', invitation.id);
                  return (
                    <MatchInvitationCard key={invitation.id} invitation={invitation} />
                  );
                })}
              </div>
            )}

            {/* Sent Invitations */}
            {hasSentInvitations && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Sent ({sentInvitations.length})
                </h3>
                {sentInvitations.map((invitation) => {
                  console.log('🎾 [WIDGET] Rendering sent invitation:', invitation.id);
                  return (
                    <PendingInvitationCard key={invitation.id} invitation={invitation} />
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Match Invitations</h3>
            <p className="text-gray-600 mb-4">
              You don't have any pending match invitations right now.
            </p>
            <Button 
              onClick={() => navigate('/start-match')}
              className="bg-tennis-green-dark hover:bg-tennis-green text-white"
            >
              Start a New Match
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
