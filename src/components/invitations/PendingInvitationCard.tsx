
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, MessageCircle, X, MapPin, Calendar } from 'lucide-react';
import { useUnifiedInvitations } from '@/hooks/useUnifiedInvitations';
import { toast } from 'sonner';

interface PendingInvitationCardProps {
  invitation: {
    id: string;
    inviter_id: string;
    invitee_name: string;
    invitation_type: string;
    invitation_category: 'match' | 'social_play';
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    message?: string;
    created_at: string;
    expires_at: string;
    session_data?: Record<string, any>;
  };
}

export const PendingInvitationCard: React.FC<PendingInvitationCardProps> = ({ invitation }) => {
  const { cancelInvitation } = useUnifiedInvitations();

  const handleCancel = async () => {
    try {
      await cancelInvitation(invitation.id);
      const successMessage = invitation.invitation_category === 'match'
        ? 'Match invitation canceled'
        : 'Social play invitation canceled';
      toast.success(successMessage);
    } catch (error) {
      console.error('Error canceling invitation:', error);
      toast.error('Failed to cancel invitation');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const isExpired = new Date() > new Date(invitation.expires_at);

  // Determine card styling based on invitation category
  const cardStyle = invitation.invitation_category === 'match' 
    ? "border-orange-200 bg-orange-50/50"
    : "border-amber-200 bg-amber-50/50";

  const iconColor = invitation.invitation_category === 'match'
    ? "text-orange-600"
    : "text-amber-600";

  const titleColor = invitation.invitation_category === 'match'
    ? "text-orange-800"
    : "text-amber-800";

  // Get invitation details based on type
  const getInvitationDetails = () => {
    if (invitation.invitation_category === 'match') {
      return {
        title: invitation.invitation_type === 'singles' ? 'Singles Match' : 'Doubles Match',
        subtitle: `Invited: ${invitation.invitee_name}`
      };
    } else {
      return {
        title: invitation.session_data?.eventTitle || 'Social Play Event',
        subtitle: `Invited: ${invitation.invitee_name}`
      };
    }
  };

  const details = getInvitationDetails();

  return (
    <Card className={cardStyle}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className={`h-5 w-5 ${iconColor}`} />
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
              <h4 className={`font-semibold ${titleColor}`}>
                {details.title}
              </h4>
              <p className="text-sm text-gray-600">
                {details.subtitle}
              </p>
            </div>
            <Badge 
              variant={isExpired ? 'destructive' : 'secondary'}
              className="capitalize"
            >
              {isExpired ? 'Expired' : invitation.status}
            </Badge>
          </div>

          {/* Show social play specific details */}
          {invitation.invitation_category === 'social_play' && invitation.session_data && (
            <div className="space-y-2">
              {invitation.session_data.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {invitation.session_data.location}
                </div>
              )}
              {invitation.session_data.scheduledTime && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {formatDate(invitation.session_data.scheduledTime)} at {formatTime(invitation.session_data.scheduledTime)}
                </div>
              )}
              {invitation.session_data.description && (
                <p className="text-sm text-gray-600">
                  {invitation.session_data.description}
                </p>
              )}
            </div>
          )}

          {/* Show match specific details */}
          {invitation.invitation_category === 'match' && invitation.session_data && (
            <div className="space-y-2">
              {invitation.session_data.startTime && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Proposed: {formatDate(invitation.session_data.startTime)} at {formatTime(invitation.session_data.startTime)}
                </div>
              )}
            </div>
          )}

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
