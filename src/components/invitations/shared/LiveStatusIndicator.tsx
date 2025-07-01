import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Timer } from 'lucide-react';
import type { UnifiedInvitation } from '@/types/invitation';

interface LiveStatusIndicatorProps {
  invitation: UnifiedInvitation;
  showAnimation?: boolean;
}

export const LiveStatusIndicator: React.FC<LiveStatusIndicatorProps> = ({ 
  invitation, 
  showAnimation = true 
}) => {
  const getStatusDisplay = () => {
    const isExpired = new Date() > new Date(invitation.expires_at);
    
    if (isExpired) {
      return {
        icon: Timer,
        text: 'Expired',
        variant: 'secondary' as const,
        className: 'text-hsl(var(--muted-foreground)) border-hsl(var(--muted-foreground)/30)',
      };
    }

    switch (invitation.status) {
      case 'pending':
        return {
          icon: Clock,
          text: 'Pending',
          variant: 'outline' as const,
          className: `text-hsl(var(--tennis-yellow)) border-hsl(var(--tennis-yellow)/30) ${
            showAnimation ? 'animate-pulse' : ''
          }`,
        };
      case 'accepted':
        return {
          icon: CheckCircle,
          text: 'Accepted',
          variant: 'secondary' as const,
          className: 'text-hsl(var(--hp-green)) border-hsl(var(--hp-green)/30) bg-hsl(var(--hp-green)/10)',
        };
      case 'declined':
        return {
          icon: XCircle,
          text: 'Declined',
          variant: 'secondary' as const,
          className: 'text-hsl(var(--tennis-red)) border-hsl(var(--tennis-red)/30) bg-hsl(var(--tennis-red)/10)',
        };
      default:
        return {
          icon: Clock,
          text: 'Unknown',
          variant: 'secondary' as const,
          className: 'text-hsl(var(--muted-foreground))',
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <Badge 
      variant={statusDisplay.variant}
      className={`flex items-center gap-1 ${statusDisplay.className}`}
    >
      <StatusIcon className="h-3 w-3" />
      {statusDisplay.text}
    </Badge>
  );
};