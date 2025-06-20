
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Clock, 
  Pause, 
  Play, 
  Square, 
  MessageSquare,
  Zap,
  MapPin
} from 'lucide-react';
import { useSocialPlaySession } from '@/contexts/SocialPlaySessionContext';
import { SocialPlayCheckInModal } from './SocialPlayCheckInModal';
import { toast } from 'sonner';

export function ActiveSocialPlayWidget() {
  const { 
    sessionData, 
    isSessionActive, 
    pauseSession, 
    resumeSession, 
    endSession,
    addCheckIn,
    loading 
  } = useSocialPlaySession();
  
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  // Update duration periodically
  React.useEffect(() => {
    if (!isSessionActive || !sessionData.start_time) return;

    const interval = setInterval(() => {
      const start = new Date(sessionData.start_time!).getTime();
      const now = new Date().getTime();
      const duration = Math.floor((now - start) / 1000 / 60); // in minutes
      setSessionDuration(duration);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isSessionActive, sessionData.start_time]);

  const handlePauseResume = async () => {
    try {
      if (sessionData.status === 'active') {
        await pauseSession();
        toast.success('Session paused');
      } else if (sessionData.status === 'paused') {
        await resumeSession();
        toast.success('Session resumed');
      }
    } catch (error) {
      toast.error('Failed to update session status');
    }
  };

  const handleEndSession = async () => {
    try {
      await endSession({});
      toast.success('Session ended');
    } catch (error) {
      toast.error('Failed to end session');
    }
  };

  const handleCheckIn = async (moodEmoji: string, notes?: string) => {
    try {
      await addCheckIn(moodEmoji, notes);
      toast.success('Check-in recorded!');
      setShowCheckIn(false);
    } catch (error) {
      toast.error('Failed to record check-in');
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'low': return '🟢';
      case 'medium': return '🟡';  
      case 'high': return '🔴';
      default: return '⚪';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'low': return 'Casual';
      case 'medium': return 'Moderate';
      case 'high': return 'Intense';
      default: return level;
    }
  };

  // Don't render if no active session
  if (!isSessionActive || !sessionData.id) {
    return null;
  }

  return (
    <>
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Users className="h-5 w-5" />
            Active Social Play
            {sessionData.status === 'paused' && (
              <Badge variant="secondary" className="ml-2">Paused</Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Session Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm capitalize">{sessionData.session_type}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm flex items-center gap-1">
                {getLevelIcon(sessionData.competitive_level || 'medium')}
                {getLevelText(sessionData.competitive_level || 'medium')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatDuration(sessionDuration)}</span>
            </div>
            
            {sessionData.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate">{sessionData.location}</span>
              </div>
            )}
          </div>

          {/* Participants */}
          {sessionData.participants && sessionData.participants.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">
                Players ({sessionData.participants.filter(p => p.status === 'joined').length})
              </p>
              <div className="flex -space-x-2">
                {sessionData.participants
                  .filter(p => p.status === 'joined')
                  .slice(0, 4)
                  .map(participant => (
                    <Avatar key={participant.id} className="w-8 h-8 border-2 border-white">
                      <AvatarImage src={participant.profile?.avatar_url || ''} />
                      <AvatarFallback className="text-xs">
                        {participant.profile?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                {sessionData.participants.filter(p => p.status === 'joined').length > 4 && (
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-muted flex items-center justify-center text-xs">
                    +{sessionData.participants.filter(p => p.status === 'joined').length - 4}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Check-ins */}
          {sessionData.check_ins && sessionData.check_ins.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Recent Check-ins</p>
              <div className="flex gap-1">
                {sessionData.check_ins.slice(-5).map(checkIn => (
                  <span key={checkIn.id} className="text-lg" title={checkIn.profile?.full_name}>
                    {checkIn.mood_emoji}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCheckIn(true)}
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Check-in
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handlePauseResume}
              disabled={loading}
              className="flex-1"
            >
              {sessionData.status === 'paused' ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              )}
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndSession}
              disabled={loading}
            >
              <Square className="h-4 w-4 mr-2" />
              End
            </Button>
          </div>
        </CardContent>
      </Card>

      <SocialPlayCheckInModal
        isOpen={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        onSubmit={handleCheckIn}
      />
    </>
  );
}
