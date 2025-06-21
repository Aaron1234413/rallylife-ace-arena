
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useSocialPlaySession } from '@/contexts/SocialPlaySessionContext';
import { useToast } from '@/hooks/use-toast';

const JoinSocialPlay = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { joinEvent, loading: joiningEvent } = useSocialPlaySession();
  const { toast } = useToast();
  
  const sessionId = searchParams.get('session');
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      toast({
        title: 'Invalid Link',
        description: 'This social play link is invalid or expired.',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    // Mock session data for now - in Phase 2 we'll load real data
    setSessionData({
      id: sessionId,
      session_type: 'singles',
      location: 'Central Park Tennis Courts',
      created_at: new Date().toISOString(),
      creator: {
        full_name: 'John Doe',
        avatar_url: null
      }
    });
    setLoading(false);
  }, [sessionId, navigate, toast]);

  const handleJoinSession = async () => {
    if (!sessionId) return;
    
    try {
      await joinEvent(sessionId);
      navigate('/');
    } catch (error) {
      console.error('Failed to join session:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Event not found or no longer available.</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Join Social Tennis Event
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Session Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={sessionData.creator?.avatar_url || ''} />
                <AvatarFallback>
                  {sessionData.creator?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{sessionData.creator?.full_name}</p>
                <p className="text-sm text-muted-foreground">Event Organizer</p>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{sessionData.session_type}</span>
                <Badge variant="secondary">
                  {sessionData.session_type === 'singles' ? '1 vs 1' : '2 vs 2'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{sessionData.location}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(sessionData.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Join Button */}
          <div className="flex gap-3">
            <Button 
              onClick={handleJoinSession}
              disabled={joiningEvent}
              className="flex-1"
            >
              {joiningEvent ? 'Joining...' : 'Join Event'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinSocialPlay;
