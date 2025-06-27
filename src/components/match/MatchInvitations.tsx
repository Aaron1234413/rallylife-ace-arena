
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Inbox, Bug } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMatchInvitations } from '@/hooks/useMatchInvitations';
import { MatchInvitationCard } from './MatchInvitationCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const MatchInvitations: React.FC = () => {
  const { user } = useAuth();
  const { invitations, loading, acceptInvitation, declineInvitation } = useMatchInvitations();

  // Debug logging
  console.log('=== MatchInvitations Debug ===');
  console.log('Current user:', user);
  console.log('All invitations:', invitations);
  console.log('Loading state:', loading);

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
  
  // Debug logging for filtered results
  console.log('Received invitations for user:', receivedInvitations);
  console.log('User ID:', user.id);

  // Temporary debug display - REMOVE THIS AFTER DEBUGGING
  return (
    <Card className="border-tennis-green-light bg-gradient-to-r from-tennis-green-light/5 to-tennis-green-dark/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-red-500" />
            <span className="text-lg font-orbitron font-bold text-red-500">DEBUG: Match Invitations</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="bg-gray-100 p-3 rounded text-xs">
          <div><strong>User ID:</strong> {user.id}</div>
          <div><strong>User Email:</strong> {user.email}</div>
          <div><strong>Total Invitations:</strong> {invitations.length}</div>
          <div><strong>Received Invitations:</strong> {receivedInvitations.length}</div>
        </div>

        {invitations.length > 0 && (
          <div className="bg-blue-50 p-3 rounded text-xs">
            <div><strong>All Invitations Raw Data:</strong></div>
            <pre className="mt-2 text-xs overflow-x-auto">
              {JSON.stringify(invitations, null, 2)}
            </pre>
          </div>
        )}

        {receivedInvitations.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No pending invitations</p>
            <p className="text-xs text-red-500 mt-2">
              DEBUG: Found {invitations.length} total invitations, {receivedInvitations.length} for this user
            </p>
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
