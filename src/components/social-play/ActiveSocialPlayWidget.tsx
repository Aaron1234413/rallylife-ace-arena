
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Play, 
  Pause, 
  Square, 
  Clock, 
  MapPin, 
  Trophy,
  UserPlus,
  MessageSquare
} from 'lucide-react';
import { useSocialPlaySession } from '@/contexts/SocialPlaySessionContext';
import { useSocialPlayNotifications } from '@/hooks/useSocialPlayNotifications';
import { getRandomSocialPlayMessage } from '@/utils/socialPlayMessages';
import { formatDistanceToNow } from 'date-fns';
import { EndSocialPlayModal } from './EndSocialPlayModal';

export function ActiveSocialPlayWidget() {
  const { 
    activeSession, 
    participants, 
    isSessionOwner, 
    updateSessionStatus, 
    loading 
  } = useSocialPlaySession();
  
  // Enable notifications
  useSocialPlayNotifications();
  
  const [showEndModal, setShowEndModal] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState(getRandomSocialPlayMessage());
  
  // Rotate motivational message every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMotivationalMessage(getRandomSocialPlayMessage());
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (!activeSession) {
    return (
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Social Play
          </CardTitle>
          <p className="text-sm text-purple-700 font-medium animate-pulse">
            {motivationalMessage}
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            No active social play session. Create one to start playing with friends!
          </p>
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={() => window.location.href = '/start-social-play'}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Start Social Play
          </Button>
        </CardContent>
      </Card>
    );
  }

  const joinedParticipants = participants.filter(p => p.status === 'joined' || p.status === 'accepted');
  const sessionDuration = activeSession.start_time 
    ? Math.floor((new Date().getTime() - new Date(activeSession.start_time).getTime()) / (1000 * 60))
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'pending': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Playing';
      case 'paused': return 'Paused';
      case 'pending': return 'Waiting';
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

  const handleStatusUpdate = (status: 'active' | 'paused') => {
    updateSessionStatus(status);
  };

  return (
    <>
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Social Play Session
            </CardTitle>
            <Badge className={`${getStatusColor(activeSession.status)} text-white`}>
              {getStatusText(activeSession.status)}
            </Badge>
          </div>
          <p className="text-sm text-purple-700 font-medium">
            {activeSession.session_type === 'singles' ? 'Singles (1v1)' : 'Doubles (2v2)'} • {getCompetitiveLevelText(activeSession.competitive_level)}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Session Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {activeSession.start_time && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{sessionDuration} min</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{joinedParticipants.length + 1} players</span>
            </div>
            {activeSession.location && (
              <div className="flex items-center gap-2 col-span-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{activeSession.location}</span>
              </div>
            )}
          </div>

          {/* Participants */}
          {joinedParticipants.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Playing with:</p>
              <div className="flex flex-wrap gap-2">
                {joinedParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-2 bg-white rounded-full px-3 py-1 text-sm border"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={participant.user?.avatar_url || ''} />
                      <AvatarFallback className="text-xs">
                        {participant.user?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{participant.user?.full_name || 'Unknown'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session Controls (Owner Only) */}
          {isSessionOwner && (
            <div className="flex gap-2">
              {activeSession.status === 'pending' && (
                <Button
                  onClick={() => handleStatusUpdate('active')}
                  disabled={loading}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
              )}
              
              {activeSession.status === 'active' && (
                <Button
                  onClick={() => handleStatusUpdate('paused')}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
              
              {activeSession.status === 'paused' && (
                <Button
                  onClick={() => handleStatusUpdate('active')}
                  disabled={loading}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              )}
              
              {activeSession.status !== 'pending' && (
                <Button
                  onClick={() => setShowEndModal(true)}
                  disabled={loading}
                  variant="destructive"
                  className="flex-1"
                >
                  <Square className="h-4 w-4 mr-2" />
                  End Session
                </Button>
              )}
            </div>
          )}

          {/* Non-owner message */}
          {!isSessionOwner && (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">
                {activeSession.status === 'pending' ? 'Waiting for session to start...' : 'Session in progress'}
              </p>
              {activeSession.status === 'active' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Started {formatDistanceToNow(new Date(activeSession.start_time!))} ago
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <EndSocialPlayModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
      />
    </>
  );
}
