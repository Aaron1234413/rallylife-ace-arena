
import React from 'react';
import { PendingInvitationCard as UnifiedPendingInvitationCard } from '@/components/invitations/PendingInvitationCard';

interface PendingInvitationCardProps {
  invitation: {
    id: string;
    inviter_id: string;
    invitee_name: string;
    invitation_type: string;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    message?: string;
    created_at: string;
    expires_at: string;
  };
}

// Backward compatibility wrapper for match PendingInvitationCard
export const PendingInvitationCard: React.FC<PendingInvitationCardProps> = ({ invitation }) => {
  // Convert old format to new unified format
  const unifiedInvitation = {
    ...invitation,
    invitation_category: 'match' as const,
    session_data: {}
  };

  return <UnifiedPendingInvitationCard invitation={unifiedInvitation} />;
};
