
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Inbox } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMatchInvitations } from '@/hooks/useMatchInvitations';
import { MatchInvitationCard } from './MatchInvitationCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const MatchInvitations: React.FC = () => {
  const { user } = useAuth();
  const { invitations, loading, acceptInvitation, declineInvitation } = useMatchInvitations();

  if (!user || loading) {
    return (
      <Card className="border-tennis-green-light bg-gradient-to-r from-tennis-green-light/5 to-tennis-green-dark/5">
        <CardContent className="flex items-center justify-center py-6">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-gray-600">Loading invitations...</span>
        </CardContent>
      </Card>
    );
  }

  // Filter invitations - only show ones where current user is the invitee
  const receivedInvitations = invitations.filter(inv => inv.invitee_id === user.id);

  if (receivedInvitations.length === 0) {
    return null; // Don't show the component if no invitations
  }

  return (
    <Card className="border-tennis-green-light bg-gradient-to-r from-tennis-green-light/5 to-tennis-green-dark/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-tennis-green-dark" />
            <span className="text-lg font-orbitron font-bold">Match Invitations</span>
          </div>
          {receivedInvitations.length > 0 && (
            <Badge variant="default" className="bg-tennis-green-dark text-white font-orbitron font-medium">
              {receivedInvitations.length} pending
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {receivedInvitations.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No pending invitations</p>
          </div>
        ) : (
          <div className="space-y-3">
            {receivedInvitations.map((invitation) => (
              <MatchInvitationCard
                key={invitation.id}
                invitation={invitation}
                onAccept={acceptInvitation}
                onDecline={declineInvitation}
                isCurrentUser={true}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
