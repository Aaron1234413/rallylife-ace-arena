export interface UnifiedInvitation {
  id: string;
  inviter_id: string;
  invitee_name: string;
  invitation_type: string;
  invitation_category: 'match' | 'social_play';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  created_at: string;
  expires_at: string;
  session_data?: Record<string, any>;
}

export interface InvitationCardProps {
  invitation: UnifiedInvitation;
}

export interface InvitationStats {
  totalReceived: number;
  totalSent: number;
  matchInvitations: {
    received: UnifiedInvitation[];
    sent: UnifiedInvitation[];
  };
  socialPlayInvitations: {
    received: UnifiedInvitation[];
    sent: UnifiedInvitation[];
  };
}

export type InvitationAction = 'accept' | 'decline' | 'cancel';