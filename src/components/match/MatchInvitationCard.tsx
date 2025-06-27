
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, MessageCircle } from 'lucide-react';
import type { MatchInvitation } from '@/types/match-invitations';

interface MatchInvitationCardProps {
  invitation: MatchInvitation;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  isCurrentUser: boolean;
}

export const MatchInvitationCard: React.FC<MatchInvitationCardProps> = ({
  invitation,
  onAccept,
  onDecline,
  isCurrentUser
}) => {
  const isExpired = new Date(invitation.expires_at) < new Date();
  const timeRemaining = Math.max(0, Math.floor((new Date(invitation.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60)));

  return (
    <Card className="border-tennis-green-light bg-gradient-to-r from-tennis-green-light/5 to-tennis-green-dark/5">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-tennis-green-dark" />
              <span className="font-medium text-tennis-green-dark">
                Match Invitation
              </span>
            </div>
            {isExpired ? (
              <Badge variant="destructive">Expired</Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeRemaining}h left
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-600">From:</span>
              <span className="ml-2 font-medium">{invitation.inviter_name}</span>
            </div>
            
            {invitation.session_opponent_name && (
              <div className="text-sm">
                <span className="text-gray-600">Match vs:</span>
                <span className="ml-2 font-medium">{invitation.session_opponent_name}</span>
              </div>
            )}

            {invitation.message && (
              <div className="flex items-start gap-2 text-sm bg-gray-50 rounded p-2">
                <MessageCircle className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{invitation.message}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          {isCurrentUser && !isExpired && (
            <div className="flex gap-2">
              <Button
                onClick={() => onAccept(invitation.id)}
                className="flex-1 bg-tennis-green-dark hover:bg-tennis-green text-white"
                size="sm"
              >
                Accept
              </Button>
              <Button
                onClick={() => onDecline(invitation.id)}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                Decline
              </Button>
            </div>
          )}

          {isExpired && (
            <div className="text-center text-sm text-gray-500">
              This invitation has expired
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
