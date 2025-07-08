import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Calendar, 
  Users, 
  Clock, 
  Plus,
  Play,
  MapPin,
  Trophy,
  Coins,
  Loader2,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { CreateSocialPlayDialog } from '@/components/social-play/CreateSocialPlayDialog';
import { SessionParticipantsList } from '../sessions/SessionParticipantsList';
import { useUnifiedSessions } from '@/hooks/useUnifiedSessions';
import { toast } from 'sonner';

interface SessionManagementProps {
  clubId: string;
}

interface UnifiedSession {
  id: string;
  creator_id: string;
  session_type: string;
  format?: string;
  max_players: number;
  stakes_amount: number;
  location: string;
  notes?: string;
  is_private: boolean;
  invitation_code?: string;
  club_id?: string;
  session_source?: string;
  created_at: string;
  updated_at: string;
  participant_count?: number;
  creator?: {
    full_name: string;
  };
}

export function SessionManagement({ clubId }: SessionManagementProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<UnifiedSession | null>(null);
  const [showSocialPlayDialog, setShowSocialPlayDialog] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use unified sessions hook for real-time updates
  const {
    sessions,
    loading,
    joinSession,
    leaveSession,
    getSessionParticipants,
    cancelSession
  } = useUnifiedSessions({
    clubId,
    includeNonClubSessions: false
  });

  const [joiningStates, setJoiningStates] = useState<Record<string, boolean>>({});
  const [deletingStates, setDeletingStates] = useState<Record<string, boolean>>({});

  // Sessions are now managed by useUnifiedSessions hook with real-time updates

  const handleJoinSession = async (sessionId: string) => {
    setJoiningStates(prev => ({ ...prev, [sessionId]: true }));
    try {
      await joinSession(sessionId);
    } finally {
      setJoiningStates(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const handleViewSessionDetails = (session: UnifiedSession) => {
    setSelectedSession(session);
  };

  const handleDeleteSession = async (sessionId: string) => {
    setDeletingStates(prev => ({ ...prev, [sessionId]: true }));
    try {
      const success = await cancelSession(sessionId);
      if (success) {
        // Sessions will auto-refresh via real-time updates
      }
    } finally {
      setDeletingStates(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from('session_participants')
        .delete()
        .eq('id', participantId);

      if (error) throw error;
      
      toast.success('Participant removed successfully');
      // Sessions will auto-refresh via real-time updates
    } catch (error) {
      console.error('Error removing participant:', error);
      toast.error('Failed to remove participant');
    }
  };

  const handleCreateSession = (sessionType: string) => {
    if (sessionType === 'social_play') {
      setShowSocialPlayDialog(true);
    } else {
      // Navigate to the unified CreateSession page with club context
      navigate(`/club/${clubId}/sessions/create?type=${sessionType}`);
    }
  };

  const handleSessionCreated = () => {
    // Sessions will auto-refresh via real-time updates from useUnifiedSessions
    // Close social play dialog
    setShowSocialPlayDialog(false);
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'match': return 'bg-blue-100 text-blue-800';
      case 'training': return 'bg-green-100 text-green-800';
      case 'social_play': return 'bg-purple-100 text-purple-800';
      case 'wellbeing': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'match': return Trophy;
      case 'training': return Play;
      case 'social_play': return Users;
      case 'wellbeing': return Users;
      default: return Calendar;
    }
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <Calendar className="h-5 w-5 text-tennis-green-primary" />
            Club Sessions
          </CardTitle>
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
                            {session.session_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Session
                          </h3>
                          <p className="text-sm text-tennis-green-medium">
                            Created by {session.creator?.full_name || 'Unknown'}
                            {session.creator_id === user?.id && (
                              <span className="ml-2 text-xs bg-tennis-green-primary/10 text-tennis-green-primary px-2 py-1 rounded">
                                You created this
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSessionTypeColor(session.session_type)}>
                            {session.session_type.replace('_', ' ')}
                          </Badge>
                          {session.creator_id === user?.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  disabled={deletingStates[session.id]}
                                >
                                  {deletingStates[session.id] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Session</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this session? This action cannot be undone.
                                    {session.participant_count && session.participant_count > 0 && (
                                      <span className="block mt-2 text-orange-600 font-medium">
                                        Warning: This session has {session.participant_count} participant(s) who will be notified of the cancellation.
                                      </span>
                                    )}
                                    {session.stakes_amount > 0 && (
                                      <span className="block mt-2 text-blue-600 font-medium">
                                        Stakes will be refunded to participants.
                                      </span>
                                    )}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteSession(session.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Session
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-tennis-green-medium flex-wrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {session.location}
                        </div>
                        {session.format && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {session.format}
                          </div>
                        )}
                      </div>

                      {/* Stakes Display */}
                      {session.stakes_amount > 0 && (
                        <div className="flex items-center gap-2 text-sm text-yellow-600">
                          <Coins className="h-4 w-4" />
                          <span>{session.stakes_amount} tokens per player</span>
                        </div>
                      )}

                      {session.notes && (
                        <p className="text-sm text-tennis-green-medium italic">
                          {session.notes}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-tennis-green-medium" />
                            <span className="text-sm text-tennis-green-medium">
                              {session.participant_count || 0}/{session.max_players} participants
                            </span>
                            <Badge variant="default" className="text-xs">
                              {(session.participant_count || 0) >= session.max_players ? 'Full' : 'Open'}
                            </Badge>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewSessionDetails(session)}
                            >
                              View Details
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleJoinSession(session.id)}
                              disabled={isJoining || (session.participant_count || 0) >= session.max_players}
                            >
                              {isJoining ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  Joining...
                                </>
                              ) : (session.participant_count || 0) >= session.max_players ? (
                                'Session Full'
                              ) : (
                                'Join Session'
                              )}
                            </Button>
                          </div>
                        </div>
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
              <p className="text-sm text-tennis-green-medium/70">
                Be the first to create a session for your club!
              </p>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Social Play Dialog - Only one we keep as dialog */}
      <CreateSocialPlayDialog
        open={showSocialPlayDialog}
        onOpenChange={setShowSocialPlayDialog}
        onEventCreated={handleSessionCreated}
        clubId={clubId}
      />

      {/* Session Details Dialog */}
      {selectedSession && (
        <SessionDetailsDialog
          session={selectedSession}
          open={!!selectedSession}
          onOpenChange={(open) => !open && setSelectedSession(null)}
          onRemoveParticipant={handleRemoveParticipant}
          getSessionParticipants={getSessionParticipants}
        />
      )}
    </>
  );
}

// Session Details Dialog Component
function SessionDetailsDialog({
  session,
  open,
  onOpenChange,
  onRemoveParticipant,
  getSessionParticipants
}: {
  session: UnifiedSession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoveParticipant: (participantId: string) => void;
  getSessionParticipants: (sessionId: string) => Promise<any[]>;
}) {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && session) {
      const loadParticipants = async () => {
        setLoading(true);
        try {
          const data = await getSessionParticipants(session.id);
          setParticipants(data);
        } catch (error) {
          console.error('Error loading participants:', error);
        } finally {
          setLoading(false);
        }
      };
      loadParticipants();
    }
  }, [open, session, getSessionParticipants]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/80" onClick={() => onOpenChange(false)} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Session Details</h2>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>×</Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">{session.session_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Session</h3>
            <p className="text-sm text-gray-600">Created by {session.creator?.full_name}</p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading participants...</span>
            </div>
          ) : (
            <SessionParticipantsList
              sessionId={session.id}
              participants={participants}
              creatorId={session.creator_id}
              onRemoveParticipant={onRemoveParticipant}
              maxParticipants={session.max_players}
            />
          )}
        </div>
      </div>
    </div>
  );
}