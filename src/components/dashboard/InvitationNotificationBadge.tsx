import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { useUnifiedInvitations } from '@/hooks/useUnifiedInvitations';

export const InvitationNotificationBadge: React.FC = () => {
  const { receivedInvitations, loading } = useUnifiedInvitations();
  
  const pendingCount = receivedInvitations.filter(
    invitation => invitation.status === 'pending' && new Date() <= new Date(invitation.expires_at)
  ).length;

  if (loading || pendingCount === 0) {
    return null;
  }

  return (
    <div className="relative">
      <Bell className="h-5 w-5 text-hsl(var(--tennis-yellow))" />
      <Badge 
        variant="destructive" 
        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
      >
        {pendingCount > 9 ? '9+' : pendingCount}
      </Badge>
    </div>
  );
};