
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, MapPin, Clock, UserPlus, AlertCircle } from 'lucide-react';
import { useSocialPlaySession } from '@/contexts/SocialPlaySessionContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SessionDetails {
  id: string;
  session_type: 'singles' | 'doubles';
  competitive_level: 'low' | 'medium' | 'high';
  status: string;
  location: string | null;
  created_at: string;
  created_by: string;
  participants: Array<{
    id: string;
    user_id: string;
    status: string;
    user?: {
      full_name: string;
      avatar_url: string | null;
    };
  }>;
}

const JoinSocialPlay = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('id');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinSession } = useSocialPlaySession();
  
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    loadSessionDetails();
  }, [sessionId]);

  const loadSessionDetails = async () => {
    if (!sessionId) return;

    try {
      const { data: session, error: sessionError } = await supabase
        .from('social_play_sessions')
        .select(`
          *,
          participants:social_play_participants(
            *,
            user:profiles!social_play_participants_user_id_fkey(id, full_name, avatar_url)
          )
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        setError('Session not found or access denied');
        return;
      }

      setSessionDetails(session as SessionDetails);
    } catch (error) {
      console.error('Failed to load session details:', error);
      setError('Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!sessionId || !user?.id) return;

    setJoining(true);
    try {
      await joinSession(sessionId);
      toast.success('Successfully joined the session!');
      navigate('/');
    } catch (error: any) {
      console.error('Failed to join session:', error);
      toast.error(error.message || 'Failed to join session');
    } finally {
      setJoining(false);
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

  const getCompetitiveLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-green-100 text-green-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>Loading session details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !sessionDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Session Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'The session you\'re looking for doesn\'t exist or you don\'t have access to it.'}
            </p>
            <Button onClick={() => navigate('/')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is already a participant
  const existingParticipant = sessionDetails.participants.find(p => p.user_id === user?.id);
  const isAlreadyParticipant = !!existingParticipant;
  const activeParticipants = sessionDetails.participants.filter(p => p.status === 'joined' || p.status === 'accepted');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl">Join Social Play Session</CardTitle>
            <p className="text-muted-foreground mt-2">
              You've been invited to join a social tennis session!
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Session Details */}
            <div className="bg-purple-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="bg-white">
                  {sessionDetails.session_type === 'singles' ? 'Singles' : 'Doubles'}
                </Badge>
                <Badge variant="outline" className={`${getCompetitiveLevelColor(sessionDetails.competitive_level)} border-0`}>
                  {getCompetitiveLevelText(sessionDetails.competitive_level)}
                </Badge>
                <Badge variant="outline" className="bg-white">
                  {activeParticipants.length + 1} players
                </Badge>
              </div>

              {sessionDetails.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {sessionDetails.location}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Created {new Date(sessionDetails.created_at).toLocaleDateString()}
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Current Players</h4>
              <div className="flex flex-wrap gap-2">
                {sessionDetails.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 border">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={participant.user?.avatar_url || ''} />
                      <AvatarFallback className="text-xs bg-gray-200">
                        {participant.user?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{participant.user?.full_name || 'Unknown'}</span>
                    {participant.status === 'invited' && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-4">Invited</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {isAlreadyParticipant ? (
                <div className="w-full text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    You're already part of this session!
                  </p>
                  <Button
                    onClick={() => navigate('/')}
                    className="w-full"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    onClick={handleJoinSession}
                    disabled={joining || sessionDetails.status !== 'pending'}
                    className="flex-1"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {joining ? 'Joining...' : 'Join Session'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    disabled={joining}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>

            {sessionDetails.status !== 'pending' && !isAlreadyParticipant && (
              <p className="text-sm text-muted-foreground text-center">
                This session is no longer accepting new participants.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinSocialPlay;
