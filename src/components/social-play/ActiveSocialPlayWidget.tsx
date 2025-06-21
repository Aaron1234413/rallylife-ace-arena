
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Share2, MapPin } from 'lucide-react';
import { useSocialPlayEvents } from '@/hooks/useSocialPlayEvents';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export const ActiveSocialPlayWidget = () => {
  const { events, isLoading } = useSocialPlayEvents();
  const { toast } = useToast();
  
  // Show recent events for easy sharing
  const recentEvents = events?.slice(0, 3) || [];

  const handleShareEvent = async (event: any) => {
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

  if (isLoading) {
    return (
      <Card className="border-purple-200 bg-purple-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading events...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recentEvents.length === 0) {
    return null;
  }

  return (
    <Card className="border-purple-200 bg-purple-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          Your Social Events
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {recentEvents.map((event) => {
          const currentParticipants = event.participants?.length || 0;
          const maxParticipants = event.max_participants || (event.session_type === 'singles' ? 2 : 4);
          
          return (
            <div
              key={event.id}
              className="bg-white rounded-lg p-4 border shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">
                      {event.title || `${event.session_type} Event`}
                    </h4>
                    <Badge variant="outline" className="capitalize">
                      {event.session_type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Created {formatDistanceToNow(new Date(event.created_at))} ago
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {currentParticipants}/{maxParticipants} players
                    </div>
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleShareEvent(event)}
                  className="flex items-center gap-1"
                >
                  <Share2 className="h-3 w-3" />
                  Share Link
                </Button>
                <Badge 
                  variant={currentParticipants >= maxParticipants ? 'destructive' : 'secondary'}
                  className="px-2 py-1"
                >
                  {currentParticipants >= maxParticipants ? 'Full' : 'Open'}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
