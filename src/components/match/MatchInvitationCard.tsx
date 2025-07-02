
import React from 'react';
import { InvitationCard } from '@/components/invitations/InvitationCard';

interface MatchInvitationCardProps {
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

// Backward compatibility wrapper for MatchInvitationCard
export const MatchInvitationCard: React.FC<MatchInvitationCardProps> = ({ invitation }) => {
  // Convert old format to new unified format
  const unifiedInvitation = {
    ...invitation,
    invitation_category: 'match' as const,
    match_session_id: null,
    updated_at: invitation.created_at,
    session_data: {}
  };

  return <InvitationCard invitation={unifiedInvitation} />;
};
