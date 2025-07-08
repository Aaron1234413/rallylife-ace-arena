import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Trophy, 
  Star,
  UserPlus,
  UserX,
  Eye,
  AlertCircle
} from 'lucide-react';
import { useOpenSessions, OpenSession, SessionParticipant } from '@/hooks/useOpenSessions';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDistanceToNow, format } from 'date-fns';

interface OpenSessionsListProps {
  clubId: string;
}

export function OpenSessionsList({ clubId }: OpenSessionsListProps) {
  const { 
    sessions, 
    loading, 
    joinSession, 
    leaveSession,
    getSessionParticipants,
    hasUserJoinedSession
  } = useOpenSessions(clubId);

  const [selectedSession, setSelectedSession] = useState<OpenSession | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [userJoinedSessions, setUserJoinedSessions] = useState<Set<string>>(new Set());
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [joiningSession, setJoiningSession] = useState<string | null>(null);

  // Check which sessions the user has joined
  useEffect(() => {
    const checkUserJoinedSessions = async () => {
      const joinedSet = new Set<string>();
      for (const session of sessions) {
        const hasJoined = await hasUserJoinedSession(session.id);
        if (hasJoined) {
          joinedSet.add(session.id);
        }
      }
      setUserJoinedSessions(joinedSet);
    };

    if (sessions.length > 0) {
      checkUserJoinedSessions();
    }
  }, [sessions, hasUserJoinedSession]);

  const handleViewSession = async (session: OpenSession) => {
    setSelectedSession(session);
    setLoadingParticipants(true);
    try {
      const sessionParticipants = await getSessionParticipants(session.id);
      setParticipants(sessionParticipants);
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    setJoiningSession(sessionId);
    try {
      const success = await joinSession(sessionId);
      if (success) {
        setUserJoinedSessions(prev => new Set([...prev, sessionId]));
      }
    } finally {
      setJoiningSession(null);
    }
  };

  const handleLeaveSession = async (sessionId: string) => {
    setJoiningSession(sessionId);
    try {
      const success = await leaveSession(sessionId);
      if (success) {
        setUserJoinedSessions(prev => {
          const newSet = new Set(prev);
          newSet.delete(sessionId);
          return newSet;
        });
      }
    } finally {
      setJoiningSession(null);
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return '📚';
      case 'practice': return '💪';
      case 'tournament': return '🥇';
      case 'clinic': return '🏆';
      default: return '🎾';
    }
  };

  const getSkillLevelDisplay = (min?: number, max?: number) => {
    if (!min && !max) return 'All levels';
    if (min && max) return `${min.toFixed(1)} - ${max.toFixed(1)}`;
    if (min) return `${min.toFixed(1)}+`;
    if (max) return `Up to ${max.toFixed(1)}`;
    return 'All levels';
  };

  const getSessionDateTime = (session: OpenSession) => {
    const date = new Date(session.scheduled_date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateStr = '';
    if (date.toDateString() === today.toDateString()) {
      dateStr = 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = format(date, 'MMM d');
    }

    return `${dateStr} at ${session.start_time} - ${session.end_time}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="font-medium mb-2 text-tennis-green-dark">No Open Sessions</h3>
          <p className="text-sm text-tennis-green-medium">
            Be the first to create an open session for the club!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {sessions.map((session) => {
          const isUserJoined = userJoinedSessions.has(session.id);
          const isFull = session.current_participants >= session.max_participants;
          const canJoin = !isUserJoined && !isFull && session.status === 'open';

          return (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getSessionTypeIcon(session.session_type)}</div>
                    <div>
                      <h3 className="font-semibold text-tennis-green-dark mb-1">
                        {session.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-tennis-green-medium mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>{getSessionDateTime(session)}</span>
                      </div>
                      {session.description && (
                        <p className="text-sm text-tennis-green-medium">{session.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      variant={session.status === 'open' ? 'default' : 'secondary'}
                      className={session.status === 'full' ? 'bg-orange-100 text-orange-800' : ''}
                    >
                      {session.status === 'full' ? 'Full' : session.status}
                    </Badge>
                    {isUserJoined && (
                      <Badge className="bg-green-100 text-green-800">
                        Joined
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-tennis-green-primary" />
                    <span>{session.current_participants}/{session.max_participants}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-tennis-green-primary" />
                    <span>{getSkillLevelDisplay(session.skill_level_min, session.skill_level_max)}</span>
                  </div>

                  {session.court && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-tennis-green-primary" />
                      <span>{session.court.name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-tennis-green-primary" />
                    <span>{session.duration_minutes}min</span>
                  </div>
                </div>

                {/* Creator info */}
                <div className="flex items-center gap-2 mb-4">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={session.creator?.avatar_url} />
                    <AvatarFallback className="text-xs bg-tennis-green-primary text-white">
                      {session.creator?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-tennis-green-medium">
                    Created by {session.creator?.full_name || 'Unknown'}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {session.creator_type}
                  </Badge>
                </div>

                {/* Cost info */}
                {(session.cost_per_person_tokens > 0 || session.cost_per_person_money > 0) && (
                  <div className="flex items-center gap-2 mb-4 p-2 bg-tennis-green-bg/30 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-tennis-green-primary" />
                    <span className="text-sm">
                      Cost: {session.cost_per_person_tokens > 0 && `${session.cost_per_person_tokens} tokens`}
                      {session.cost_per_person_tokens > 0 && session.cost_per_person_money > 0 && ' + '}
                      {session.cost_per_person_money > 0 && `$${session.cost_per_person_money}`}
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewSession(session)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>

                  {canJoin && (
                    <Button 
                      size="sm"
                      onClick={() => handleJoinSession(session.id)}
                      disabled={joiningSession === session.id}
                      className="flex items-center gap-2"
                    >
                      {joiningSession === session.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                      Join Session
                    </Button>
                  )}

                  {isUserJoined && (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeaveSession(session.id)}
                      disabled={joiningSession === session.id}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      {joiningSession === session.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <UserX className="h-4 w-4" />
                      )}
                      Leave
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Session Details Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedSession && getSessionTypeIcon(selectedSession.session_type)}</span>
              {selectedSession?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Session Details</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Date:</strong> {getSessionDateTime(selectedSession)}</p>
                  <p><strong>Duration:</strong> {selectedSession.duration_minutes} minutes</p>
                  <p><strong>Skill Level:</strong> {getSkillLevelDisplay(selectedSession.skill_level_min, selectedSession.skill_level_max)}</p>
                  {selectedSession.court && (
                    <p><strong>Court:</strong> {selectedSession.court.name} ({selectedSession.court.surface_type})</p>
                  )}
                  {selectedSession.session_notes && (
                    <p><strong>Notes:</strong> {selectedSession.session_notes}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Participants ({participants.length}/{selectedSession.max_participants})</h4>
                {loadingParticipants ? (
                  <div className="flex items-center gap-2 p-3">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm">Loading participants...</span>
                  </div>
                ) : participants.length > 0 ? (
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.user?.avatar_url} />
                          <AvatarFallback className="text-xs bg-tennis-green-primary text-white">
                            {participant.user?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{participant.user?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {formatDistanceToNow(new Date(participant.joined_at), { addSuffix: true })}
                          </p>
                        </div>
                        {participant.role !== 'participant' && (
                          <Badge variant="outline" className="text-xs">
                            {participant.role}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No participants yet</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}