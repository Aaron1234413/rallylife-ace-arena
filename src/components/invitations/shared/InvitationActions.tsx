import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { useUnifiedInvitations } from '@/hooks/useUnifiedInvitations';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { UnifiedInvitation, InvitationAction } from '@/types/invitation';

interface InvitationActionsProps {
  invitation: UnifiedInvitation;
  variant: 'accept-decline' | 'cancel';
}

export const InvitationActions: React.FC<InvitationActionsProps> = ({ invitation, variant }) => {
  const { acceptInvitation, declineInvitation, cancelInvitation } = useUnifiedInvitations();
  const navigate = useNavigate();

  const handleAction = async (action: InvitationAction) => {
    try {
      switch (action) {
        case 'accept':
          const result = await acceptInvitation(invitation.id);
          toast.success(getSuccessMessage(action, invitation.invitation_category));
          
          // Navigate to appropriate page after acceptance
          if (result?.navigationPath) {
            navigate(result.navigationPath);
          }
          break;
        case 'decline':
          await declineInvitation(invitation.id);
          toast.success(getSuccessMessage(action, invitation.invitation_category));
          break;
        case 'cancel':
          await cancelInvitation(invitation.id);
          toast.success(getSuccessMessage(action, invitation.invitation_category));
          break;
      }
    } catch (error) {
      console.error(`Error ${action}ing invitation:`, error);
      toast.error(`Failed to ${action} invitation`);
    }
  };

  const getSuccessMessage = (action: InvitationAction, category: string) => {
    const baseMessage = category === 'match' ? 'Match invitation' : 'Social play invitation';
    switch (action) {
      case 'accept':
        return category === 'match' 
          ? `${baseMessage} accepted! Starting match...`
          : `${baseMessage} accepted! Joining event...`;
      case 'decline':
        return `${baseMessage} declined`;
      case 'cancel':
        return `${baseMessage} canceled`;
    }
  };

  const isExpired = new Date() > new Date(invitation.expires_at);
  const isPending = invitation.status === 'pending' && !isExpired;

  if (!isPending) return null;

  if (variant === 'cancel') {
    return (
      <Button
        onClick={() => handleAction('cancel')}
        variant="outline"
        className="w-full"
        size="sm"
      >
        <X className="h-4 w-4 mr-2" />
        Cancel Invitation
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => handleAction('accept')}
        className="flex-1 bg-hsl(var(--hp-green)) hover:bg-hsl(var(--hp-green)/90) text-white"
        size="sm"
      >
        <Check className="h-4 w-4 mr-2" />
        Accept
      </Button>
      <Button
        onClick={() => handleAction('decline')}
        variant="outline"
        className="flex-1"
        size="sm"
      >
        <X className="h-4 w-4 mr-2" />
        Decline
      </Button>
    </div>
  );
};