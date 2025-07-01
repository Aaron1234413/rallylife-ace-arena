import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, MessageCircle } from 'lucide-react';
import type { UnifiedInvitation } from '@/types/invitation';

interface InvitationDetailsProps {
  invitation: UnifiedInvitation;
}

export const InvitationDetails: React.FC<InvitationDetailsProps> = ({ invitation }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const isExpired = new Date() > new Date(invitation.expires_at);

  const getInvitationTitle = () => {
    if (invitation.invitation_category === 'match') {
      return invitation.invitation_type === 'singles' ? 'Singles Match' : 'Doubles Match';
    }
    return invitation.session_data?.eventTitle || 'Social Play Event';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-hsl(var(--tennis-green-dark))">
            {getInvitationTitle()}
          </h4>
          <p className="text-sm text-hsl(var(--muted-foreground))">
            From {invitation.invitee_name}
          </p>
        </div>
        <Badge 
          variant={isExpired ? 'destructive' : 'secondary'}
          className="capitalize"
        >
          {isExpired ? 'Expired' : invitation.status}
        </Badge>
      </div>

      {/* Social play specific details */}
      {invitation.invitation_category === 'social_play' && invitation.session_data && (
        <div className="space-y-2">
          {invitation.session_data.location && (
            <div className="flex items-center gap-2 text-sm text-hsl(var(--muted-foreground))">
              <MapPin className="h-4 w-4" />
              {invitation.session_data.location}
            </div>
          )}
          {invitation.session_data.scheduledTime && (
            <div className="flex items-center gap-2 text-sm text-hsl(var(--muted-foreground))">
              <Calendar className="h-4 w-4" />
              {formatDate(invitation.session_data.scheduledTime)} at {formatTime(invitation.session_data.scheduledTime)}
            </div>
          )}
          {invitation.session_data.description && (
            <p className="text-sm text-hsl(var(--muted-foreground))">
              {invitation.session_data.description}
            </p>
          )}
        </div>
      )}

      {/* Match specific details */}
      {invitation.invitation_category === 'match' && invitation.session_data && (
        <div className="space-y-2">
          {invitation.session_data.startTime && (
            <div className="flex items-center gap-2 text-sm text-hsl(var(--muted-foreground))">
              <Calendar className="h-4 w-4" />
              Proposed: {formatDate(invitation.session_data.startTime)} at {formatTime(invitation.session_data.startTime)}
            </div>
          )}
        </div>
      )}

      {invitation.message && (
        <div className="bg-hsl(var(--muted)) rounded p-3">
          <div className="flex items-start gap-2">
            <MessageCircle className="h-4 w-4 text-hsl(var(--muted-foreground)) mt-0.5" />
            <p className="text-sm text-hsl(var(--muted-foreground))">{invitation.message}</p>
          </div>
        </div>
      )}

      <div className="text-xs text-hsl(var(--muted-foreground))">
        Expires: {formatTime(invitation.expires_at)}
      </div>
    </div>
  );
};