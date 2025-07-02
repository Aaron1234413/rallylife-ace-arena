export interface UnifiedInvitation {
  id: string;
  inviter_id: string;
  invitee_id?: string;
  invitee_name: string;
  invitee_email?: string;
  invitation_type: string;
  invitation_category: 'match' | 'social_play';
  match_session_id: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  created_at: string;
  expires_at: string;
  responded_at?: string;
  updated_at: string;
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