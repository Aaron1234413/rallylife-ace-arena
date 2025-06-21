
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Users, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ShareLinkGenerator } from './ShareLinkGenerator';

interface PublicEventCardProps {
  event: {
    id: string;
    title?: string;
    session_type: 'singles' | 'doubles';
    location?: string;
    created_at: string;
    max_participants?: number;
    creator?: {
      id: string;
      full_name: string;
      avatar_url?: string | null;
    };
    participants?: Array<{
      id: string;
      user_id: string;
      user?: {
        id: string;
        full_name: string;
        avatar_url?: string | null;
      };
    }>;
  };
  onJoin?: () => void;
  onShare?: () => void;
  isJoining?: boolean;
  showShareOptions?: boolean;
  isPreview?: boolean;
}

export const PublicEventCard: React.FC<PublicEventCardProps> = ({
  event,
  onJoin,
  onShare,
  isJoining = false,
  showShareOptions = false,
  isPreview = false,
}) => {
  const currentParticipants = event.participants?.length || 0;
  const maxParticipants = event.max_participants || (event.session_type === 'singles' ? 2 : 4);
  const isEventFull = currentParticipants >= maxParticipants;
  const spotsLeft = maxParticipants - currentParticipants;

  return (
    <Card className={`${isPreview ? 'border-2 border-dashed border-gray-300' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {event.title || `${event.session_type} Tennis Event`}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {event.session_type}
              </Badge>
              <Badge variant={isEventFull ? 'destructive' : 'secondary'}>
                {isEventFull ? 'Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
              </Badge>
            </div>
          </div>
          
          {event.creator && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={event.creator.avatar_url || ''} />
                <AvatarFallback>
                  {event.creator.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-sm font-medium">{event.creator.full_name}</p>
                <p className="text-xs text-muted-foreground">Organizer</p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Event Details */}
        <div className="grid gap-3">
          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Created {formatDistanceToNow(new Date(event.created_at))} ago</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{currentParticipants}/{maxParticipants} players joined</span>
          </div>
        </div>

        {/* Current Participants */}
        {event.participants && event.participants.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Players:</h4>
            <div className="flex flex-wrap gap-2">
              {event.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1"
                >
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={participant.user?.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {participant.user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">
                    {participant.user?.full_name || 'Player'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {onJoin && !isPreview && (
            <Button
              onClick={onJoin}
              disabled={isJoining || isEventFull}
              className="flex-1"
            >
              {isJoining ? 'Joining...' : isEventFull ? 'Event Full' : 'Join Event'}
            </Button>
          )}
          
          {showShareOptions && (
            <ShareLinkGenerator event={event} compact />
          )}
        </div>

        {/* Share Options (Full) */}
        {showShareOptions && !isPreview && (
          <ShareLinkGenerator event={event} />
        )}

        {isPreview && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              This is how your event will appear to others
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
