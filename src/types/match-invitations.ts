
export interface MatchInvitation {
  id: string;
  match_session_id: string;
  inviter_id: string;
  invitee_id: string;
  invitee_email?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  expires_at: string;
  created_at: string;
  updated_at: string;
  inviter_name?: string;
  invitee_name?: string;
  session_opponent_name?: string;
}

export interface MatchParticipant {
  id: string;
  match_session_id: string;
  user_id: string;
  joined_at: string;
  user_name?: string;
}

export interface SendInvitationParams {
  sessionId: string;
  inviteeId?: string;
  inviteeEmail?: string;
  message?: string;
}
