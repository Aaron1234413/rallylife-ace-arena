
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Mail, MailOpen, RefreshCw, Inbox, AlertTriangle } from 'lucide-react';
import { useInvitations } from '@/hooks/useInvitations';
import { InvitationCard } from './InvitationCard';
import { PendingInvitationCard } from './PendingInvitationCard';

export const InvitationsWidget: React.FC = () => {
  const { 
    receivedInvitations, 
    sentInvitations, 
    loading, 
    error,
    refreshInvitations 
  } = useInvitations();

  const [activeTab, setActiveTab] = useState('received');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshInvitations();
    } catch (error) {
      console.error('Error refreshing invitations:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Group invitations by category
  const matchInvitations = {
    received: receivedInvitations.filter(inv => inv.invitation_category === 'match'),
    sent: sentInvitations.filter(inv => inv.invitation_category === 'match')
  };

  const socialPlayInvitations = {
    received: receivedInvitations.filter(inv => inv.invitation_category === 'social_play'),
    sent: sentInvitations.filter(inv => inv.invitation_category === 'social_play')
  };

  const totalReceived = receivedInvitations.length;
  const totalSent = sentInvitations.length;

  if (error && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Invitations Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading && !receivedInvitations.length && !sentInvitations.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invitations
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Received
              {totalReceived > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {totalReceived}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <MailOpen className="h-4 w-4" />
              Sent
              {totalSent > 0 && (
                <Badge variant="outline" className="ml-1">
                  {totalSent}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {error && (
              <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                {error} - Some invitations may not be displayed.
              </div>
            )}
            
            {totalReceived === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Inbox className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No pending invitations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Match Invitations */}
                {matchInvitations.received.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                      <Users className="h-4 w-4" />
                      Match Invitations ({matchInvitations.received.length})
                    </div>
                    {matchInvitations.received.map((invitation) => (
                      <InvitationCard
                        key={invitation.id}
                        invitation={invitation}
                      />
                    ))}
                  </div>
                )}

                {/* Social Play Invitations */}
                {socialPlayInvitations.received.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-purple-700">
                      <Users className="h-4 w-4" />
                      Social Play Invitations ({socialPlayInvitations.received.length})
                    </div>
                    {socialPlayInvitations.received.map((invitation) => (
                      <InvitationCard
                        key={invitation.id}
                        invitation={invitation}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {error && (
              <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                {error} - Some invitations may not be displayed.
              </div>
            )}
            
            {totalSent === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MailOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No pending sent invitations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Match Invitations */}
                {matchInvitations.sent.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-orange-700">
                      <Users className="h-4 w-4" />
                      Match Invitations ({matchInvitations.sent.length})
                    </div>
                    {matchInvitations.sent.map((invitation) => (
                      <PendingInvitationCard
                        key={invitation.id}
                        invitation={invitation}
                      />
                    ))}
                  </div>
                )}

                {/* Social Play Invitations */}
                {socialPlayInvitations.sent.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
                      <Users className="h-4 w-4" />
                      Social Play Invitations ({socialPlayInvitations.sent.length})
                    </div>
                    {socialPlayInvitations.sent.map((invitation) => (
                      <PendingInvitationCard
                        key={invitation.id}
                        invitation={invitation}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
