import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserMinus, Crown, Clock } from 'lucide-react';
import { SessionParticipant } from '@/hooks/useUnifiedSessions';
import { useSessionPresence } from '@/hooks/useSessionPresence';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface SessionParticipantsListProps {
  sessionId: string;
  participants: SessionParticipant[];
  creatorId: string;
  onRemoveParticipant?: (participantId: string) => void;
  maxParticipants: number;
}

export function SessionParticipantsList({
  sessionId,
  participants,
  creatorId,
  onRemoveParticipant,
  maxParticipants
}: SessionParticipantsListProps) {
  const { user } = useAuth();
  const { presences, onlineCount, isOnline } = useSessionPresence(sessionId);

  const canManageParticipants = user?.id === creatorId;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participants ({participants.length}/{maxParticipants})
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            {onlineCount} online
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {participants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No participants yet</p>
            <p className="text-sm">Be the first to join this session!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {participants.map((participant) => {
              const isCreator = participant.user_id === creatorId;
              const isCurrentUser = participant.user_id === user?.id;
              const userIsOnline = isOnline(participant.user_id);

              return (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card/50"
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={participant.user?.avatar_url} 
                        alt={participant.user?.full_name} 
                      />
                      <AvatarFallback>
                        {participant.user?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {userIsOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {participant.user?.full_name || 'Unknown User'}
                      </p>
                      {isCreator && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge 
                        variant={participant.payment_status === 'paid' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {participant.payment_status}
                      </Badge>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Joined {format(new Date(participant.joined_at), 'MMM dd, HH:mm')}
                      </div>
                      
                      {participant.tokens_paid > 0 && (
                        <span className="text-yellow-600 font-medium">
                          {participant.tokens_paid}T paid
                        </span>
                      )}
                    </div>
                  </div>

                  {canManageParticipants && !isCreator && onRemoveParticipant && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveParticipant(participant.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Session Status */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {maxParticipants - participants.length} spots remaining
            </span>
            <Badge 
              variant={participants.length >= maxParticipants ? 'destructive' : 'default'}
            >
              {participants.length >= maxParticipants ? 'Full' : 'Open'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}