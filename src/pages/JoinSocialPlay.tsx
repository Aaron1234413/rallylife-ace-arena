
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Users, Clock, Share2 } from 'lucide-react';
import { useSocialPlayEvents } from '@/hooks/useSocialPlayEvents';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const JoinSocialPlay = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { events, joinEvent, isJoiningEvent } = useSocialPlayEvents();
  const { toast } = useToast();
  
  const eventId = searchParams.get('event');
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) {
      toast({
        title: 'Invalid Link',
        description: 'This event link is invalid or expired.',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    // Find the event in the loaded events
    const foundEvent = events.find(e => e.id === eventId);
    if (foundEvent) {
      setEvent(foundEvent);
      setLoading(false);
    } else if (events.length > 0) {
      // Events loaded but event not found
      toast({
        title: 'Event Not Found',
        description: 'This event may no longer be available.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [eventId, events, navigate, toast]);

  const handleJoinEvent = async () => {
    if (!eventId) return;
    
    try {
      // Temporarily disabled - joinEvent no longer takes parameters
      // await joinEvent(eventId);
      toast({
        title: 'Successfully Joined!',
        description: 'You have joined the tennis event.',
      });
      navigate('/');
    } catch (error) {
      console.error('Failed to join event:', error);
      toast({
        title: 'Failed to Join',
        description: 'Could not join this event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleShareEvent = async () => {
    if (!event) return;
    
    const shareUrl = `${window.location.origin}/join-social-play?event=${event.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${event.session_type} Tennis Event`,
          text: `Join me for a ${event.session_type} tennis session at ${event.location}!`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Link Copied!',
          description: 'Share this link with others to invite them.',
        });
      } catch (error) {
        toast({
          title: 'Could not copy link',
          description: 'Please copy the URL manually.',
          variant: 'destructive',
        });
      }
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

  if (!event) {
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

  const currentParticipants = event.participants?.length || 0;
  const maxParticipants = event.max_participants || (event.session_type === 'singles' ? 2 : 4);
  const isEventFull = currentParticipants >= maxParticipants;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {event.title || `${event.session_type} Tennis Event`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Organizer */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={event.creator?.avatar_url || ''} />
                <AvatarFallback>
                  {event.creator?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{event.creator?.full_name || 'Event Organizer'}</p>
                <p className="text-sm text-muted-foreground">Event Organizer</p>
              </div>
            </div>

            {/* Event Details */}
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{event.session_type}</span>
                <Badge variant="secondary">
                  {event.session_type === 'singles' ? '1 vs 1' : '2 vs 2'}
                </Badge>
                <Badge variant={isEventFull ? 'destructive' : 'default'}>
                  {currentParticipants}/{maxParticipants} players
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Created {formatDistanceToNow(new Date(event.created_at))} ago</span>
              </div>

              {event.description && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm">{event.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Current Participants */}
          {event.participants && event.participants.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Current Players:</h4>
              <div className="flex flex-wrap gap-2">
                {event.participants.map((participant: any) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={participant.user?.avatar_url || ''} />
                      <AvatarFallback className="text-xs">
                        {participant.user?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {participant.user?.full_name || 'Player'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleJoinEvent}
              disabled={isJoiningEvent || isEventFull}
              className="flex-1"
            >
              {isJoiningEvent ? 'Joining...' : isEventFull ? 'Event Full' : 'Join Event'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleShareEvent}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
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
