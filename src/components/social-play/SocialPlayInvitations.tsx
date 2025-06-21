import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Check, X, Users, Clock, MapPin } from 'lucide-react';
import { useSocialPlaySessions } from '@/hooks/useSocialPlaySessions';
import { formatDistanceToNow } from 'date-fns';

export const SocialPlayInvitations = () => {
  const { sessions, acceptInvitation, isAcceptingInvitation } = useSocialPlaySessions();

  // Filter for sessions where user is invited but hasn't accepted
  const pendingInvitations = sessions.filter(session => {
    return session.participants?.some(p => p.status === 'invited');
  });

  if (pendingInvitations.length === 0) {
    return null;
  }

  const getSessionTypeLabel = (type: string) => {
    return type === 'singles' ? 'Singles (1v1)' : 'Doubles (2v2)';
  };

  const getIntensityColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          Social Play Invitations
          <Badge variant="secondary" className="ml-auto">
            {pendingInvitations.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {pendingInvitations.map((session) => {
          const hostName = 'Someone'; // You'll need to get this from session creator
          
          return (
            <div
              key={session.id}
              className="border rounded-lg p-4 bg-white shadow-sm space-y-3"
            >
              {/* Session Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{hostName} invited you to play</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(session.created_at))} ago
                    </div>
                    {session.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {getSessionTypeLabel(session.session_type)}
                </Badge>
                <Badge 
                  className={`${getIntensityColor(session.competitive_level)} text-white`}
                >
                  {session.competitive_level} intensity
                </Badge>
              </div>

              {/* Other Participants */}
              {session.participants && session.participants.length > 1 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Other players:</p>
                  <div className="flex flex-wrap gap-2">
                    {session.participants
                      .filter(p => p.status !== 'invited')
                      .map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center gap-2 bg-muted rounded-full px-3 py-1"
                        >
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={participant.user?.avatar_url || ''} />
                            <AvatarFallback className="text-xs">
                              {participant.user?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {participant.user?.full_name || 'Unknown'}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {participant.status}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => acceptInvitation(session.id)}
                  disabled={isAcceptingInvitation}
                  className="flex-1 h-9"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept & Join
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-9"
                  disabled={isAcceptingInvitation}
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
