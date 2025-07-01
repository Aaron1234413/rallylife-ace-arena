import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Users } from 'lucide-react';
import type { UnifiedInvitation } from '@/types/invitation';

interface InvitationHeaderProps {
  invitation: UnifiedInvitation;
  variant: 'received' | 'sent';
}

export const InvitationHeader: React.FC<InvitationHeaderProps> = ({ invitation, variant }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getHeaderTitle = () => {
    const action = variant === 'received' ? 'Invitation' : 'Pending Invitation';
    return invitation.invitation_category === 'match' 
      ? `Match ${action}` 
      : `Social Play ${action}`;
  };

  const getIconColor = () => {
    if (invitation.invitation_category === 'match') {
      return variant === 'received' ? 'text-hsl(var(--tennis-green-accent))' : 'text-hsl(var(--tennis-yellow))';
    }
    return variant === 'received' ? 'text-hsl(var(--tennis-green-medium))' : 'text-hsl(var(--tennis-yellow-dark))';
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Users className={`h-5 w-5 ${getIconColor()}`} />
        <span className="text-lg font-medium">{getHeaderTitle()}</span>
      </div>
      <Badge variant="outline" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {formatTime(invitation.created_at)}
      </Badge>
    </div>
  );
};