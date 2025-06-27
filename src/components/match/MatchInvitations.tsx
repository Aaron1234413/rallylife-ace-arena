
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Check, X, Mail } from 'lucide-react';
import { useMatchInvitations } from '@/hooks/useMatchInvitations';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';

export const MatchInvitations = () => {
  const { 
    pendingInvitations, 
    loading, 
    respondToInvitation 
  } = useMatchInvitations();

  if (loading) {
    return (
      <Card className="border-tennis-green-light">
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner size="sm" />
        </CardContent>
      </Card>
    );
  }

  if (pendingInvitations.length === 0) {
    return null;
  }

  const handleResponse = async (invitationId: string, response: 'accepted' | 'declined') => {
    try {
      await respondToInvitation(invitationId, response);
    } catch (error) {
      console.error('Error responding to invitation:', error);
    }
  };

  const getInvitationTypeLabel = (type: string) => {
    switch (type) {
      case 'singles_opponent': return 'Singles Match';
      case 'doubles_partner': return 'Doubles Partner';
      case 'doubles_opponent_1': return 'Doubles Opponent';
      case 'doubles_opponent_2': return 'Doubles Opponent';
      default: return 'Match';
    }
  };

  const getInvitationRoleLabel = (type: string) => {
    switch (type) {
      case 'singles_opponent': return 'as opponent';
      case 'doubles_partner': return 'as your partner';
      case 'doubles_opponent_1': 
      case 'doubles_opponent_2': return 'as opponent';
      default: return '';
    }
  };

  return (
    <Card className="border-tennis-green-light bg-gradient-to-r from-tennis-green-light/5 to-tennis-green-dark/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="h-5 w-5 text-tennis-green-dark" />
          <span className="font-orbitron font-bold">Match Invitations</span>
          <Badge variant="secondary" className="text-xs font-orbitron font-bold">
            {pendingInvitations.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {pendingInvitations.map((invitation) => (
          <div
            key={invitation.id}
            className="bg-white rounded-lg border p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-tennis-green-dark" />
                  <Badge 
                    variant="outline" 
                    className="text-xs font-orbitron font-medium bg-tennis-green-light/10 border-tennis-green-light text-tennis-green-dark"
                  >
                    {getInvitationTypeLabel(invitation.invitation_type)}
                  </Badge>
                </div>
                
                <p className="text-sm font-medium mb-1">
                  <span className="font-semibold">{invitation.inviter_id}</span> invited you to play {getInvitationRoleLabel(invitation.invitation_type)}
                </p>
                
                {invitation.message && (
                  <p className="text-sm text-gray-600 mb-2 italic">
                    "{invitation.message}"
                  </p>
                )}
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>Expires {format(new Date(invitation.expires_at), 'MMM d, h:mm a')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => handleResponse(invitation.id, 'accepted')}
                size="sm"
                className="flex-1 bg-tennis-green-dark hover:bg-tennis-green text-white font-orbitron font-semibold"
              >
                <Check className="h-4 w-4 mr-2" />
                Accept
              </Button>
              <Button
                onClick={() => handleResponse(invitation.id, 'declined')}
                variant="outline"
                size="sm"
                className="flex-1 font-orbitron font-medium"
              >
                <X className="h-4 w-4 mr-2" />
                Decline
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
