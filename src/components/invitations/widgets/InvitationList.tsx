import React from 'react';
import { Users } from 'lucide-react';
import { InvitationCard } from '../InvitationCard';
import { PendingInvitationCard } from '../PendingInvitationCard';
import type { UnifiedInvitation } from '@/types/invitation';

interface InvitationListProps {
  invitations: UnifiedInvitation[];
  category: 'match' | 'social_play';
  variant: 'received' | 'sent';
  categoryName: string;
}

export const InvitationList: React.FC<InvitationListProps> = ({
  invitations,
  category,
  variant,
  categoryName
}) => {
  if (invitations.length === 0) return null;

  const getCategoryColor = () => {
    if (category === 'match') {
      return variant === 'received' 
        ? 'text-hsl(var(--tennis-green-accent))'
        : 'text-hsl(var(--tennis-yellow))';
    }
    return variant === 'received'
      ? 'text-hsl(var(--tennis-green-medium))'
      : 'text-hsl(var(--tennis-yellow-dark))';
  };

  return (
    <div className="space-y-2">
      <div className={`flex items-center gap-2 text-sm font-medium ${getCategoryColor()}`}>
        <Users className="h-4 w-4" />
        {categoryName} ({invitations.length})
      </div>
      {invitations.map((invitation) => (
        variant === 'received' ? (
          <InvitationCard
            key={invitation.id}
            invitation={invitation}
          />
        ) : (
          <PendingInvitationCard
            key={invitation.id}
            invitation={invitation}
          />
        )
      ))}
    </div>
  );
};