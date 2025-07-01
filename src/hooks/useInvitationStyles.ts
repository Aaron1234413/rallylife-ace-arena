import { useMemo } from 'react';
import type { UnifiedInvitation } from '@/types/invitation';

export const useInvitationStyles = (invitation: UnifiedInvitation, variant: 'received' | 'sent' = 'received') => {
  return useMemo(() => {
    const isMatch = invitation.invitation_category === 'match';
    
    if (variant === 'received') {
      return {
        cardStyle: isMatch 
          ? "border-hsl(var(--tennis-green-accent)/20) bg-hsl(var(--tennis-green-subtle))"
          : "border-hsl(var(--tennis-green-medium)/20) bg-hsl(var(--tennis-green-bg))",
        iconColor: isMatch 
          ? "text-hsl(var(--tennis-green-accent))"
          : "text-hsl(var(--tennis-green-medium))",
        titleColor: isMatch 
          ? "text-hsl(var(--tennis-green-dark))"
          : "text-hsl(var(--tennis-green-dark))"
      };
    }
    
    // Sent invitations styling
    return {
      cardStyle: isMatch 
        ? "border-hsl(var(--tennis-yellow)/20) bg-hsl(var(--tennis-yellow-light)/10)"
        : "border-hsl(var(--tennis-yellow-dark)/20) bg-hsl(var(--tennis-yellow-light)/5)",
      iconColor: isMatch 
        ? "text-hsl(var(--tennis-yellow))"
        : "text-hsl(var(--tennis-yellow-dark))",
      titleColor: isMatch 
        ? "text-hsl(var(--tennis-green-dark))"
        : "text-hsl(var(--tennis-green-dark))"
    };
  }, [invitation.invitation_category, variant]);
};