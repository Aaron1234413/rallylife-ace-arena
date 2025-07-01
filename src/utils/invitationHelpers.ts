import type { UnifiedInvitation, InvitationStats } from '@/types/invitation';

export const groupInvitationsByCategory = (
  receivedInvitations: UnifiedInvitation[],
  sentInvitations: UnifiedInvitation[]
): InvitationStats => {
  const matchInvitations = {
    received: receivedInvitations.filter(inv => inv.invitation_category === 'match'),
    sent: sentInvitations.filter(inv => inv.invitation_category === 'match')
  };

  const socialPlayInvitations = {
    received: receivedInvitations.filter(inv => inv.invitation_category === 'social_play'),
    sent: sentInvitations.filter(inv => inv.invitation_category === 'social_play')
  };

  return {
    totalReceived: receivedInvitations.length,
    totalSent: sentInvitations.length,
    matchInvitations,
    socialPlayInvitations
  };
};

export const isInvitationExpired = (invitation: UnifiedInvitation): boolean => {
  return new Date() > new Date(invitation.expires_at);
};

export const formatInvitationTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatInvitationDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};