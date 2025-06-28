
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

  if (!user) return null;

  if (loading) {
    return (
      <Card className="border-tennis-green-light bg-gradient-to-r from-tennis-green-light/5 to-tennis-green-dark/5">
        <CardContent className="flex items-center justify-center py-6">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-gray-600">Loading invitations...</span>
        </CardContent>
      </Card>
    );
  }

  // Always show the component, but with different states
  const hasInvitations = invitations.length > 0;

  return (
    <Card className="border-tennis-green-light bg-gradient-to-r from-tennis-green-light/5 to-tennis-green-dark/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-tennis-green-dark" />
            <span className="text-lg font-orbitron font-bold">Match Invitations</span>
          </div>
          {hasInvitations && (
            <Badge variant="default" className="bg-tennis-green-dark text-white font-orbitron font-medium">
              {invitations.length} pending
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {hasInvitations ? (
          invitations.map((invitation) => (
            <MatchInvitationCard
              key={invitation.id}
              invitation={invitation}
              onAccept={acceptInvitation}
              onDecline={declineInvitation}
              isCurrentUser={true}
            />
          ))
        ) : (
          <div className="text-center py-6">
            <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium mb-1">No pending invitations</p>
            <p className="text-sm text-gray-500">
              Match invitations from other players will appear here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
