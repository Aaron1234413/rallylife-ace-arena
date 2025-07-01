
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvitationHeader } from './shared/InvitationHeader';
import { InvitationDetails } from './shared/InvitationDetails';
import { InvitationActions } from './shared/InvitationActions';
import { useInvitationStyles } from '@/hooks/useInvitationStyles';
import type { InvitationCardProps } from '@/types/invitation';

export const InvitationCard: React.FC<InvitationCardProps> = ({ invitation }) => {
  const styles = useInvitationStyles(invitation, 'received');

  return (
    <Card className={styles.cardStyle}>
      <CardHeader className="pb-3">
        <CardTitle>
          <InvitationHeader invitation={invitation} variant="received" />
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-hsl(var(--card)) rounded-lg border p-4">
          <InvitationDetails invitation={invitation} />
        </div>
        
        <InvitationActions invitation={invitation} variant="accept-decline" />
      </CardContent>
    </Card>
  );
};
