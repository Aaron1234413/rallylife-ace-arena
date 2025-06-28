
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Inbox, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMatchInvitations } from '@/hooks/useMatchInvitations';
import { MatchInvitationCard } from './MatchInvitationCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const MatchInvitations: React.FC = () => {
  const { user } = useAuth();
  const { invitations, outgoingInvitations, loading, acceptInvitation, declineInvitation } = useMatchInvitations();

  console.log('🎾 [MatchInvitations Component] Render state:', {
    userLoggedIn: !!user,
    userId: user?.id,
    loading,
    incomingCount: invitations.length,
    outgoingCount: outgoingInvitations.length,
    invitations: invitations,
    outgoingInvitations: outgoingInvitations
  });

  if (!user) {
    console.log('🎾 [MatchInvitations Component] No user, not rendering');
    return null;
  }

  if (loading) {
    console.log('🎾 [MatchInvitations Component] Loading state');
    return (
      <Card className="border-tennis-green-light bg-gradient-to-r from-tennis-green-light/5 to-tennis-green-dark/5">
        <CardContent className="flex items-center justify-center py-6">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-gray-600">Loading invitations...</span>
        </CardContent>
      </Card>
    );
  }

  const hasIncomingInvitations = invitations.length > 0;
  const hasOutgoingInvitations = outgoingInvitations.length > 0;
  const hasAnyInvitations = hasIncomingInvitations || hasOutgoingInvitations;

  console.log('🎾 [MatchInvitations Component] Rendering with invitations:', {
    hasIncoming: hasIncomingInvitations,
    hasOutgoing: hasOutgoingInvitations,
    hasAny: hasAnyInvitations
  });

  return (
    <Card className="border-tennis-green-light bg-gradient-to-r from-tennis-green-light/5 to-tennis-green-dark/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-tennis-green-dark" />
            <span className="text-lg font-orbitron font-bold">Match Invitations</span>
          </div>
          {hasAnyInvitations && (
            <Badge variant="default" className="bg-tennis-green-dark text-white font-orbitron font-medium">
              {invitations.length + outgoingInvitations.length} total
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {hasAnyInvitations ? (
          <Tabs defaultValue="incoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="incoming" className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                Received
                {hasIncomingInvitations && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {invitations.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="outgoing" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Sent
                {hasOutgoingInvitations && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {outgoingInvitations.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="incoming" className="space-y-3 mt-4">
              {hasIncomingInvitations ? (
                invitations.map((invitation) => {
                  console.log('🎾 [MatchInvitations Component] Rendering incoming invitation card:', invitation);
                  return (
                    <MatchInvitationCard
                      key={invitation.id}
                      invitation={invitation}
                      onAccept={(id) => {
                        console.log('🎾 [MatchInvitations Component] Accept clicked for:', id);
                        acceptInvitation(id);
                      }}
                      onDecline={(id) => {
                        console.log('🎾 [MatchInvitations Component] Decline clicked for:', id);
                        declineInvitation(id);
                      }}
                      isCurrentUser={true}
                      isOutgoing={false}
                    />
                  );
                })
              ) : (
                <div className="text-center py-6">
                  <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-1">No pending invitations</p>
                  <p className="text-sm text-gray-500">
                    Match invitations from other players will appear here
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="outgoing" className="space-y-3 mt-4">
              {hasOutgoingInvitations ? (
                outgoingInvitations.map((invitation) => {
                  console.log('🎾 [MatchInvitations Component] Rendering outgoing invitation card:', invitation);
                  return (
                    <MatchInvitationCard
                      key={invitation.id}
                      invitation={invitation}
                      onAccept={() => {}} // No actions for outgoing invitations
                      onDecline={() => {}}
                      isCurrentUser={false}
                      isOutgoing={true}
                    />
                  );
                })
              ) : (
                <div className="text-center py-6">
                  <Send className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-1">No sent invitations</p>
                  <p className="text-sm text-gray-500">
                    Invitations you send will appear here with their status
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-6">
            <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium mb-1">No invitations</p>
            <p className="text-sm text-gray-500">
              Match invitations will appear here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
