import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Users, 
  Clock, 
  Plus,
  Play,
  MapPin,
  Trophy,
  Coins,
  Loader2
} from 'lucide-react';
import { useOpenSessions } from '@/hooks/useOpenSessions';
import { format } from 'date-fns';
import { CreateSocialPlayDialog } from '@/components/social-play/CreateSocialPlayDialog';
import { toast } from 'sonner';

interface SessionManagementProps {
  clubId: string;
}

export function SessionManagement({ clubId }: SessionManagementProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Use real session data
  const { 
    sessions, 
    loading, 
    creating,
    joinSession, 
    leaveSession,
    hasUserJoinedSession 
  } = useOpenSessions(clubId);

  const [joiningStates, setJoiningStates] = useState<Record<string, boolean>>({});

  const handleJoinSession = async (sessionId: string) => {
    setJoiningStates(prev => ({ ...prev, [sessionId]: true }));
    try {
      const success = await joinSession(sessionId);
      if (success) {
        toast.success('Successfully joined session!');
      }
    } catch (error) {
      console.error('Failed to join session:', error);
    } finally {
      setJoiningStates(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const handleCreateSession = () => {
    setShowCreateDialog(false);
    toast.success('Session creation flow integrated with club!');
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'tournament': return 'bg-red-100 text-red-800';
      case 'lesson': return 'bg-blue-100 text-blue-800';
      case 'practice': return 'bg-green-100 text-green-800';
      case 'casual': return 'bg-purple-100 text-purple-800';
      case 'clinic': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'tournament': return Trophy;
      case 'lesson': return Users;
      case 'practice': return Play;
      case 'casual': return Users;
      case 'clinic': return Trophy;
      default: return Calendar;
    }
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
              <Calendar className="h-5 w-5 text-tennis-green-primary" />
              Club Sessions
            </CardTitle>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Session
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-tennis-green-primary" />
              <span className="ml-2 text-tennis-green-medium">Loading sessions...</span>
            </div>
          ) : sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => {
                const IconComponent = getSessionIcon(session.session_type);
                const isJoining = joiningStates[session.id] || false;
                
                return (
                  <div
                    key={session.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="w-12 h-12 bg-tennis-green-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-tennis-green-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-tennis-green-dark">
                            {session.title}
                          </h3>
                          <p className="text-sm text-tennis-green-medium">
                            Created by {session.creator?.full_name || 'Unknown'}
                          </p>
                        </div>
                        <Badge className={getSessionTypeColor(session.session_type)}>
                          {session.session_type}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-tennis-green-medium flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(session.scheduled_date), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {session.start_time} - {session.end_time}
                        </div>
                        {session.court?.name && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {session.court.name}
                          </div>
                        )}
                      </div>

                      {/* Cost Display */}
                      {(session.cost_per_person_tokens > 0 || session.cost_per_person_money > 0) && (
                        <div className="flex items-center gap-2 text-sm text-yellow-600">
                          <Coins className="h-4 w-4" />
                          <span>
                            {session.cost_per_person_tokens > 0 && `${session.cost_per_person_tokens} tokens`}
                            {session.cost_per_person_tokens > 0 && session.cost_per_person_money > 0 && ' + '}
                            {session.cost_per_person_money > 0 && `$${session.cost_per_person_money}`}
                          </span>
                        </div>
                      )}

                      {session.description && (
                        <p className="text-sm text-tennis-green-medium italic">
                          {session.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-tennis-green-medium" />
                          <span className="text-sm text-tennis-green-medium">
                            {session.current_participants}/{session.max_participants} participants
                          </span>
                          <Badge 
                            variant={session.status === 'open' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {session.status}
                          </Badge>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleJoinSession(session.id)}
                          disabled={isJoining || session.status !== 'open' || session.current_participants >= session.max_participants}
                        >
                          {isJoining ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              Joining...
                            </>
                          ) : (
                            'Join Session'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-tennis-green-medium/50" />
              <p className="text-tennis-green-medium">
                No upcoming sessions
              </p>
              <p className="text-sm text-tennis-green-medium/70 mb-4">
                Be the first to create a session for your club!
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create First Session
              </Button>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-tennis-green-bg/50">
            <div className="text-center">
              <div className="text-lg font-bold text-tennis-green-dark">3</div>
              <div className="text-xs text-tennis-green-medium">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-tennis-green-dark">24</div>
              <div className="text-xs text-tennis-green-medium">Total Participants</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-tennis-green-dark">42</div>
              <div className="text-xs text-tennis-green-medium">Available Spots</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateSocialPlayDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onEventCreated={handleCreateSession}
      />
    </>
  );
}