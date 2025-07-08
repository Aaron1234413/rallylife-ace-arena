import React, { useState, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { CreateSocialPlayDialog } from '@/components/social-play/CreateSocialPlayDialog';
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
  creator?: {
    full_name: string;
  };
}

export function SessionManagement({ clubId }: SessionManagementProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [sessions, setSessions] = useState<UnifiedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningStates, setJoiningStates] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch club sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('sessions')
          .select(`
            *,
            profiles:creator_id (
              full_name
            )
          `)
          .eq('club_id', clubId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setSessions(data || []);
      } catch (error) {
        console.error('Error fetching club sessions:', error);
        toast.error('Failed to load club sessions');
      } finally {
        setLoading(false);
      }
    };

    if (clubId) {
      fetchSessions();
    }
  }, [clubId]);

  const handleJoinSession = async (sessionId: string) => {
    setJoiningStates(prev => ({ ...prev, [sessionId]: true }));
    try {
      // For now, just show a success message
      // TODO: Implement actual join logic with session_participants table
      toast.success('Join session functionality coming soon!');
    } catch (error) {
      console.error('Failed to join session:', error);
      toast.error('Failed to join session');
    } finally {
      setJoiningStates(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const handleCreateSession = (sessionType: string) => {
    navigate(`/sessions/create?type=${sessionType}`);
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
              <Calendar className="h-5 w-5 text-tennis-green-primary" />
              Club Sessions
            </CardTitle>
            <Button
              onClick={() => handleCreateSession('match')}
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
                            {session.session_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Session
                          </h3>
                          <p className="text-sm text-tennis-green-medium">
                            Created by {session.creator?.full_name || 'Unknown'}
                          </p>
                        </div>
                        <Badge className={getSessionTypeColor(session.session_type)}>
                          {session.session_type.replace('_', ' ')}
                        </Badge>
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
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-tennis-green-medium" />
                          <span className="text-sm text-tennis-green-medium">
                            0/{session.max_players} participants
                          </span>
                          <Badge variant="default" className="text-xs">
                            Open
                          </Badge>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleJoinSession(session.id)}
                          disabled={isJoining}
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
                onClick={() => handleCreateSession('match')}
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

      {/* Dialog removed - now using direct navigation to session creation */}
    </>
  );
}