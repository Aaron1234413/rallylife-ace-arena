
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Mail, RefreshCw } from 'lucide-react';
import { useUnifiedInvitations } from '@/hooks/useUnifiedInvitations';
import { InvitationTabs } from './widgets/InvitationTabs';
import { InvitationList } from './widgets/InvitationList';
import { EmptyInvitationState } from './widgets/EmptyInvitationState';
import { ErrorState } from './widgets/ErrorState';
import { LoadingState } from './widgets/LoadingState';
import { groupInvitationsByCategory } from '@/utils/invitationHelpers';

export const InvitationsWidget: React.FC = () => {
  const { 
    receivedInvitations, 
    sentInvitations, 
    loading, 
    error,
    refreshInvitations 
  } = useUnifiedInvitations();

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

  const invitationStats = groupInvitationsByCategory(receivedInvitations, sentInvitations);

  if (error && !loading) {
    return <ErrorState error={error} onRetry={handleRefresh} />;
  }

  if (loading && !receivedInvitations.length && !sentInvitations.length) {
    return <LoadingState />;
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
        <InvitationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          totalReceived={invitationStats.totalReceived}
          totalSent={invitationStats.totalSent}
        />

        <TabsContent value="received" className="space-y-4">
          {error && (
            <div className="text-sm text-hsl(var(--tennis-yellow)) bg-hsl(var(--tennis-yellow-light)/20) p-2 rounded">
              {error} - Some invitations may not be displayed.
            </div>
          )}
          
          {invitationStats.totalReceived === 0 ? (
            <EmptyInvitationState variant="received" />
          ) : (
            <div className="space-y-4">
              <InvitationList
                invitations={invitationStats.matchInvitations.received}
                category="match"
                variant="received"
                categoryName="Match Invitations"
              />
              <InvitationList
                invitations={invitationStats.socialPlayInvitations.received}
                category="social_play"
                variant="received"
                categoryName="Social Play Invitations"
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {error && (
            <div className="text-sm text-hsl(var(--tennis-yellow)) bg-hsl(var(--tennis-yellow-light)/20) p-2 rounded">
              {error} - Some invitations may not be displayed.
            </div>
          )}
          
          {invitationStats.totalSent === 0 ? (
            <EmptyInvitationState variant="sent" />
          ) : (
            <div className="space-y-4">
              <InvitationList
                invitations={invitationStats.matchInvitations.sent}
                category="match"
                variant="sent"
                categoryName="Match Invitations"
              />
              <InvitationList
                invitations={invitationStats.socialPlayInvitations.sent}
                category="social_play"
                variant="sent"
                categoryName="Social Play Invitations"
              />
            </div>
          )}
        </TabsContent>
      </CardContent>
    </Card>
  );
};
