
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, MessageCircle, X } from 'lucide-react';
import { useMatchInvitations } from '@/hooks/useMatchInvitations';
import { toast } from 'sonner';

interface PendingInvitationCardProps {
  invitation: {
    id: string;
    inviter_id: string;
    invitee_name: string;
    invitation_type: string;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    message?: string;
    created_at: string;
    expires_at: string;
  };
}

export const PendingInvitationCard: React.FC<PendingInvitationCardProps> = ({ invitation }) => {
  const { cancelInvitation } = useMatchInvitations();

  const handleCancel = async () => {
    try {
      await cancelInvitation(invitation.id);
      toast.success('Match invitation canceled');
    } catch (error) {
      console.error('Error canceling invitation:', error);
      toast.error('Failed to cancel invitation');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isExpired = new Date() > new Date(invitation.expires_at);

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            <span className="text-lg">Pending Invitation</span>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(invitation.created_at)}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-orange-800">
                {invitation.invitation_type === 'singles' ? 'Singles Match' : 'Doubles Match'}
              </h4>
              <p className="text-sm text-gray-600">
                Invited: {invitation.invitee_name}
              </p>
            </div>
            <Badge 
              variant={isExpired ? 'destructive' : 'secondary'}
              className="capitalize"
            >
              {isExpired ? 'Expired' : invitation.status}
            </Badge>
          </div>

          {invitation.message && (
            <div className="bg-gray-50 rounded p-3">
              <div className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 text-gray-500 mt-0.5" />
                <p className="text-sm text-gray-700">{invitation.message}</p>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Expires: {formatTime(invitation.expires_at)}
          </div>
        </div>

        {invitation.status === 'pending' && !isExpired && (
          <Button
            onClick={handleCancel}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel Invitation
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
