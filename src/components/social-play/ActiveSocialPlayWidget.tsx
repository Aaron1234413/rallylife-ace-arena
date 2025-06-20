
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Clock, MapPin, Play, Pause, Square } from 'lucide-react';
import { useSocialPlaySession } from '@/contexts/SocialPlaySessionContext';
import { formatDistanceToNow } from 'date-fns';

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
      case 'pending': return 'Waiting for players';
      case 'active': return 'Playing now';
      case 'paused': return 'Paused';
      default: return status;
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

  return (
    <Card className="border-2 border-tennis-green bg-tennis-green/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-tennis-green" />
            Social Play Session
          </CardTitle>
          <Badge className={`${getStatusColor(activeSession.status)} text-white`}>
            {getStatusText(activeSession.status)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {activeSession.start_time 
              ? `Started ${formatDistanceToNow(new Date(activeSession.start_time))} ago`
              : `Created ${formatDistanceToNow(new Date(activeSession.created_at))} ago`
            }
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
        <div className="flex items-center gap-4 text-sm">
          <Badge variant="outline">
            {activeSession.session_type === 'singles' ? 'Singles' : 'Doubles'}
          </Badge>
          <Badge variant="outline">
            {activeSession.competitive_level} intensity
          </Badge>
        </div>

        {/* Participants */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Players ({joinedParticipants.length + 1})</h4>
          <div className="flex flex-wrap gap-2">
            {/* Show session creator */}
            <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1">
              <Avatar className="h-6 w-6">
                <AvatarImage src="" />
                <AvatarFallback className="text-xs">ME</AvatarFallback>
              </Avatar>
              <span className="text-sm">You (Host)</span>
            </div>
            
            {/* Show joined participants */}
            {joinedParticipants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-2 bg-muted rounded-full px-3 py-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={participant.user?.avatar_url || ''} />
                  <AvatarFallback className="text-xs">
                    {participant.user?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{participant.user?.full_name || 'Unknown'}</span>
              </div>
            ))}
          </div>

          {/* Pending invitations */}
          {pendingParticipants.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {pendingParticipants.length} player(s) invited, waiting for response
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {isSessionOwner && activeSession.status === 'pending' && (
            <Button 
              onClick={handleStartSession}
              className="flex-1 h-8"
              disabled={loading}
            >
              <Play className="h-4 w-4 mr-1" />
              Start Session
            </Button>
          )}
          
          {isSessionOwner && activeSession.status === 'active' && (
            <>
              <Button 
                onClick={handlePauseSession}
                variant="outline"
                className="flex-1 h-8"
                disabled={loading}
              >
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
              <Button 
                onClick={handleEndSession}
                variant="destructive"
                className="flex-1 h-8"
                disabled={loading}
              >
                <Square className="h-4 w-4 mr-1" />
                End
              </Button>
            </>
          )}
          
          {isSessionOwner && activeSession.status === 'paused' && (
            <>
              <Button 
                onClick={handleResumeSession}
                className="flex-1 h-8"
                disabled={loading}
              >
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
              <Button 
                onClick={handleEndSession}
                variant="destructive"
                className="flex-1 h-8"
                disabled={loading}
              >
                <Square className="h-4 w-4 mr-1" />
                End
              </Button>
            </>
          )}
          
          {!isSessionOwner && (
            <Button 
              onClick={leaveSession}
              variant="outline"
              className="flex-1 h-8"
              disabled={loading}
            >
              Leave Session
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
