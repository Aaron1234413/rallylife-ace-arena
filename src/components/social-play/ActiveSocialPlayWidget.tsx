
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Play, Square, MapPin } from 'lucide-react';
import { useSocialPlaySession } from '@/contexts/SocialPlaySessionContext';
import { useSocialPlaySessions } from '@/hooks/useSocialPlaySessions';
import { ShareLinkGenerator } from './ShareLinkGenerator';

export const ActiveSocialPlayWidget = () => {
  const { activeSession, startSession, endSession, getDurationMinutes, loading } = useSocialPlaySession();
  const { activeSession: dbSession } = useSocialPlaySessions();
  const [duration, setDuration] = useState(0);

  // Update duration every minute
  useEffect(() => {
    if (!activeSession) return;

    const updateDuration = () => {
      setDuration(getDurationMinutes());
    };

    updateDuration();
    const interval = setInterval(updateDuration, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [activeSession, getDurationMinutes]);

  // Show database session that could be started
  if (!activeSession && dbSession && dbSession.status === 'pending') {
    const currentParticipants = dbSession.participants?.length || 0;
    const maxParticipants = dbSession.session_type === 'singles' ? 2 : 4;
    
    return (
      <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Ready to Play
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium capitalize">
                  {dbSession.session_type} Session
                </h4>
                <Badge variant="outline" className="capitalize">
                  {dbSession.session_type}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {currentParticipants}/{maxParticipants} players
                </div>
                {dbSession.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {dbSession.location}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => startSession({
                    id: dbSession.id,
                    sessionType: dbSession.session_type,
                    location: dbSession.location || undefined
                  })}
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <Play className="h-4 w-4" />
                  Start Playing
                </Button>
                <Badge 
                  variant={currentParticipants >= maxParticipants ? 'destructive' : 'secondary'}
                  className="px-3 py-2"
                >
                  {currentParticipants >= maxParticipants ? 'Full' : 'Open'}
                </Badge>
              </div>
            </div>
          </div>
          
          <ShareLinkGenerator event={dbSession} compact />
        </CardContent>
      </Card>
    );
  }

  // Show active session
  if (activeSession) {
    return (
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
              
              <div className="text-center py-4">
                <div className="text-2xl font-bold text-green-600">{duration}</div>
                <div className="text-sm text-muted-foreground">minutes played</div>
              </div>
              
              <Button
                onClick={endSession}
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
    );
  }

  return null;
};
