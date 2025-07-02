
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Play, Square, MapPin, User, RefreshCw } from 'lucide-react';
import { useSocialPlaySession } from '@/contexts/SocialPlaySessionContext';
import { useRealTimeSessions } from '@/hooks/useRealTimeSessions';
import { useUnifiedInvitations } from '@/hooks/useUnifiedInvitations';
import { useAuth } from '@/hooks/useAuth';
import { ShareLinkGenerator } from './ShareLinkGenerator';
import { SimpleEndEventModal } from './SimpleEndEventModal';
import { toast } from 'sonner';

interface ActiveSocialPlayWidgetProps {
  onAddXP?: (amount: number, type: string, desc?: string) => Promise<void>;
  onRestoreHP?: (amount: number, type: string, desc?: string) => Promise<void>;
}

export const ActiveSocialPlayWidget: React.FC<ActiveSocialPlayWidgetProps> = ({
  onAddXP,
  onRestoreHP
}) => {
  const { user } = useAuth();
  const { activeSession, startSession, endSession, getDurationMinutes, loading } = useSocialPlaySession();
  const unifiedSessions = useRealTimeSessions('my-sessions', user?.id, {
    sessionTypes: ['social_play'],
    includePrivate: true
  });
  const { receivedInvitations, sentInvitations } = useUnifiedInvitations();
  const [duration, setDuration] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [acceptedInvitations, setAcceptedInvitations] = useState(0);

  // Update duration every minute
  useEffect(() => {
    if (!activeSession) return;

    const updateDuration = () => {
      setDuration(getDurationMinutes());
    };

    updateDuration();
    const interval = setInterval(updateDuration, 60000);
    return () => clearInterval(interval);
  }, [activeSession, getDurationMinutes]);

  // Calculate accepted invitations for current session
  useEffect(() => {
    const waitingSessions = unifiedSessions.sessions.filter(s => s.status === 'waiting' && s.session_type === 'social_play');
    if (waitingSessions.length === 0) return;
    
    const currentSession = waitingSessions[0];
    const socialPlayInvitations = sentInvitations.filter(
      inv => inv.invitation_category === 'social_play' && 
             inv.session_data?.eventTitle === currentSession.notes
    );
    
    const acceptedCount = socialPlayInvitations.filter(inv => inv.status === 'accepted').length;
    setAcceptedInvitations(acceptedCount);
  }, [sentInvitations, unifiedSessions.sessions]);

  const handleEndSession = async () => {
    await endSession();
    setShowEndModal(false);
  };

  const handleCleanup = async () => {
    // Refresh sessions
    await unifiedSessions.fetchSessions();
  };

  // Helper function to get participant role
  const getParticipantRole = (participant: any, sessionType: string, createdBy: string) => {
    if (participant.role) {
      return participant.role;
    }
    
    if (participant.user_id === createdBy) {
      return 'creator';
    }
    
    if (sessionType === 'singles') {
      return 'opponent';
    } else {
      return 'player';
    }
  };

  // Show waiting sessions
  const sessionToShow = unifiedSessions.sessions.find(s => s.status === 'waiting' && s.session_type === 'social_play');

  // Show session that could be started
  if (!activeSession && sessionToShow && sessionToShow.status === 'waiting') {
    const joinedParticipants = sessionToShow.participants?.filter((p: any) => p.status === 'joined') || [];
    const sessionType = sessionToShow.format || 'singles';
    const maxParticipants = sessionToShow.max_players;
    const minParticipants = sessionType === 'singles' ? 2 : 4;
    const totalParticipants = joinedParticipants.length + acceptedInvitations;
    const isReady = totalParticipants >= minParticipants;
    
    return (
      <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Waiting for Players
            </div>
            <Button
              onClick={handleCleanup}
              variant="ghost"
              size="sm"
              disabled={unifiedSessions.loading}
              className="text-xs"
            >
              <RefreshCw className={`h-3 w-3 ${unifiedSessions.loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium capitalize">
                  {sessionType} Session
                </h4>
                <Badge variant="outline" className="capitalize">
                  {sessionType}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {totalParticipants}/{maxParticipants} players
                  {acceptedInvitations > 0 && (
                    <span className="text-green-600">
                      (+{acceptedInvitations} accepted)
                    </span>
                  )}
                </div>
                {sessionToShow.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {sessionToShow.location}
                  </div>
                )}
              </div>

              {/* Show current participants */}
              {joinedParticipants.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-600">Current Players:</div>
                  <div className="flex flex-wrap gap-1">
                     {joinedParticipants.map((participant, index) => {
                        const role = getParticipantRole(participant, sessionType, sessionToShow.creator_id);
                       return (
                         <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                           <User className="h-3 w-3" />
                           {participant.user?.full_name || 'Player'}
                           <span className="text-xs opacity-75">({role})</span>
                         </Badge>
                       );
                     })}
                  </div>
                </div>
              )}

              {/* Show invitation status */}
              {acceptedInvitations > 0 && (
                <div className="bg-green-50 p-2 rounded text-sm">
                  <div className="text-green-700 font-medium">
                    {acceptedInvitations} invitation{acceptedInvitations > 1 ? 's' : ''} accepted!
                  </div>
                  <div className="text-green-600 text-xs">
                    {isReady ? 'Ready to start playing!' : `Need ${minParticipants - totalParticipants} more player${minParticipants - totalParticipants > 1 ? 's' : ''}`}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                {isReady ? (
                  <Button
                    onClick={() => {
                      startSession({
                        id: sessionToShow.id,
                        sessionType: sessionType as 'singles' | 'doubles',
                        location: sessionToShow.location || undefined,
                        participants: joinedParticipants.map(p => ({
                          id: p.id,
                          name: p.user?.full_name || 'Player',
                          role: getParticipantRole(p, sessionType, sessionToShow.creator_id),
                          user_id: p.user_id
                        }))
                      });
                    }}
                    className="flex items-center gap-2"
                    disabled={loading}
                  >
                    <Play className="h-4 w-4" />
                    Start Playing
                  </Button>
                ) : (
                  <Button disabled className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Waiting for Players
                  </Button>
                )}
                
                <Badge 
                  variant={isReady ? 'default' : 'secondary'}
                  className="px-3 py-2"
                >
                  {isReady ? 'Ready' : 'Waiting'}
                </Badge>
              </div>
            </div>
          </div>
          
          <ShareLinkGenerator event={sessionToShow} compact />
        </CardContent>
      </Card>
    );
  }

  // Show active session
  if (activeSession) {
    return (
      <>
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-lg">Playing Now</span>
              </div>
              <Badge variant="outline" className="flex items-center gap-1 bg-green-100">
                <Clock className="h-3 w-3" />
                {duration}m
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium capitalize">
                    {activeSession.sessionType} Session
                  </h4>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
                
                {activeSession.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {activeSession.location}
                  </div>
                )}

                {/* Show active participants */}
                {activeSession.participants && activeSession.participants.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-600">Playing with:</div>
                    <div className="flex flex-wrap gap-1">
                      {activeSession.participants.map((participant, index) => (
                        <Badge key={index} variant="outline" className="text-xs flex items-center gap-1 bg-green-50">
                          <User className="h-3 w-3" />
                          {participant.name}
                          <span className="text-xs opacity-75">({participant.role})</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="text-center py-4">
                  <div className="text-2xl font-bold text-green-600">{duration}</div>
                  <div className="text-sm text-muted-foreground">minutes played</div>
                </div>
                
                <Button
                  onClick={() => setShowEndModal(true)}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  disabled={loading}
                >
                  <Square className="h-4 w-4" />
                  End Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* End Session Modal */}
        {onAddXP && onRestoreHP && (
          <SimpleEndEventModal
            open={showEndModal}
            onOpenChange={setShowEndModal}
            durationMinutes={duration}
            onConfirmEnd={handleEndSession}
            onAddXP={onAddXP}
            onRestoreHP={onRestoreHP}
          />
        )}
      </>
    );
  }

  return null;
};
