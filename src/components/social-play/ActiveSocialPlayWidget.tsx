
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Play, Square, MapPin, User } from 'lucide-react';
import { useSocialPlaySession } from '@/contexts/SocialPlaySessionContext';
import { useSocialPlaySessions } from '@/hooks/useSocialPlaySessions';
import { ShareLinkGenerator } from './ShareLinkGenerator';
import { SimpleEndEventModal } from './SimpleEndEventModal';

interface ActiveSocialPlayWidgetProps {
  onAddXP?: (amount: number, type: string, desc?: string) => Promise<void>;
  onRestoreHP?: (amount: number, type: string, desc?: string) => Promise<void>;
}

export const ActiveSocialPlayWidget: React.FC<ActiveSocialPlayWidgetProps> = ({
  onAddXP,
  onRestoreHP
}) => {
  const { activeSession, startSession, endSession, getDurationMinutes, loading } = useSocialPlaySession();
  const { activeSession: dbSession } = useSocialPlaySessions();
  const [duration, setDuration] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);

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

  const handleEndSession = async () => {
    await endSession();
    setShowEndModal(false);
  };

  // Show database session that could be started
  if (!activeSession && dbSession && dbSession.status === 'pending') {
    const joinedParticipants = dbSession.participants?.filter(p => p.status === 'joined') || [];
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
                  {joinedParticipants.length}/{maxParticipants} players
                </div>
                {dbSession.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {dbSession.location}
                  </div>
                )}
              </div>

              {/* Show joined participants */}
              {joinedParticipants.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-600">Players:</div>
                  <div className="flex flex-wrap gap-1">
                    {joinedParticipants.map((participant, index) => (
                      <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {participant.user?.full_name || 'Player'}
                        <span className="text-xs opacity-75">({participant.role})</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={() => startSession({
                    id: dbSession.id,
                    sessionType: dbSession.session_type as 'singles' | 'doubles',
                    location: dbSession.location || undefined,
                    participants: joinedParticipants.map(p => ({
                      id: p.id,
                      name: p.user?.full_name || 'Player',
                      role: p.role,
                      user_id: p.user_id
                    }))
                  })}
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <Play className="h-4 w-4" />
                  Start Playing
                </Button>
                <Badge 
                  variant={joinedParticipants.length >= maxParticipants ? 'destructive' : 'secondary'}
                  className="px-3 py-2"
                >
                  {joinedParticipants.length >= maxParticipants ? 'Full' : 'Ready'}
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
