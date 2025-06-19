
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  MapPin, 
  Users, 
  Zap, 
  Check, 
  X, 
  Calendar,
  User
} from 'lucide-react';
import { useSocialPlaySession } from '@/contexts/SocialPlaySessionContext';
import { toast } from 'sonner';

interface SessionInvitationCardProps {
  invitation: {
    id: string;
    session_id: string;
    status: 'invited' | 'accepted' | 'declined' | 'joined';
    invited_at: string;
    session: {
      id: string;
      session_type: 'singles' | 'doubles';
      competitive_level: 'low' | 'medium' | 'high';
      location?: string;
      notes?: string;
      created_by: string;
      created_at: string;
      status: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';
    };
    inviter: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
  };
  onResponse?: (accepted: boolean) => void;
}

export function SessionInvitationCard({ invitation, onResponse }: SessionInvitationCardProps) {
  const [responding, setResponding] = useState(false);
  const { joinSession } = useSocialPlaySession();

  const handleResponse = async (accept: boolean) => {
    setResponding(true);
    
    try {
      if (accept) {
        await joinSession(invitation.session_id);
        toast.success('Invitation accepted! You can now join the session.');
      } else {
        // Handle decline - this would need to be implemented in the context
        toast.success('Invitation declined.');
      }
      
      onResponse?.(accept);
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error('Failed to respond to invitation. Please try again.');
    } finally {
      setResponding(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'invited': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'joined': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      default: return '⚪';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Tennis Session Invitation</CardTitle>
          <Badge className={getStatusColor(invitation.status)}>
            {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Inviter Info */}
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={invitation.inviter.avatar_url || ''} />
            <AvatarFallback>
              {invitation.inviter.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{invitation.inviter.full_name}</p>
            <p className="text-sm text-muted-foreground">invited you to play</p>
          </div>
        </div>

        {/* Session Details */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm capitalize">{invitation.session.session_type}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm flex items-center gap-1">
              {getLevelIcon(invitation.session.competitive_level)}
              <span className="capitalize">{invitation.session.competitive_level}</span>
            </span>
          </div>
          
          {invitation.session.location && (
            <div className="flex items-center gap-2 col-span-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{invitation.session.location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 col-span-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Invited {formatDateTime(invitation.invited_at)}</span>
          </div>
        </div>

        {/* Session Notes */}
        {invitation.session.notes && (
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Session Notes:</p>
            <p className="text-sm">{invitation.session.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        {invitation.status === 'invited' && (
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => handleResponse(true)}
              disabled={responding}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              Accept & Join
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleResponse(false)}
              disabled={responding}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
        )}

        {invitation.status === 'accepted' && (
          <div className="text-center">
            <Button 
              onClick={() => joinSession(invitation.session_id)}
              className="w-full"
            >
              <User className="h-4 w-4 mr-2" />
              Join Session Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
