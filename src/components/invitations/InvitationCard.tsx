import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, MessageCircle, Check, X, MapPin, Calendar, Coins, Zap, Trophy } from 'lucide-react';
import { useUnifiedInvitations } from '@/hooks/useUnifiedInvitations';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface InvitationCardProps {
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
    stakes_tokens?: number;
    stakes_premium_tokens?: number;
    is_challenge?: boolean;
  };
}

export const InvitationCard: React.FC<InvitationCardProps> = ({ invitation }) => {
  const { acceptInvitation, declineInvitation } = useUnifiedInvitations();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    try {
      setIsProcessing(true);
      console.log('🎾 [INVITATION] Accepting invitation:', invitation.id);
      
      const result = await acceptInvitation(invitation.id);
      console.log('✅ [INVITATION] Invitation accepted successfully:', result);
      
      // Navigate based on invitation type
      if (invitation.invitation_category === 'match') {
        // If it's a match invitation, navigate to the active match or dashboard
        navigate('/dashboard');
        toast.success('Match invitation accepted! Match has started.');
      } else {
        // If it's a social play invitation, navigate to dashboard
        navigate('/dashboard');
        toast.success('Social play invitation accepted!');
      }
    } catch (error) {
      console.error('❌ [INVITATION] Error accepting invitation:', error);
      toast.error('Failed to accept invitation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    try {
      setIsProcessing(true);
      console.log('❌ [INVITATION] Declining invitation:', invitation.id);
      
      await declineInvitation(invitation.id);
      console.log('✅ [INVITATION] Invitation declined successfully');
      
      toast.success('Invitation declined');
    } catch (error) {
      console.error('❌ [INVITATION] Error declining invitation:', error);
      toast.error('Failed to decline invitation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Existing functions for formatting time and date
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
    ? "border-blue-200 bg-blue-50/50"
    : "border-purple-200 bg-purple-50/50";

  const iconColor = invitation.invitation_category === 'match'
    ? "text-blue-600"
    : "text-purple-600";

  const titleColor = invitation.invitation_category === 'match'
    ? "text-blue-800"
    : "text-purple-800";

  // Get invitation details based on type
  const getInvitationDetails = () => {
    if (invitation.invitation_category === 'match') {
      return {
        title: invitation.invitation_type === 'singles' ? 'Singles Match' : 'Doubles Match',
        subtitle: `From: ${invitation.invitee_name}`
      };
    } else {
      return {
        title: invitation.session_data?.eventTitle || 'Social Play Event',
        subtitle: `From: ${invitation.invitee_name}`
      };
    }
  };

  const details = getInvitationDetails();

  return (
    <Card className={cardStyle}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {invitation.invitation_category === 'match' ? (
              <Trophy className={`h-5 w-5 ${iconColor}`} />
            ) : (
              <Users className={`h-5 w-5 ${iconColor}`} />
            )}
            <span className="text-lg">Match Invitation</span>
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

          {/* Stakes Display for Challenges */}
          {invitation.is_challenge && (invitation.stakes_tokens! > 0 || invitation.stakes_premium_tokens! > 0) && (
            <div className="bg-orange-50 border border-orange-200 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Challenge Stakes</span>
              </div>
              <div className="space-y-1">
                {invitation.stakes_tokens! > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Coins className="h-3 w-3 text-yellow-500" />
                    <span>{invitation.stakes_tokens} Regular Tokens</span>
                  </div>
                )}
                {invitation.stakes_premium_tokens! > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Coins className="h-3 w-3 text-purple-500" />
                    <span>{invitation.stakes_premium_tokens} Premium Tokens</span>
                  </div>
                )}
                <p className="text-xs text-orange-700 mt-1">
                  {invitation.invitation_category === 'match' ? 'Winner takes all tokens' : 'Entry fee for premium session'}
                </p>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Expires: {formatTime(invitation.expires_at)}
          </div>
        </div>

        {invitation.status === 'pending' && !isExpired && (
          <div className="flex gap-2">
            <Button
              onClick={handleAccept}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={isProcessing}
            >
              <Check className="h-4 w-4 mr-2" />
              {isProcessing ? 'Accepting...' : 'Accept'}
            </Button>
            <Button
              onClick={handleDecline}
              variant="outline"
              className="flex-1"
              disabled={isProcessing}
            >
              <X className="h-4 w-4 mr-2" />
              {isProcessing ? 'Declining...' : 'Decline'}
            </Button>
          </div>
        )}

        {invitation.status === 'accepted' && (
          <div className="text-center py-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Check className="h-3 w-3 mr-1" />
              Accepted
            </Badge>
          </div>
        )}

        {invitation.status === 'declined' && (
          <div className="text-center py-2">
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              <X className="h-3 w-3 mr-1" />
              Declined
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
