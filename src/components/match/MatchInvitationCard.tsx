
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, MessageCircle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { MatchInvitation } from '@/types/match-invitations';

interface MatchInvitationCardProps {
  invitation: MatchInvitation;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  isCurrentUser: boolean;
  isOutgoing?: boolean;
}

export const MatchInvitationCard: React.FC<MatchInvitationCardProps> = ({
  invitation,
  onAccept,
  onDecline,
  isCurrentUser,
  isOutgoing = false
}) => {
  const isExpired = new Date(invitation.expires_at) < new Date();
  const timeRemaining = Math.max(0, Math.floor((new Date(invitation.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60)));

  const getStatusBadge = () => {
    if (isExpired && invitation.status === 'pending') {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    switch (invitation.status) {
      case 'accepted':
        return (
          <Badge variant="default" className="bg-green-500 text-white flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Accepted
          </Badge>
        );
      case 'declined':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Declined
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {isOutgoing ? `${timeRemaining}h left` : `${timeRemaining}h left`}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Unknown
          </Badge>
        );
    }
  };

  const getCardTitle = () => {
    if (isOutgoing) {
      return `Invitation to ${invitation.invitee_name}`;
    }
    return 'Match Invitation';
  };

  const getFromToLabel = () => {
    if (isOutgoing) {
      return {
        label: 'To:',
        name: invitation.invitee_name
      };
    }
    return {
      label: 'From:',
      name: invitation.inviter_name
    };
  };

  const fromTo = getFromToLabel();

  return (
    <Card className="border-tennis-green-light bg-gradient-to-r from-tennis-green-light/5 to-tennis-green-dark/5">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-tennis-green-dark" />
              <span className="font-medium text-tennis-green-dark">
                {getCardTitle()}
              </span>
            </div>
            {getStatusBadge()}
          </div>

          {/* Details */}
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-600">{fromTo.label}</span>
              <span className="ml-2 font-medium">{fromTo.name}</span>
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

            {/* Status message for outgoing invitations */}
            {isOutgoing && (
              <div className="text-xs text-gray-500">
                {invitation.status === 'pending' && !isExpired && 'Waiting for response...'}
                {invitation.status === 'accepted' && 'Great! Your opponent accepted the invitation.'}
                {invitation.status === 'declined' && 'Your opponent declined this invitation.'}
                {isExpired && invitation.status === 'pending' && 'This invitation has expired.'}
              </div>
            )}
          </div>

          {/* Actions - only for incoming invitations that are pending and not expired */}
          {isCurrentUser && !isOutgoing && invitation.status === 'pending' && !isExpired && (
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

          {/* Info message for expired or completed invitations */}
          {(isExpired || invitation.status !== 'pending') && !isOutgoing && (
            <div className="text-center text-sm text-gray-500">
              {isExpired && invitation.status === 'pending' && 'This invitation has expired'}
              {invitation.status === 'accepted' && 'You accepted this invitation'}
              {invitation.status === 'declined' && 'You declined this invitation'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
