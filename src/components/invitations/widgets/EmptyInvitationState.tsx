import React from 'react';
import { Inbox, MailOpen } from 'lucide-react';

interface EmptyInvitationStateProps {
  variant: 'received' | 'sent';
}

export const EmptyInvitationState: React.FC<EmptyInvitationStateProps> = ({ variant }) => {
  const Icon = variant === 'received' ? Inbox : MailOpen;
  const message = variant === 'received' 
    ? 'No pending invitations'
    : 'No pending sent invitations';

  return (
    <div className="text-center py-8 text-hsl(var(--muted-foreground))">
      <Icon className="h-12 w-12 mx-auto mb-4 text-hsl(var(--muted-foreground)/60)" />
      <p>{message}</p>
    </div>
  );
};