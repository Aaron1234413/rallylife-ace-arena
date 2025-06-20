
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Clock, MapPin, Play, Pause, Square, MessageCircle, Heart } from 'lucide-react';
import { useSocialPlaySession } from '@/contexts/SocialPlaySessionContext';
import { formatDistanceToNow } from 'date-fns';
import { SocialPlayCheckInModal } from './SocialPlayCheckInModal';

export const ActiveSocialPlayWidget = () => {
  const { 
    activeSession, 
    participants, 
    isSessionActive, 
    isSessionOwner,
    updateSessionStatus,
    leaveSession,
    loading 
  } = useSocialPlaySession();

  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  // Update session duration every minute
  useEffect(() => {
    if (!isSessionActive || !activeSession?.start_time) return;

    const updateDuration = () => {
      const startTime = new Date(activeSession.start_time);
      const now = new Date();
      const durationMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
      setSessionDuration(durationMinutes);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [isSessionActive, activeSession?.start_time]);

  // Don't render if no active session
  if (!isSessionActive || !activeSession) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Waiting to start';
      case 'active': return 'Playing now';
      case 'paused': return 'Paused';
      default: return status;
    }
  };

  const getCompetitiveLevelText = (level: string) => {
    switch (level) {
      case 'low': return 'Chill';
      case 'medium': return 'Fun';
      case 'high': return 'Competitive';
      default: return level;
    }
  };

  const getCompetitiveLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-green-100 text-green-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartSession = () => {
    updateSessionStatus('active');
  };

  const handlePauseSession = () => {
    updateSessionStatus('paused');
  };

  const handleResumeSession = () => {
    updateSessionStatus('active');
  };

  const handleEndSession = () => {
    updateSessionStatus('completed');
  };

  const joinedParticipants = participants.filter(p => p.status === 'joined' || p.status === 'accepted');
  const pendingParticipants = participants.filter(p => p.status === 'invited');

  const displayDuration = () => {
    if (activeSession.status === 'pending') {
      return `Created ${formatDistanceToNow(new Date(activeSession.created_at))} ago`;
    }
    if (activeSession.start_time) {
      return sessionDuration > 0 ? `${sessionDuration}m` : 'Just started';
    }
    return 'Not started';
  };

  return (
    <>
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Social Play Session
            </CardTitle>
            <Badge className={`${getStatusColor(activeSession.status)} text-white`}>
              {getStatusText(activeSession.status)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {displayDuration()}
            </div>
            {activeSession.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {activeSession.location}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Session Details */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="bg-white">
              {activeSession.session_type === 'singles' ? 'Singles' : 'Doubles'}
            </Badge>
            <Badge variant="outline" className={`${getCompetitiveLevelColor(activeSession.competitive_level)} border-0`}>
              {getCompetitiveLevelText(activeSession.competitive_level)}
            </Badge>
            <Badge variant="outline" className="bg-white">
              {joinedParticipants.length + 1} players
            </Badge>
          </div>

          {/* Participants */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Players ({joinedParticipants.length + 1})
            </h4>
            
            <div className="flex flex-wrap gap-2">
              {/* Show session creator */}
              <div className="flex items-center gap-2 bg-purple-100 rounded-full px-3 py-1.5 border">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xs bg-purple-200">ME</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">You</span>
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-4">Host</Badge>
              </div>
              
              {/* Show joined participants */}
              {joinedParticipants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 border">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={participant.user?.avatar_url || ''} />
                    <AvatarFallback className="text-xs bg-gray-200">
                      {participant.user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{participant.user?.full_name || 'Unknown'}</span>
                </div>
              ))}
            </div>

            {/* Pending invitations */}
            {pendingParticipants.length > 0 && (
              <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded">
                ⏳ {pendingParticipants.length} player(s) invited, waiting for response
              </div>
            )}
          </div>

          {/* Session Owner Controls */}
          {isSessionOwner && (
            <div className="flex gap-2 pt-2">
              {activeSession.status === 'pending' && (
                <Button 
                  onClick={handleStartSession}
                  className="flex-1 h-9 bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start Session
                </Button>
              )}
              
              {activeSession.status === 'active' && (
                <>
                  <Button 
                    onClick={handlePauseSession}
                    variant="outline"
                    className="flex-1 h-9"
                    disabled={loading}
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                  <Button 
                    onClick={handleEndSession}
                    variant="destructive"
                    className="flex-1 h-9"
                    disabled={loading}
                  >
                    <Square className="h-4 w-4 mr-1" />
                    End
                  </Button>
                </>
              )}
              
              {activeSession.status === 'paused' && (
                <>
                  <Button 
                    onClick={handleResumeSession}
                    className="flex-1 h-9 bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </Button>
                  <Button 
                    onClick={handleEndSession}
                    variant="destructive"
                    className="flex-1 h-9"
                    disabled={loading}
                  >
                    <Square className="h-4 w-4 mr-1" />
                    End
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Participant Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => setIsCheckInModalOpen(true)}
              variant="outline"
              className="flex-1 h-9"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Check-In
            </Button>
            
            {!isSessionOwner && (
              <Button 
                onClick={leaveSession}
                variant="outline"
                className="flex-1 h-9 text-red-600 hover:text-red-700"
                disabled={loading}
              >
                Leave Session
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Check-In Modal */}
      <SocialPlayCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        sessionId={activeSession.id}
      />
    </>
  );
};
